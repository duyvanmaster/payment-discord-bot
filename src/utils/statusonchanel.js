const { EmbedBuilder } = require('discord.js');
const { getProductDisplayName } = require('./productname');

async function updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, status) {
  try {
    const pendingChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID);
    const messages = await pendingChannel.messages.fetch({ limit: 100 });
    
    // Tìm kiếm tin nhắn chứa mã đơn hàng
    const orderMessage = messages.find(msg => msg.embeds[0]?.fields.some(field => field.value === orderCode.toString()));

    if (orderMessage) {
      let description;
      switch (status) {
        case 'completed':
          description = '```diff\n+ Thanh toán đã hoàn tất```';
          break;
        default:
          description = '```Trạng thái thanh toán không xác định```';
      }

    // Cập nhật tin nhắn trong kênh Discord
    await orderMessage.edit({
      embeds: [
        new EmbedBuilder()
          .setTitle('Hoàn tất thanh toán')
          .setDescription(`**Trạng thái thanh toán:** ${description}`)
          .addFields(
            { name: "Sản phẩm", value: `\`${getProductDisplayName(product)}\``, inline: true },
            { name: "Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
            { name: "Số tiền", value: `\`${amount} VND\``, inline: true },
            { name: "ID người dùng", value: `<@${userId}>`, inline: true }
          )
          .setColor(0x00FF00)
          .setTimestamp()
      ]
    });
  } else {
    console.error(`Không tìm thấy tin nhắn cho mã đơn hàng ${orderCode}`);
  }
} catch (error) {
  console.error(`Lỗi khi cập nhật trạng thái thanh toán cho mã đơn hàng ${orderCode}:`, error);
}
}

module.exports = { updatePaymentStatusOnChannel };