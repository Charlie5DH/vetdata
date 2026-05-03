import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./index.css";
import { App } from "./App.tsx";
import { AuthProvider } from "@/components/auth/auth-provider";
import { ThemeProvider, initializeAppTheme } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

initializeAppTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <App />
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
