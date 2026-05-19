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
      "images.unsplash.com",
      "ui-avatars.com"
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
