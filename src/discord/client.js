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

const createvoucherCommand = require('./commands/createvoucher');
client.commands.set(createvoucherCommand.data.name, createvoucherCommand);

const myvouchersCommand = require('./commands/myvouchers');
client.commands.set(myvouchersCommand.data.name, myvouchersCommand);

const managevouchersCommand = require('./commands/managevouchers');
client.commands.set(managevouchersCommand.data.name, managevouchersCommand);



module.exports = client;
