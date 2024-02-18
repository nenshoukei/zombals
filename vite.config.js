import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default {
  plugins: [tsconfigPaths(), react()],
  publicDir: './client/public',
  test: {
    globals: true,
  },
};
