import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets a phone on the same Wi-Fi open the dev server via this PC's LAN IP.
  allowedDevOrigins: ["192.168.0.3"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-6c55b4a33c034944bc9030fd94d673db.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
      },
    ],
  },
};


export default nextConfig;
