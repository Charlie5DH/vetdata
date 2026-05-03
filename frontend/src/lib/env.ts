export const frontendEnv = {
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  googleOauthClientId:
    (import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID as string | undefined) ?? null,
};
