import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ModeProvider } from "./context/ModeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import EntryExperience from "./components/EntryExperience.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ModeProvider>
        <AuthProvider>
          <CartProvider>
            <EntryExperience>
              <App />
            </EntryExperience>
          </CartProvider>
        </AuthProvider>
      </ModeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
