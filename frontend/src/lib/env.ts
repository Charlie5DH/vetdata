function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const frontendEnv = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  clerkPublishableKey: requireEnv(
    "VITE_CLERK_PUBLISHABLE_KEY",
    import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
  ),
};
