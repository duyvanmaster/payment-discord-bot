const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
require('dotenv').config();
// client.once('ready', () => {
//     console.log('Bot is online!');
// });

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'verify') {
        const member = interaction.member;
        const guildOwnerId = interaction.guild.ownerId;

        if (member.id === guildOwnerId) {
            const embed = new EmbedBuilder()
                .setTitle('Verify Bot')
                .setDescription('1. Nhấn vào nút `VERIFY` bên dưới để xác minh\n2. Khi hiện tab mới thì ấn nút `VERIFY` của Web\n3. Khi được chuyển sang tab của Discord nếu chưa login thì login, sau đó chọn `PHÊ DUYỆT` Bot\n4. Khi hiện bảng màu xanh có chữ `Success` thì thành công rồi!!!\n\n**Vì sao phải Verify bằng Bot?**\nĐể đảm bảo quyền lợi của bạn khi Server gặp vấn đề, Bot chỉ có quyền mời bạn vào lại server khi xảy ra trục trặc. Vì vậy, Bot sẽ không ảnh hưởng đến tài khoản của bạn.\n\n```yaml\n100% không ảnh hưởng đến tài khoản```')
                .setImage('https://cdn.discordapp.com/attachments/1297557351246856202/1297798480466804736/verifybanner.png?ex=67173c85&is=6715eb05&hm=cb34c9c4244fceafd731c2d5b1dfeca08b8f7cd0cc1dc60bdbad6bf25ca8b876&')
            const verifyButton = new ButtonBuilder()
                .setLabel('Verify')
                .setStyle(ButtonStyle.Link)
                .setURL('https://restorecord.com/verify/LegitVerify');

            const row = new ActionRowBuilder().addComponents(verifyButton);

            await interaction.reply({ embeds: [embed], components: [row] });
        } else {

            await interaction.reply({ content: 'Bạn không có quyền để sử dụng lệnh này.', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN);