import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Redirect plotly.js imports to the smaller basic dist
    config.resolve.alias = {
      ...config.resolve.alias,
      'plotly.js/dist/plotly': path.resolve(__dirname, 'node_modules/plotly.js-basic-dist-min/plotly-basic.min.js'),
      'plotly.js': path.resolve(__dirname, 'node_modules/plotly.js-basic-dist-min/plotly-basic.min.js'),
    };
    return config;
  },
};

export default nextConfig;
