const client = require('./src/discord/client');
const app = require('./src/server/app');
const config = require('./src/config/config');

// Load events
const readyEvent = require('./src/discord/events/ready');
const interactionCreateEvent = require('./src/discord/events/interactionCreate');

client.once(readyEvent.name, (...args) => readyEvent.execute(...args));
client.on(interactionCreateEvent.name, (...args) => interactionCreateEvent.execute(...args));

client.login(config.token);

app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
// Restart trigger 18