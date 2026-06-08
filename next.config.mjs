const rootDir = process.cwd();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  turbopack: {
    root: rootDir
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
