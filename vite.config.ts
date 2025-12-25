import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // SYSTEM KEYS:
    // PRIMARY: The main key used for operations.
    // SECONDARY: Backup key used when Primary hits quota limits.
    // IMPORTANT: YOU MUST PASTE YOUR OWN GEMINI API KEY BELOW.
    // Get one here: https://aistudio.google.com/app/apikey
    'process.env.API_KEY_PRIMARY': JSON.stringify("AIzaSyBcsxeT2d8xzRZBB_OiBmYtFLIettgr0B8"),
    'process.env.API_KEY_SECONDARY': JSON.stringify("PASTE_YOUR_KEY_HERE_SECONDARY") 
  },
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false
  },
  server: {
    host: true 
  }
});