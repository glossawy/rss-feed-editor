import path from "path"

import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"

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
