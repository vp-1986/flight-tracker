import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Pages subdirectory deployments, change base to "/your-repo-name/".
export default defineConfig({
  plugins: [react()],
  base: "/flight-tracker/",
});
