import { useEffect, useRef, useState } from "react";

import { frontendEnv } from "@/lib/env";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
          }) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, options: object) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GSI_SCRIPT_ID = "google-identity-services";
const GSI_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let gsiLoadPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (typeof document === "undefined") return Promise.resolve();
  if (globalThis.google?.accounts?.id) return Promise.resolve();
  if (gsiLoadPromise !== null) return gsiLoadPromise;

  gsiLoadPromise = new Promise((resolve, reject) => {
    const handleLoad = () => {
      if (globalThis.google?.accounts?.id) {
        resolve();
      } else {
        reject(new Error("O script do Google carregou sem expor a API esperada."));
      }
    };

    const existing = document.getElementById(GSI_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (globalThis.google?.accounts?.id) {
        resolve();
        return;
      }
      existing.addEventListener("load", handleLoad);
      existing.addEventListener("error", () =>
        reject(new Error("Não foi possível carregar o script do Google.")),
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GSI_SCRIPT_ID;
    script.src = GSI_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = handleLoad;
    script.onerror = () =>
      reject(new Error("Não foi possível carregar o script do Google."));
    document.head.appendChild(script);
  }).catch((error) => {
    gsiLoadPromise = null;
    throw error;
  });

  return gsiLoadPromise;
}

type GoogleButtonProps = {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
};

export function GoogleButton({
  onCredential,
  disabled,
  label = "Continuar com Google",
}: GoogleButtonProps) {
  const clientId = frontendEnv.googleOauthClientId;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const callbackRef = useRef(onCredential);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !globalThis.google) return;
        globalThis.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              void callbackRef.current(response.credential);
            }
          },
          ux_mode: "popup",
        });
        setReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        className="auth-btn-google"
        disabled={!ready || disabled}
        onClick={() => {
          globalThis.google?.accounts.id.prompt();
        }}
      >
        <GoogleIcon />
        {label}
      </button>
      {error ? (
        <p className="auth-field-error">{error}</p>
      ) : null}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
