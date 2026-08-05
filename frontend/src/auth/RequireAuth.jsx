import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function RequireAuth({ children }) {
  return <Authenticator>{({ signOut, user }) => children({ signOut, user })}</Authenticator>;
}
