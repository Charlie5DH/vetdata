import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

import { currentUserQueryKey } from "@/api/auth";
import {
  fetchAuthenticatedUser,
  loginWithGoogleIdToken,
  loginWithPassword,
  logoutSession,
  refreshSession,
  registerAccount,
  type RegisterPayload,
  type TokenPair,
} from "@/api/auth-client";
import {
  setApiAccessTokenProvider,
  setApiAuthFailureHandler,
  setApiRefreshHandler,
} from "@/lib/api";
import {
  clearAuthSession,
  readAuthSession,
  writeAuthSession,
} from "@/lib/auth-storage";
import type { AppUser } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextValue = {
  status: AuthStatus;
  user: AppUser | null;
  accessToken: string | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: (idToken: string) => Promise<void>;
  signUp: (payload: RegisterPayload) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<string | null>;
  setUser: (next: AppUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const REFRESH_LEAD_TIME_MS = 60_000;

function nowMs() {
  return Date.now();
}

function applySessionState(pair: TokenPair) {
  return {
    accessToken: pair.access_token,
    refreshToken: pair.refresh_token,
    accessTokenExpiresAt: nowMs() + pair.expires_in * 1000,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AppUser | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const expiresAtRef = useRef<number>(0);
  const refreshTimerRef = useRef<number | null>(null);
  const refreshInFlightRef = useRef<Promise<string | null> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current !== null) {
      globalThis.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const persist = useCallback(
    (accessToken: string, refreshToken: string, expiresAt: number) => {
      accessTokenRef.current = accessToken;
      refreshTokenRef.current = refreshToken;
      expiresAtRef.current = expiresAt;
      writeAuthSession({
        accessToken,
        refreshToken,
        accessTokenExpiresAt: expiresAt,
      });
    },
    [],
  );

  const reset = useCallback(() => {
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    expiresAtRef.current = 0;
    clearAuthSession();
    clearRefreshTimer();
    setUser(null);
    // Drop any cached server state from the previous session — most importantly
    // the cached current-user, which would otherwise show the previous user
    // until staleTime elapses.
    queryClient.clear();
  }, [clearRefreshTimer, queryClient]);

  const refresh = useCallback(async (): Promise<string | null> => {
    if (refreshInFlightRef.current !== null) {
      return refreshInFlightRef.current;
    }
    const refreshToken = refreshTokenRef.current;
    if (!refreshToken) {
      return null;
    }

    const promise = (async () => {
      try {
        const pair = await refreshSession(refreshToken);
        const next = applySessionState(pair);
        persist(next.accessToken, next.refreshToken, next.accessTokenExpiresAt);
        scheduleRefresh(next.accessTokenExpiresAt);
        return next.accessToken;
      } catch {
        reset();
        setStatus("unauthenticated");
        return null;
      } finally {
        refreshInFlightRef.current = null;
      }
    })();

    refreshInFlightRef.current = promise;
    return promise;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persist, reset]);

  const scheduleRefresh = useCallback(
    (expiresAt: number) => {
      clearRefreshTimer();
      const delay = Math.max(expiresAt - nowMs() - REFRESH_LEAD_TIME_MS, 5_000);
      refreshTimerRef.current = globalThis.setTimeout(() => {
        void refresh();
      }, delay);
    },
    [clearRefreshTimer, refresh],
  );

  const completeSignIn = useCallback(
    async (pair: TokenPair) => {
      const next = applySessionState(pair);
      persist(next.accessToken, next.refreshToken, next.accessTokenExpiresAt);
      const fetched = await fetchAuthenticatedUser(next.accessToken);
      setUser(fetched);
      // Seed the react-query cache so consumers (nav-user, site-header, etc.)
      // pick up the freshly signed-in user immediately instead of seeing a
      // stale value until staleTime elapses.
      queryClient.setQueryData(currentUserQueryKey, fetched);
      setStatus("authenticated");
      scheduleRefresh(next.accessTokenExpiresAt);
    },
    [persist, queryClient, scheduleRefresh],
  );

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const pair = await loginWithPassword(email, password);
      await completeSignIn(pair);
    },
    [completeSignIn],
  );

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const pair = await loginWithGoogleIdToken(idToken);
      await completeSignIn(pair);
    },
    [completeSignIn],
  );

  const signUp = useCallback(
    async (payload: RegisterPayload) => {
      const pair = await registerAccount(payload);
      await completeSignIn(pair);
    },
    [completeSignIn],
  );

  const signOut = useCallback(async () => {
    const refreshToken = refreshTokenRef.current;
    reset();
    setStatus("unauthenticated");
    if (refreshToken) {
      try {
        await logoutSession(refreshToken);
      } catch {
        // ignore — we already cleared local state
      }
    }
  }, [reset]);

  useEffect(() => {
    setApiAccessTokenProvider(async () => {
      const expiresAt = expiresAtRef.current;
      if (
        accessTokenRef.current &&
        expiresAt - nowMs() > REFRESH_LEAD_TIME_MS
      ) {
        return accessTokenRef.current;
      }
      if (refreshTokenRef.current) {
        return await refresh();
      }
      return accessTokenRef.current;
    });
    setApiRefreshHandler(refresh);
    setApiAuthFailureHandler(() => {
      reset();
      setStatus("unauthenticated");
    });
    return () => {
      setApiAccessTokenProvider(null);
      setApiRefreshHandler(null);
      setApiAuthFailureHandler(null);
    };
  }, [refresh, reset]);

  useEffect(() => {
    let cancelled = false;
    const stored = readAuthSession();

    if (!stored) {
      setStatus("unauthenticated");
      return () => {
        cancelled = true;
      };
    }

    accessTokenRef.current = stored.accessToken;
    refreshTokenRef.current = stored.refreshToken;
    expiresAtRef.current = stored.accessTokenExpiresAt;

    const bootstrap = async () => {
      const expiresIn = stored.accessTokenExpiresAt - nowMs();
      let token = stored.accessToken;
      if (expiresIn <= REFRESH_LEAD_TIME_MS) {
        const refreshed = await refresh();
        if (!refreshed) {
          if (!cancelled) {
            setStatus("unauthenticated");
          }
          return;
        }
        token = refreshed;
      } else {
        scheduleRefresh(stored.accessTokenExpiresAt);
      }

      try {
        const fetched = await fetchAuthenticatedUser(token);
        if (!cancelled) {
          setUser(fetched);
          setStatus("authenticated");
        }
      } catch {
        reset();
        if (!cancelled) {
          setStatus("unauthenticated");
        }
      }
    };

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refresh, reset, scheduleRefresh]);

  useEffect(() => {
    return () => {
      clearRefreshTimer();
    };
  }, [clearRefreshTimer]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken: accessTokenRef.current,
      signInWithPassword,
      signInWithGoogle,
      signUp,
      signOut,
      refresh,
      setUser,
    }),
    [refresh, signInWithGoogle, signInWithPassword, signOut, signUp, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }
  return ctx;
}
