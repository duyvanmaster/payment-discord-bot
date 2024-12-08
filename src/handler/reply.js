const { Client, GatewayIntentBits, PresenceUpdateStatus } = require('discord.js');
require('dotenv').config();
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildPresences, 
        GatewayIntentBits.GuildMembers 
    ] 
});

const USER_ID = '948239925701115914';

client.on('messageCreate', async message => {
    if (message.mentions.has(USER_ID)) {
        const user = await client.users.fetch(USER_ID);
        const guild = message.guild;
        const member = await guild.members.fetch(USER_ID);

        if (member.presence == null || member.presence.status === PresenceUpdateStatus.Offline) {
            message.reply('off rồi <:froge_wave:1306993850820198491>');
        }
    }
});

client.login(process.env.TOKEN);