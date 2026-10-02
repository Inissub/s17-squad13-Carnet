import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Adresse de l'API en local : à surcharger dans frontend/.env.local (ex. API_URL=http://localhost:3001)
  const { API_URL = "http://localhost:3000" } = loadEnv(mode, import.meta.dirname, "");

  return {
    plugins: [react()],
    server: {
      proxy: { "/api": API_URL },
    },
  };
});
