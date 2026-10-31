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
    // Expose API_BASE_URL to client bundle without requiring VITE_ prefix
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || env.VITE_API_BASE_URL || "https://dsa-sheet-one.vercel.app"),
    },
    server: {
      port: 5174,
      open: true,
    },
  };
})
