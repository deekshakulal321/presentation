// vite.config.js (CORRECTED)

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  // 🎯 CRITICAL FIX: Add the 'define' property
  define: {
    // This tells Vite to replace all instances of the Node.js 'global' 
    // variable with the browser's 'window' object during compilation.
    global: 'window', 
  },
})