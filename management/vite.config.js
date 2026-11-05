import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { whatsappPreview } from "./scripts/whatsapp-preview.mjs";

// Keep stable third-party code out of the management route entry. This makes
// the initial workspace smaller and lets browsers cache vendor code between
// releases while feature modules remain lazy-loaded.
export default defineConfig({
  plugins: [react(), whatsappPreview()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => id.includes("node_modules") ? "vendor" : undefined,
      },
    },
  },
});
