import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zt: {
          bg: '#0A0A0A',
          card: '#141414',
          border: '#1E1E1E',
          'table-header': '#1A1A1A',
          'table-alt': '#111111',
          'table-hover': '#1A1A1A',
          yellow: '#FCEB03',
        },
        navy: {
          900: '#0A0A0A',
          800: '#141414',
          700: '#1E1E1E',
        },
        pacing: {
          'green-text': '#22C55E',
          'green-bg': '#0D3320',
          'yellow-text': '#EAB308',
          'yellow-bg': '#332B00',
          'red-text': '#EF4444',
          'red-bg': '#331111',
        },
      },
    },
  },
  plugins: [],
};
export default config;
