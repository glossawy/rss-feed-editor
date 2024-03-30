import path from "path"

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

const defineAlias = (find, replacement) => ({
  find,
  replacement: path.resolve(__dirname, `./${replacement}`),
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [...react()],
  resolve: {
    alias: [defineAlias("@app", "src")],
  },
})
