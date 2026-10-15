import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const backendTarget =
    env.BACKEND_URL || env.VITE_BACKEND_URL || process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || "http://localhost:8000";

  return {
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
      include: ["gifuct-js", "ogl"],
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
