import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { App } from "./App.tsx";
import { ThemeProvider, initializeAppTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { frontendEnv } from "@/lib/env";
import { clerkLocalization } from "@/lib/clerk-localization";

const queryClient = new QueryClient();

initializeAppTheme();

function RootLayout() {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      afterSignOutUrl="/sign-in"
      localization={clerkLocalization}
      publishableKey={frontendEnv.clerkPublishableKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInFallbackRedirectUrl="/"
      signInUrl="/sign-in"
      signUpFallbackRedirectUrl="/"
      signUpUrl="/sign-up"
    >
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <App />
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RootLayout />
    </BrowserRouter>
  </StrictMode>,
);
