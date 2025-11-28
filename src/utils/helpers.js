const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

async function sendDM(client, userId, { embed, components }) {
    try {
        const user = await client.users.fetch(userId);
        if (user) {
            return await user.send({ embeds: [embed], components });
        }
    } catch (error) {
        console.error(`Lỗi khi gửi DM tới ${userId}:`, error);
    }
}

module.exports = {
    sendDM,
};
