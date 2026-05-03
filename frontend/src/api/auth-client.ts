import axios from "axios";

import { frontendEnv } from "@/lib/env";
import type { AppUser } from "@/types";

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
};

const authAxios = axios.create({
  baseURL: frontendEnv.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<TokenPair> {
  const { data } = await authAxios.post<TokenPair>("/auth/login", {
    email,
    password,
  });
  return data;
}

export type RegisterPayload = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  crmv?: string | null;
};

export async function registerAccount(payload: RegisterPayload): Promise<TokenPair> {
  const { data } = await authAxios.post<TokenPair>("/auth/register", payload);
  return data;
}

export async function loginWithGoogleIdToken(idToken: string): Promise<TokenPair> {
  const { data } = await authAxios.post<TokenPair>("/auth/google", {
    id_token: idToken,
  });
  return data;
}

export async function refreshSession(refreshToken: string): Promise<TokenPair> {
  const { data } = await authAxios.post<TokenPair>("/auth/refresh", {
    refresh_token: refreshToken,
  });
  return data;
}

export async function logoutSession(refreshToken: string): Promise<void> {
  await authAxios.post("/auth/logout", { refresh_token: refreshToken });
}

export async function fetchAuthenticatedUser(accessToken: string): Promise<AppUser> {
  const { data } = await authAxios.get<AppUser>("/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return data;
}
