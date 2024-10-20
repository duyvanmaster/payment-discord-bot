const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
require('dotenv').config();
client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'verify') {
        const member = interaction.member;
        // In ra thông tin về các roles mà người dùng có
        console.log('Roles cache:', member.roles.cache.map(role => `${role.id}: ${role.name}`));

        // In ra ID role đang kiểm tra
        console.log('Checking role ID:', '1297503839749935159');

        // Kiểm tra role ID
        if (member.roles.cache.has('1297503839749935159')) {  // Kiểm tra role ID trực tiếp
            console.log('User has the role!');
            const embed = new EmbedBuilder()
                .setTitle('Xác minh giúp mình nha!!!')
                .setDescription('1. Nhấn vào nút `VERIFY` bên dưới để xác minh\n2. Khi hiện tab mới thì ấn nút `VERIFY` của Web\n3. Khi được chuyển sang tab của Discord thì chọn `PHÊ DUYỆT`\n4. Khi hiện bảng màu xanh có chữ `Success` thì thành công rồi!!!\n```yaml\n\n100% không ảnh hưởng đến account```')
                .setImage('https://cdn.discordapp.com/attachments/1152492381631942697/1297579327944396841/catdogbanner.png?ex=6716706b&is=67151eeb&hm=1bd7602a73e90b4ac5d047da8cba1f52834207490fabc660b4764221d6f55b72&')
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