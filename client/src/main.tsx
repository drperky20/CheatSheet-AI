import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "@/components/ui/global.css";

createRoot(document.getElementById("root")!).render(<App />);
