/** @type {import('next').NextConfig} */
const nextConfig = {
  api: {
    bodyParser: false,        // FormData uchun
    responseLimit: false,     // Katta javoblar
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;