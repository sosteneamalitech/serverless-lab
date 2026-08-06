import { CognitoIdentityProviderClient, ListUsersInGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

const cognito = new CognitoIdentityProviderClient({});

function getGroups(event) {
  const raw = event.requestContext?.authorizer?.jwt?.claims?.["cognito:groups"] || "";
  if (Array.isArray(raw)) return raw;
  return raw.replace(/[[\]]/g, "").split(",").map((g) => g.trim()).filter(Boolean);
}

function attr(user, name) {
  return user.Attributes?.find((a) => a.Name === name)?.Value;
}

export const handler = async (event) => {
  if (!getGroups(event).includes("Admin")) {
    return { statusCode: 403, body: JSON.stringify({ message: "Only admins can list members" }) };
  }

  const members = [];
  let paginationToken;
  do {
    const page = await cognito.send(
      new ListUsersInGroupCommand({
        UserPoolId: process.env.USER_POOL_ID,
        GroupName: process.env.MEMBER_GROUP_NAME,
        NextToken: paginationToken,
      })
    );
    for (const user of page.Users || []) {
      const email = attr(user, "email") || user.Username;
      members.push({
        username: email,
        email,
        enabled: user.Enabled,
      });
    }
    paginationToken = page.NextToken;
  } while (paginationToken);

  return { statusCode: 200, body: JSON.stringify(members) };
};
