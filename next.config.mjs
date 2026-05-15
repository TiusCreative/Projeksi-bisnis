import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  customWorkerDir: "worker",
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // Nonaktifkan PWA di mode dev agar tidak mengganggu
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for Firebase Auth undici compatibility issue
    config.externals = config.externals || [];
    config.externals.push({
      'undici': 'commonjs undici'
    });
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);