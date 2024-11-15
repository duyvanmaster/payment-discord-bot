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

// client.once('ready', () => {
//     console.log('Bot đã sẵn sàng!');
// });

client.on('messageCreate', async message => {
    if (message.content.toLowerCase().includes('link ffx86')) {
        message.reply('<#1205701391297941525>\n> Vào kênh trên lựa menu rồi chọn mục FREE là lụm <:Flud_F_Wink_Star:1306993820722008127>');
    }

    if (message.mentions.has(USER_ID)) {
        const user = await client.users.fetch(USER_ID);
        const guild = message.guild;
        const member = await guild.members.fetch(USER_ID);

        if (member.presence == null || member.presence.status === PresenceUpdateStatus.Offline) {
            message.reply('> đã off đợi xíu nha hihi <:froge_wave:1306993850820198491>');
        }
    }
});

client.login(process.env.TOKEN);