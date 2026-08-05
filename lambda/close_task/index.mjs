import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function getGroups(event) {
  const raw = event.requestContext?.authorizer?.jwt?.claims?.["cognito:groups"] || "";
  if (Array.isArray(raw)) return raw;
  return raw.replace(/[[\]]/g, "").split(",").map((g) => g.trim()).filter(Boolean);
}

export const handler = async (event) => {
  if (!getGroups(event).includes("Admin")) {
    return { statusCode: 403, body: JSON.stringify({ message: "Only admins can close tasks" }) };
  }

  const taskId = event.pathParameters?.taskId;
  if (!taskId) {
    return { statusCode: 400, body: JSON.stringify({ message: "taskId is required" }) };
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: process.env.TASKS_TABLE,
        Key: { taskId },
        ConditionExpression: "attribute_exists(taskId)",
        UpdateExpression: "SET #status = :status, updatedAt = :now",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": "CLOSED", ":now": new Date().toISOString() },
        ReturnValues: "ALL_NEW",
      })
    );
    return { statusCode: 200, body: JSON.stringify(result.Attributes) };
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      return { statusCode: 404, body: JSON.stringify({ message: "Task not found" }) };
    }
    throw err;
  }
};
