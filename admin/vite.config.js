import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      {
        find: 'react-router/dom',
        replacement: fileURLToPath(
          new URL('./node_modules/react-router/dist/development/dom-export.js', import.meta.url)
        ),
      },
      {
        find: 'react-router',
        replacement: fileURLToPath(
          new URL('./node_modules/react-router/dist/development/index.js', import.meta.url)
        ),
      },
    ],
  },
})
