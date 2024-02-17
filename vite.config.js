import generouted from '@generouted/react-router/plugin';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default {
  plugins: [tsconfigPaths(), react(), generouted()],
  test: {
    globals: true,
  },
};
