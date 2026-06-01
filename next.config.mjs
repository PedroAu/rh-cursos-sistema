const rootDir = process.cwd();

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: rootDir
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      }
    ]
  }
};

export default nextConfig;
