import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev proxy avoids CORS: leave VITE_API_URL empty and requests to /api and /auth
// are forwarded to Spring Boot on :8080.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/auth': 'http://localhost:8080',
    },
  },
});
