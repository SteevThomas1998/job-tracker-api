import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],  // lcov is handy for CI tools
      reportsDirectory: "./coverage"
    }
  },
});
