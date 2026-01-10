/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'idylle.spb.ru'],
    remotePatterns: [
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
        hostname: 'idylle-spb.vercel.app',
      },
      {
        protocol: 'https',
        hostname: '*.vercel.app',
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
    // Игнорировать ошибки типов во время сборки
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig
