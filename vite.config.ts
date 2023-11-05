import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import { svelte } from "@sveltejs/vite-plugin-svelte"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), svelte()],
})
