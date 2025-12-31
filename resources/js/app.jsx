import "./bootstrap";
import { createRoot } from "react-dom/client";
import Login from "./pages/login";
import Admin from "./pages/admin";
import NovoDocumento from "./pages/novoDocumento";

const pages = {
    "login-root": Login,
    "dashboard-root": Admin,
    "novoDocumento-root": NovoDocumento
};

Object.entries(pages).map(([id, Component]) => {
    const el = document.getElementById(id);
    if (el) {
        createRoot(el).render(<Component />);
    }
});
