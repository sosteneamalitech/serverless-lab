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
    return { statusCode: 403, body: JSON.stringify({ message: "Only admins can update tasks" }) };
  }

  const taskId = event.pathParameters?.taskId;
  if (!taskId) {
    return { statusCode: 400, body: JSON.stringify({ message: "taskId is required" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON body" }) };
  }

  const claims = event.requestContext?.authorizer?.jwt?.claims || {};
  const callerId = claims.email || claims.sub;

  const names = {};
  const values = { ":now": new Date().toISOString(), ":updatedBy": callerId };
  const sets = ["updatedAt = :now", "updatedBy = :updatedBy"];

  if (body.title !== undefined) {
    names["#title"] = "title";
    values[":title"] = body.title;
    sets.push("#title = :title");
  }
  if (body.description !== undefined) {
    values[":description"] = body.description;
    sets.push("description = :description");
  }
  if (body.status !== undefined) {
    names["#status"] = "status";
    values[":status"] = body.status;
    sets.push("#status = :status");
  }

  if (sets.length === 2) {
    return { statusCode: 400, body: JSON.stringify({ message: "Nothing to update" }) };
  }

  try {
    const result = await ddb.send(
      new UpdateCommand({
        TableName: process.env.TASKS_TABLE,
        Key: { taskId },
        ConditionExpression: "attribute_exists(taskId)",
        UpdateExpression: `SET ${sets.join(", ")}`,
        ExpressionAttributeNames: Object.keys(names).length ? names : undefined,
        ExpressionAttributeValues: values,
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
