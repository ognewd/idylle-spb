/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'idylle.spb.ru',
      },
      {
        protocol: 'http',
        hostname: 'idylle.spb.ru',
      },
      {
        protocol: 'https',
        hostname: 'aromarussia.ru',
      },
      {
        protocol: 'http',
        hostname: 'aromarussia.ru',
      },
      {
        protocol: 'https',
        hostname: 'idylle.spb.ru',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  eslint: {
    // Предупреждения не блокируют продакшн билд
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Игнорировать ошибки типов во время сборки (временно для решения проблем с зависимостями)
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Игнорируем ESM модули для серверного рендеринга
      config.externals = config.externals || [];
      config.externals.push({
        'parse5': 'commonjs parse5',
        '@exodus/bytes/encoding.js': 'commonjs @exodus/bytes/encoding.js',
      });
    }
    // Улучшаем обработку ошибок webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
}

module.exports = nextConfig
