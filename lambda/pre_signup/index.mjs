export const handler = async (event) => {
  const allowedDomains = (process.env.ALLOWED_EMAIL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  const email = event.request.userAttributes.email || "";
  const domain = email.split("@")[1]?.toLowerCase();

  if (!domain || !allowedDomains.includes(domain)) {
    throw new Error(`Signup rejected: email domain "${domain}" is not allowed`);
  }

  return event;
};
