const { PermissionsBitField, EmbedBuilder } = require('discord.js');
require('dotenv').config();

/**
 * Hàm để tạo một kênh ticket trong server
 * @param {Client} client - Discord client
 * @param {Guild} guild - Server Discord
 * @param {User} user - Người dùng đã thanh toán
 * @param {TextChannel} supportChannel - Kênh nơi quản lý các ticket hoặc tin nhắn thanh toán
 */
async function createTicket(client, guild, user) {
  try {
    const category = guild.channels.cache.find(c => c.name === "CustomerTickets" && c.type === 4); // 4 = category type

    const channel = await guild.channels.create({
      name: `ticket-${user.username}`,
      type: 0, // 0 = text channel type
      parent: category ? category.id : null, // Thêm vào category nếu có
      permissionOverwrites: [
        {
          id: guild.roles.everyone, // Đặt quyền cho mọi người không thấy kênh
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: user.id, // Đặt quyền cho người thanh toán có thể xem và gửi tin nhắn
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: process.env.SUPPORTROLE_ID, // Đặt quyền cho vai trò hỗ trợ (cập nhật ID vai trò hỗ trợ)
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: process.env.BOTROLE_ID, // Đặt quyền cho vai trò bot
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks],
        }
      ],
    });

    const embed = new EmbedBuilder()
      .setTitle("Thanh toán thành công")
      .setDescription(`Xin chào ${user}, Vui lòng chờ trong giây lát đội ngũ hộ trợ sẽ đến ngay.`)
      .setFooter({
        text: 'LegitVN Ticket System',
        iconURL: 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/rf2o4ffc.png'
      })
      .setColor(0x00FF00)
      .setTimestamp();

    await channel.send({ embeds: [embed] });

    return channel;
  } catch (error) {
    console.error("Lỗi khi tạo ticket:", error);
    throw new Error("Không thể tạo ticket");
  }
}

module.exports = {
  createTicket,
};
