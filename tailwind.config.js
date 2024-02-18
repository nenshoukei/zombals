import { addDynamicIconSelectors } from '@iconify/tailwind';
import { nextui } from '@nextui-org/react';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './client/**/*.{js,ts,jsx,tsx}', './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [nextui(), addDynamicIconSelectors()],
};
