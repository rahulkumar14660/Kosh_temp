import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import UserProvider from "./context/UserContext.jsx";
import { SystemProvider } from "./context/SystemContext.jsx";
createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <UserProvider>
      <SystemProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SystemProvider>
    </UserProvider>
  </AuthProvider>
);
