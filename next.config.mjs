import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const rootDir = process.cwd();

initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  turbopack: {
    root: rootDir
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      },
      {
        protocol: "https",
        hostname: "*.supabase.co"
      }
    ]
  }
};

export default nextConfig;
