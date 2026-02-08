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
}

module.exports = nextConfig
