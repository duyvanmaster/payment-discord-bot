const client = require('./src/discord/client');
const app = require('./src/server/app');
const config = require('./src/config/config');

// Load events
const readyEvent = require('./src/discord/events/ready');
const interactionCreateEvent = require('./src/discord/events/interactionCreate');

client.once(readyEvent.name, (...args) => readyEvent.execute(...args));
client.on(interactionCreateEvent.name, (...args) => interactionCreateEvent.execute(...args));

// Global error handlers to prevent crashes
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
});

// Discord client error handler
client.on('error', (error) => {
  console.error('❌ Discord client error:', error);
});

client.login(config.token);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
// Restart trigger 20