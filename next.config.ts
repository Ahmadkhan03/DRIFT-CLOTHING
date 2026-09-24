import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Placeholder product/editorial photography (Unsplash, free licence).
    // Remove once real product images are uploaded to our own storage.
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
