import "./bootstrap";
import { createRoot } from "react-dom/client";
import Login from "./pages/login";
import Admin from "./pages/admin";

const pages = {
    "login-root": Login,
    "dashboard-root": Admin,
};

Object.entries(pages).map(([id, Component]) => {
    const el = document.getElementById(id);
    if (el) {
        createRoot(el).render(<Component />);
    }
});
