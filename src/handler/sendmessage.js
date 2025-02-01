const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const { getEmbedConfig } = require('../firebase/firebaseService');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.DirectMessages] });

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'sendmessage') {
        if (interaction.guild.ownerId !== interaction.user.id) {
            return interaction.reply({ content: 'Chỉ có chủ server mới được sử dụng lệnh này.', ephemeral: true });
        }
        await interaction.deferReply({ ephemeral: true });
        const userIdsInput = options.getString('user_ids');
        const userIds = userIdsInput.split(',').map(id => id.trim());

        // Lấy cấu hình embed từ Firebase
        const embedConfig = await getEmbedConfig();

        if (embedConfig) {
            const embed = new EmbedBuilder()
                .setColor(embedConfig.color)
                .setTitle(embedConfig.title)
                .setImage(embedConfig.imageUrl)
                .setDescription(embedConfig.description)
                .setTimestamp()

            for (const userId of userIds) {
                try {
                    const user = await client.users.fetch(userId);
                    await user.send({ embeds: [embed] });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log(`Đã gửi tin nhắn embed tới người dùng ID: ${userId}`);
                } catch (error) {
                    console.error(`Lỗi khi gửi tin nhắn tới người dùng ID: ${userId}`, error);
                }
            }

            await interaction.editReply('Tin nhắn đã được gửi thành công!');
        } else {
            await interaction.editReply('Không thể lấy cấu hình embed.');
        }
    }
});

client.login(process.env.TOKEN);
