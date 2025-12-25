import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // These fallbacks ensure that the build succeeds even if the keys aren't set yet.
    // Replace the fallback string with your actual key if you don't want to use Netlify Env Vars.
    'process.env.API_KEY_PRIMARY': JSON.stringify(process.env.API_KEY_PRIMARY || "AIzaSyBcsxeT2d8xzRZBB_OiBmYtFLIettgr0B8"),
    'process.env.API_KEY_SECONDARY': JSON.stringify(process.env.API_KEY_SECONDARY || "AIzaSyC0BAuY95L8yL_hXliPP0lusBDEML_Y8ZE")
  },
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    // This target ensures compatibility across mobile and desktop browsers
    target: 'esnext'
  },
  server: {
    host: true 
  }
});
