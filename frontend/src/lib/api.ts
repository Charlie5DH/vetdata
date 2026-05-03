import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";

import { frontendEnv } from "@/lib/env";

type AccessTokenProvider =
  | (() => Promise<string | null> | string | null)
  | null;

type RefreshHandler = (() => Promise<string | null>) | null;

let accessTokenProvider: AccessTokenProvider = null;
let refreshHandler: RefreshHandler = null;
let onAuthFailure: (() => void) | null = null;

export function setApiAccessTokenProvider(provider: AccessTokenProvider) {
  accessTokenProvider = provider;
}

export function setApiRefreshHandler(handler: RefreshHandler) {
  refreshHandler = handler;
}

export function setApiAuthFailureHandler(handler: (() => void) | null) {
  onAuthFailure = handler;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetriableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retried &&
      refreshHandler &&
      !originalConfig.url?.startsWith("/auth/")
    ) {
      originalConfig._retried = true;
      const newAccessToken = await refreshHandler();
      if (newAccessToken) {
        const headers = AxiosHeaders.from(originalConfig.headers);
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        originalConfig.headers = headers;
        return api.request(originalConfig);
      }
      onAuthFailure?.();
    }

    throw error;
  },
);
