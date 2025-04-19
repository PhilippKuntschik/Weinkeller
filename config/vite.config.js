import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import path from 'path';

// Get the project root (one level up from config directory)
const projectRoot = path.resolve(__dirname, '..');
const frontendDir = path.resolve(projectRoot, 'frontend');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Add base path for production builds
  root: frontendDir, // Set the frontend directory as the root
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: path.resolve(projectRoot, 'run/frontend'),
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(frontendDir, 'index.html'),
      },
    },
    // Ensure assets are correctly referenced
    assetsDir: 'assets',
    emptyOutDir: true,
    // Increase chunk size warning limit to suppress warnings
    chunkSizeWarningLimit: 1000,
  },
  // Configure esbuild to handle JSX in .js files
  esbuild: {
    loader: 'jsx',
    include: /.*\.jsx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
});
