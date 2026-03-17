import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Screenshot } from "./screens/Screenshot";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <Screenshot />
  </StrictMode>,
);
