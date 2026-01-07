const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function sendDM(client, userId, { embeds, components }) {
    try {
        const user = await client.users.fetch(userId);
        if (user) {
            return await user.send({ embeds, components });
        }
    } catch (error) {
        if (error.code === 50007) {
            console.error(`❌ Không thể gửi DM tới ${userId}: Người dùng đã chặn DM hoặc không chung server.`);
        } else {
            console.error(`Lỗi khi gửi DM tới ${userId}:`, error);
        }
    }
}

module.exports = {
    sendDM,
};
