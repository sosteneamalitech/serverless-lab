import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { CognitoIdentityProviderClient, AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const ses = new SESClient({});
const cognito = new CognitoIdentityProviderClient({});

async function isActiveUser(email) {
  try {
    const user = await cognito.send(
      new AdminGetUserCommand({ UserPoolId: process.env.USER_POOL_ID, Username: email })
    );
    return !!user.Enabled;
  } catch {
    return false;
  }
}

async function notify(to, subject, body) {
  if (!to || !(await isActiveUser(to))) return;
  await ses.send(
    new SendEmailCommand({
      Source: process.env.SES_SENDER_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: { Subject: { Data: subject }, Body: { Text: { Data: body } } },
    })
  );
}

export const handler = async (event) => {
  for (const record of event.Records) {
    if (record.eventName !== "INSERT" && record.eventName !== "MODIFY") continue;

    const newImage = record.dynamodb.NewImage ? unmarshall(record.dynamodb.NewImage) : null;
    const oldImage = record.dynamodb.OldImage ? unmarshall(record.dynamodb.OldImage) : null;
    if (!newImage) continue;

    const oldAssigned = oldImage?.assignedTo || [];
    const newAssigned = newImage.assignedTo || [];
    const newlyAssigned = newAssigned.filter((m) => !oldAssigned.includes(m));

    if (newlyAssigned.length > 0) {
      const assignedBy = newImage.assignedBy || "an admin";
      await Promise.all(
        newlyAssigned.map((member) =>
          notify(
            member,
            `[Task Board] You were assigned: "${newImage.title}"`,
            `${assignedBy} assigned you to "${newImage.title}".\n\n` +
              (newImage.description ? `${newImage.description}\n\n` : "") +
              `Status: ${newImage.status}`
          )
        )
      );
    }

    const statusChanged = oldImage && oldImage.status !== newImage.status;
    if (statusChanged) {
      const changedBy = newImage.updatedBy || "someone";
      const recipients = new Set(newAssigned);
      if (newImage.createdBy) recipients.add(newImage.createdBy);
      await Promise.all(
        [...recipients].map((recipient) => {
          const isTheChanger = recipient === changedBy;
          const who = isTheChanger ? "You" : changedBy;
          return notify(
            recipient,
            `[Task Board] "${newImage.title}" is now ${newImage.status}`,
            `${who} changed the status of "${newImage.title}" from ${oldImage.status} to ${newImage.status}.`
          );
        })
      );
    }
  }
};
