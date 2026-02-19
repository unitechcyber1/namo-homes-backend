module.exports = {
  apps: [{
    name: 'namohomes-backend',
    script: './Backend/app.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    // Logging
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    // Auto-restart
    autorestart: true,
    watch: false, // Don't watch files in production
    max_memory_restart: '1G', // Restart if memory exceeds 1GB
    // Advanced
    min_uptime: '10s', // Minimum uptime to consider app stable
    max_restarts: 10, // Max restarts in 1 minute
    restart_delay: 4000, // Delay between restarts
    // Ignore files
    ignore_watch: ['node_modules', 'logs', '.git']
  }]
};
