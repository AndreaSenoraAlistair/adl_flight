import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // or 5000 depending on your backend
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: { "@": "/src" },
  },
});
