require('dotenv').config();

module.exports = {
    token: process.env.TOKEN,
    clientId: process.env.CLIENT_ID,
    guildId: process.env.GUILD_ID,
    paymentsChannelId: process.env.PAYMENTS_CHANNEL_ID,
    port: process.env.PORT || 3000,
    yourDomain: process.env.YOUR_DOMAIN,
    mongoUri: process.env.MONGO_URI, // Assuming you might want to add this later if not already used in database.js
};
