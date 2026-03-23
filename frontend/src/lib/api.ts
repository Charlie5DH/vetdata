import axios, { AxiosHeaders } from "axios";

import { frontendEnv } from "@/lib/env";

type AccessTokenProvider = (() => Promise<string | null>) | null;

let accessTokenProvider: AccessTokenProvider = null;

export function setApiAccessTokenProvider(provider: AccessTokenProvider) {
  accessTokenProvider = provider;
}

export const api = axios.create({
  baseURL: frontendEnv.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = accessTokenProvider ? await accessTokenProvider() : null;

  config.headers = AxiosHeaders.from(config.headers);

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else {
    config.headers.delete("Authorization");
  }

  return config;
});
