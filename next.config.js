/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16 uchun yangilangan konfiguratsiya
  
  // 1️⃣ Server-side packages - pdf-parse va boshqa binary modullar
  serverExternalPackages: ['pdf-parse', 'canvas', 'pdfjs-dist'],
  
  // 2️⃣ Webpack konfiguratsiyasi
  webpack: (config, { isServer }) => {
    // Client-side uchun server modullarini ignore qilish
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        canvas: false,
        'pdf-parse': false,
      };
    }
    
    // Server-side uchun ham canvas ni fallback qilish (optional)
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    return config;
  },

  // 3️⃣ Turbopack konfiguratsiyasi (Next.js 15+ uchun)
  turbopack: {
    // Bo'sh yoki zarur bo'lsa qo'shimcha konfiguratsiya
  },
  
  // 4️⃣ Experimental features
  experimental: {
    // Font optimizatsiyasi
    optimizePackageImports: ['next/font/google'],
    
    // Server actions (agar kerak bo'lsa)
    serverActions: {
      bodySizeLimit: '10mb', // PDF upload uchun
    },
  },

  // 5️⃣ CORS headerlari - faqat kerakli routelar uchun
  async headers() {
    return [
      {
        // Faqat API routelar uchun
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
      {
        // PDF.js worker uchun (agar client-side PDF viewer ishlatilsa)
        source: "/_next/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },

  // 6️⃣ Images konfiguratsiyasi (agar kerak bo'lsa)
  images: {
    domains: [], // Tashqi rasm URL'lari
    remotePatterns: [],
  },

  // 7️⃣ Redirects (agar kerak bo'lsa)
  async redirects() {
    return [];
  },

  // 8️⃣ Environment variables ko'rinishi
  env: {
    // Public env vars (agar kerak bo'lsa)
  },

  // 9️⃣ Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // 🔟 Output konfiguratsiyasi (deployment uchun)
  // output: 'standalone', // Docker uchun

  // 1️⃣1️⃣ TypeScript strict mode
  typescript: {
    // Production build da type errorlarni ignore qilmaslik
    ignoreBuildErrors: false,
  },

  // 1️⃣2️⃣ ESLint
  eslint: {
    // Production build da eslint errorlarni ignore qilmaslik
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;