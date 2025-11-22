module.exports = {
  apps: [{
    name: 'idylle-spb',
    script: 'npm',
    args: 'start',
    cwd: '/home/u1234567/public_html/idylle-spb',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/home/u1234567/logs/idylle-spb-error.log',
    out_file: '/home/u1234567/logs/idylle-spb-out.log',
    log_file: '/home/u1234567/logs/idylle-spb-combined.log',
    time: true
  }]
};
