import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";
export default defineConfig({
  plugins: [
    react(),
    {
      name: "guide-route",
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.split("?")[0] === "/how") {
            req.url = req.url.replace("/how", "/how/index.html");
          }
          next();
        });
      },
      configurePreviewServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url?.split("?")[0] === "/how") {
            req.url = req.url.replace("/how", "/how/index.html");
          }
          next();
        });
      },
    },
  ],
  build: {
    rollupOptions: {
      input: {
        jobs: path.resolve(__dirname, "index.html"),
        how: path.resolve(__dirname, "how/index.html"),
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  preview: {
    port: 80,
    strictPort: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
});
