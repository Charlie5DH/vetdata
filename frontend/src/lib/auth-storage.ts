const ACCESS_TOKEN_KEY = "vetdata.access_token";
const REFRESH_TOKEN_KEY = "vetdata.refresh_token";
const ACCESS_EXPIRES_AT_KEY = "vetdata.access_expires_at";

export type StoredAuthSession = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: number;
};

function safeStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readAuthSession(): StoredAuthSession | null {
  const storage = safeStorage();
  if (!storage) return null;

  const accessToken = storage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = storage.getItem(REFRESH_TOKEN_KEY);
  const expiresAtRaw = storage.getItem(ACCESS_EXPIRES_AT_KEY);

  if (!accessToken || !refreshToken || !expiresAtRaw) {
    return null;
  }

  const accessTokenExpiresAt = Number.parseInt(expiresAtRaw, 10);
  if (!Number.isFinite(accessTokenExpiresAt)) {
    return null;
  }

  return { accessToken, refreshToken, accessTokenExpiresAt };
}

export function writeAuthSession(session: StoredAuthSession): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  storage.setItem(ACCESS_EXPIRES_AT_KEY, String(session.accessTokenExpiresAt));
}

export function clearAuthSession(): void {
  const storage = safeStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  storage.removeItem(ACCESS_EXPIRES_AT_KEY);
}

export function readRefreshToken(): string | null {
  const storage = safeStorage();
  return storage?.getItem(REFRESH_TOKEN_KEY) ?? null;
}
