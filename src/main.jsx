import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./AuthContext.jsx";
import "./index.css";
import { SnackBarProvider } from "./SnackBarContext.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SnackBarProvider>
    <AuthProvider>
        <App />
    </AuthProvider>
    </SnackBarProvider>
  </StrictMode>,
);
