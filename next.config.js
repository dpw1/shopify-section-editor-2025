/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Optional: Change the output directory `out` -> `dist`
  distDir: "dist",
};

module.exports = nextConfig;
