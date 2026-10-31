import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    // Default to local backend port 5001 for development
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || "http://localhost:5001"),
    },
    server: {
      port: 5174,
      open: true,
    },
  };
})
