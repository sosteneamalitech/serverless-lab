import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function getGroups(event) {
  const raw = event.requestContext?.authorizer?.jwt?.claims?.["cognito:groups"] || "";
  if (Array.isArray(raw)) return raw;
  return raw.replace(/[[\]]/g, "").split(",").map((g) => g.trim()).filter(Boolean);
}

export const handler = async (event) => {
  if (!getGroups(event).includes("Admin")) {
    return { statusCode: 403, body: JSON.stringify({ message: "Only admins can create tasks" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ message: "Invalid JSON body" }) };
  }

  if (!body.title) {
    return { statusCode: 400, body: JSON.stringify({ message: "title is required" }) };
  }

  const claims = event.requestContext?.authorizer?.jwt?.claims || {};
  const now = new Date().toISOString();
  const task = {
    taskId: randomUUID(),
    title: body.title,
    description: body.description || "",
    status: "OPEN",
    createdBy: claims.email || claims.sub,
    assignedTo: [],
    createdAt: now,
    updatedAt: now,
  };

  await ddb.send(
    new PutCommand({
      TableName: process.env.TASKS_TABLE,
      Item: task,
      ConditionExpression: "attribute_not_exists(taskId)",
    })
  );

  return { statusCode: 201, body: JSON.stringify(task) };
};
