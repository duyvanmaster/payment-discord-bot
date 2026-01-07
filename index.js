const client = require('./src/discord/client');
const app = require('./src/server/app');
const config = require('./src/config/config');
const { startVoucherExpirationScheduler } = require('./src/utils/voucherScheduler');



// Load events
const readyEvent = require('./src/discord/events/ready');
const interactionCreateEvent = require('./src/discord/events/interactionCreate');

client.once(readyEvent.name, (...args) => readyEvent.execute(...args));
client.on(interactionCreateEvent.name, (...args) => interactionCreateEvent.execute(...args));

// Global error handlers to prevent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection at:', promise, 'reason:', reason);
  // Don't exit the process, keep running
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  // Don't exit - log and continue
  // In production, you might want to restart gracefully here
});

// Discord client error handler
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

// Handle Discord client warnings
client.on('warn', (warning) => {
  console.warn('⚠️ Discord client warning:', warning);
});

// Discord login with error handling
async function startBot() {
  try {
    console.log('🔄 Attempting to login to Discord...');

    if (!config.token) {
      throw new Error('Discord token is not configured. Please check your .env file.');
    }

    await client.login(config.token);
    console.log('✅ Discord bot logged in successfully');

    // Start voucher expiration scheduler
    startVoucherExpirationScheduler(client);
  } catch (error) {
    console.error('❌ Failed to login to Discord:', error);
    // Retry after 30 seconds
    console.log('🔄 Retrying Discord login in 30 seconds...');
    setTimeout(startBot, 30000);
  }
}

// Start Express server with error handling
function startServer() {
  try {
    const server = app.listen(config.port, () => {
      console.log(`✅ Server is running on port ${config.port}`);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${config.port} is already in use`);
        // Try a different port
        config.port = parseInt(config.port) + 1;
        console.log(`🔄 Trying port ${config.port}...`);
        setTimeout(startServer, 1000);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    setTimeout(startServer, 5000);
  }
}

// Start both Discord bot and Express server
startBot();
startServer();

// Keep-alive: Using UptimeRobot external service instead of internal cron job
// This prevents HTTP 429 rate limit errors and is more reliable
// Setup: https://uptimerobot.com (free) - Monitor: https://payment-discord-bot-05r9.onrender.com/health



// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  client.destroy();
  process.exit(0);
});

// Restart trigger 21