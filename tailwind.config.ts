import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        golf: {
          green: '#2D6A4F',
          fairway: '#40916C',
          light: '#95D5B2',
          sand: '#DDB892',
          sky: '#89C2D9',
        },
      },
    },
  },
  darkMode: 'class',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [heroui() as any],
};
export default config;
