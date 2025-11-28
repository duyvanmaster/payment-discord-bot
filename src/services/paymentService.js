const payOS = require('../payos/payos');
const { EmbedBuilder } = require('discord.js');
const { savePaymentToDB } = require('../utils/mongodb');
const { getProductDisplayName } = require('../utils/productname');
const { sendDM } = require('../utils/helpers');
const config = require('../config/config');

async function handlePaymentCreation(client, selectedSubProduct, interaction, body) {
    try {
        // Defer reply immediately to prevent timeout
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const paymentLinkResponse = await payOS.createPaymentLink(body);
        const qrCodeImageUrl = `https://img.vietqr.io/image/${paymentLinkResponse.bin}-${paymentLinkResponse.accountNumber}-vietqr_pro.jpg?amount=${paymentLinkResponse.amount}&addInfo=${encodeURIComponent(paymentLinkResponse.description)}`;
        body.checkoutUrl = paymentLinkResponse.checkoutUrl;

        const embed = new EmbedBuilder()
            .setDescription('**Trạng thái thanh toán:**\n```Chưa hoàn tất thanh toán```')
            .addFields(
                { name: "Sản phẩm", value: `\`${getProductDisplayName(selectedSubProduct)}\``, inline: true },
                { name: "Mã đơn hàng", value: `\`${body.orderCode}\``, inline: true },
                { name: "Số tiền", value: `\`${body.amount}\``, inline: true },
                { name: " ", value: `[Thanh toán qua liên kết](${body.checkoutUrl})`, inline: false }
            )
            .setImage(qrCodeImageUrl)
            .setTimestamp();

        // Gửi tin nhắn DM và lưu trạng thái thanh toán
        const sentMessage = await sendDM(client, interaction.user.id, { embed, components: [] });

        // Gửi thông tin đến kênh thanh toán
        const pendingChannel = await client.channels.fetch(config.paymentsChannelId);
        if (pendingChannel && pendingChannel.isTextBased()) {
            await pendingChannel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Thông tin giao dịch người dùng")
                        .setDescription('**Trạng thái thanh toán:** ```Chưa hoàn tất thanh toán```')
                        .addFields(
                            { name: "Mã đơn hàng", value: `${body.orderCode}`, inline: true },
                            { name: "ID người dùng", value: `<@${interaction.user.id}>`, inline: true },
                            { name: "Số tiền", value: `\`${body.amount} VND\``, inline: true },
                            { name: "Sản phẩm", value: `**\`${getProductDisplayName(selectedSubProduct)}\`**`, inline: false },
                            { name: "Liên kết thanh toán", value: `[Thanh toán qua liên kết](${body.checkoutUrl})`, inline: false }
                        )
                        .setTimestamp()
                ]
            });
        }

        await savePaymentToDB(body, selectedSubProduct, interaction, sentMessage);

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('Đã gửi mã QR thanh toán qua DM của bạn!')
                    .setColor(0x007AFF)
            ]
        });

        return qrCodeImageUrl;
    } catch (error) {
        console.error("Lỗi khi tạo liên kết thanh toán:", error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: "Đã xảy ra lỗi khi tạo liên kết thanh toán.", ephemeral: true });
        } else {
            await interaction.editReply({ content: "Đã xảy ra lỗi khi tạo liên kết thanh toán." });
        }
        throw error;
    }
}

module.exports = {
    handlePaymentCreation,
};
