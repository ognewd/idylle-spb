module.exports = {
  apps: [{
    name: 'idylle-spb',
    script: 'npm',
    args: 'start',
    cwd: '/root/idylle-spb',
    env: {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://idylle_user:wendw%40%40422ewd%21@localhost:5432/idylle_spb?schema=public',
      NEXTAUTH_URL: 'https://aromarussia.ru',
      NEXT_PUBLIC_BASE_URL: 'https://aromarussia.ru',
      UPLOADS_DIR: '/var/www/uploads',
    }
  }]
};
