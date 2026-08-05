import { useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

export function useUserGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthSession()
      .then((session) => {
        const raw = session.tokens?.idToken?.payload?.["cognito:groups"] || [];
        setGroups(Array.isArray(raw) ? raw : []);
      })
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading };
}
