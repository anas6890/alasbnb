/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      "lh3.googleusercontent.com", 
      "res.cloudinary.com",
      "platform-lookaside.fbsbx.com",
      "images.unsplash.com"
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
