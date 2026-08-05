import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const cognito = new CognitoIdentityProviderClient({});

function getGroups(event) {
  const raw = event.requestContext?.authorizer?.jwt?.claims?.["cognito:groups"] || "";
  if (Array.isArray(raw)) return raw;
  return raw.replace(/[[\]]/g, "").split(",").map((g) => g.trim()).filter(Boolean);
}

export const handler = async (event) => {
  if (!getGroups(event).includes("Admin")) {
    return { statusCode: 403, body: JSON.stringify({ message: "Only admins can assign tasks" }) };
  }

  const taskId = event.pathParameters?.taskId;
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON body" }) };
  }

  const memberId = body.memberId;
  if (!taskId || !memberId) {
    return { statusCode: 400, body: JSON.stringify({ message: "taskId and memberId are required" }) };
  }

  const user = await cognito.send(
    new AdminGetUserCommand({ UserPoolId: process.env.USER_POOL_ID, Username: memberId })
  );
  if (!user.Enabled) {
    return { statusCode: 409, body: JSON.stringify({ message: "Target user is deactivated" }) };
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: process.env.TASKS_TABLE,
        Key: { taskId },
        ConditionExpression:
          "attribute_exists(taskId) AND (attribute_not_exists(assignedTo) OR NOT contains(assignedTo, :memberId))",
        UpdateExpression: "SET assignedTo = list_append(if_not_exists(assignedTo, :empty), :newMember), updatedAt = :now",
        ExpressionAttributeValues: {
          ":memberId": memberId,
          ":empty": [],
          ":newMember": [memberId],
          ":now": new Date().toISOString(),
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return { statusCode: 200, body: JSON.stringify(result.Attributes) };
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Task not found, or member is already assigned" }),
      };
    }
    throw err;
  }
};
