import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev only: lets a phone on the same Wi-Fi open the dev server via this PC's LAN IP.
  allowedDevOrigins: ["192.168.0.3"],
  // Fonts and logo for the donation certificate PDF are read from disk at runtime;
  // make sure they ship with every server function that can send the certificate.
  outputFileTracingIncludes: {
    "/**": ["./assets/certificate/**/*"],
  },
};

export default nextConfig;
