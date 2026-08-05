import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const MEMBER_STATUSES = ["OPEN", "IN_PROGRESS", "DONE"];

function getGroups(event) {
  const raw = event.requestContext?.authorizer?.jwt?.claims?.["cognito:groups"] || "";
  if (Array.isArray(raw)) return raw;
  return raw.replace(/[[\]]/g, "").split(",").map((g) => g.trim()).filter(Boolean);
}

export const handler = async (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};
  const isAdmin = getGroups(event).includes("Admin");
  const callerId = claims.email || claims.sub;
  const taskId = event.pathParameters?.taskId;

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON body" }) };
  }

  if (!taskId || !body.status) {
    return { statusCode: 400, body: JSON.stringify({ message: "taskId and status are required" }) };
  }
  if (!isAdmin && !MEMBER_STATUSES.includes(body.status)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: `status must be one of ${MEMBER_STATUSES.join(", ")}` }),
    };
  }

  if (!isAdmin) {
    const task = await ddb.send(new GetCommand({ TableName: process.env.TASKS_TABLE, Key: { taskId } }));
    if (!task.Item) {
      return { statusCode: 404, body: JSON.stringify({ message: "Task not found" }) };
    }
    if (!(task.Item.assignedTo || []).includes(callerId)) {
      return { statusCode: 403, body: JSON.stringify({ message: "You are not assigned to this task" }) };
    }
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: process.env.TASKS_TABLE,
        Key: { taskId },
        ConditionExpression: "attribute_exists(taskId)",
        UpdateExpression: "SET #status = :status, updatedAt = :now",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: { ":status": body.status, ":now": new Date().toISOString() },
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
