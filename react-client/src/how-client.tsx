import { createRoot, hydrateRoot } from "react-dom/client";
import HowPage from "@/features/how/page";
import "./index.css";
import "./how.css";

const root = document.getElementById("root")!;
if (root.querySelector("main")) {
  hydrateRoot(root, <HowPage />);
} else {
  // Vite development serves the template; production serves prerendered HTML.
  createRoot(root).render(<HowPage />);
}
