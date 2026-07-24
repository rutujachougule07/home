import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    TanStackRouterVite(),
    react(),
  ],
  server: {
    host: "127.0.0.1",
    port: 8080,
  },
});
