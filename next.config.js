/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "res.cloudinary.com" },
      { hostname: "platform-lookaside.fbsbx.com" },
      { hostname: "images.unsplash.com" },
      { hostname: "ui-avatars.com" }
    ],
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["react-icons"],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

module.exports = nextConfig;
