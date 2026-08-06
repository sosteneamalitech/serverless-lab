import {
  CognitoIdentityProviderClient,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { SESClient, VerifyEmailIdentityCommand } from "@aws-sdk/client-ses";

const cognito = new CognitoIdentityProviderClient({});
const ses = new SESClient({});

export const handler = async (event) => {
  await cognito.send(
    new AdminAddUserToGroupCommand({
      UserPoolId: event.userPoolId,
      Username: event.userName,
      GroupName: process.env.MEMBER_GROUP_NAME,
    })
  );

  const email = event.request.userAttributes.email;
  if (email) {
    await ses.send(new VerifyEmailIdentityCommand({ EmailAddress: email }));
  }

  return event;
};
