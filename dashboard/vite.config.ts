import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // The dataset lives in ../test_data, outside this package.
  server: { fs: { allow: ['..'] } },
});
