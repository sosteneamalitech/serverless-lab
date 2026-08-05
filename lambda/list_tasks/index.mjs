import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

function getGroups(event) {
  const raw = event.requestContext?.authorizer?.jwt?.claims?.["cognito:groups"] || "";
  if (Array.isArray(raw)) return raw;
  return raw.replace(/[[\]]/g, "").split(",").map((g) => g.trim()).filter(Boolean);
}

export const handler = async (event) => {
  const claims = event.requestContext?.authorizer?.jwt?.claims || {};

  if (getGroups(event).includes("Admin")) {
    const result = await ddb.send(new ScanCommand({ TableName: process.env.TASKS_TABLE }));
    return { statusCode: 200, body: JSON.stringify(result.Items || []) };
  }

  const callerId = claims.email || claims.sub;
  const result = await ddb.send(
    new ScanCommand({
      TableName: process.env.TASKS_TABLE,
      FilterExpression: "contains(assignedTo, :callerId)",
      ExpressionAttributeValues: { ":callerId": callerId },
    })
  );
  return { statusCode: 200, body: JSON.stringify(result.Items || []) };
};
