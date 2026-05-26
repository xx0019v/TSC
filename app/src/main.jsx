import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Clean up any old TSC static-site service worker so returning visitors
// don't get a stale cached page.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((r) => r.unregister()))
    .catch(() => {});
}

createRoot(document.getElementById("root")).render(<App />);
