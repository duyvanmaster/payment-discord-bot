const { Client, GatewayIntentBits, Collection } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

const legitvnCommand = require('./commands/legitvn');
client.commands.set(legitvnCommand.data.name, legitvnCommand);

const qrcodeCommand = require('./commands/qrcode');
client.commands.set(qrcodeCommand.data.name, qrcodeCommand);

const sendmessagefileCommand = require('./commands/sendmessagefile');
client.commands.set(sendmessagefileCommand.data.name, sendmessagefileCommand);



module.exports = client;
