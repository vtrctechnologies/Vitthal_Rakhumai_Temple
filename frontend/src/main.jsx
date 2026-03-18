import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Performance: Vite handles CSS optimization
import "./index.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
