import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider defaultTheme="system">
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>
);