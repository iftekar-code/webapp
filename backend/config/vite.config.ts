import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const projectRoot = path.resolve(__dirname, '../..')

// https://vite.dev/config/
export default defineConfig({
  root: projectRoot,
  envDir: path.resolve(__dirname, '..'),
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
})
