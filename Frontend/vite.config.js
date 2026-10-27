import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget =
    env.VITE_BACKEND_URL ||
    env.BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ["gifuct-js", "ogl", "@tanstack/react-query"],
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/three/') || id.includes('node_modules/@react-three/')) {
              return 'three-bundle';
            }
            if (id.includes('node_modules/jspdf/') || id.includes('node_modules/html2canvas/')) {
              return 'export-libs';
            }
            if (id.includes('ImageFraming') || id.includes('imageFramingCatalog') || id.includes('imageFramingUtils')) {
              return 'image-framing';
            }
          }
        }
      }
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        "/storage": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
