import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2020",
    sourcemap: false,
    // Three.js is intentionally isolated as its own long-lived vendor chunk.
    // The minified vendor file is ~518 kB but only ~132 kB gzip, so 600 kB is
    // a deliberate project budget rather than Vite's generic 500 kB default.
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"]
        }
      }
    }
  }
});
