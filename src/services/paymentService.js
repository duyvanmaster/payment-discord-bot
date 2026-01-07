const payOS = require('../payos/payos');
const { EmbedBuilder } = require('discord.js');
const { savePaymentToDB } = require('../utils/mongodb');
const { getProductDisplayName, getProductIcon } = require('../utils/productname');
const { sendDM } = require('../utils/helpers');
const config = require('../config/config');

async function handlePaymentCreation(client, selectedSubProduct, interaction, body, voucherData = null) {
    try {
        // Defer reply immediately to prevent timeout
        if (!interaction.deferred && !interaction.replied) {
            await interaction.deferReply({ ephemeral: true });
        }

        const paymentLinkResponse = await payOS.createPaymentLink(body);
        const qrCodeImageUrl = `https://img.vietqr.io/image/${paymentLinkResponse.bin}-${paymentLinkResponse.accountNumber}-vietqr_pro.jpg?amount=${paymentLinkResponse.amount}&addInfo=${encodeURIComponent(paymentLinkResponse.description)}`;
        body.checkoutUrl = paymentLinkResponse.checkoutUrl;

        const productIcon = getProductIcon(selectedSubProduct);
        const embed = new EmbedBuilder()
            //.setDescription('**Trạng thái thanh toán:**\n```Chưa hoàn tất thanh toán```')
            .setAuthor({
                name: getProductDisplayName(selectedSubProduct),
                iconURL: productIcon
            })
            .addFields(
                //{ name: " ", value: `[Thanh toán qua liên kết](${body.checkoutUrl})`, inline: false },
                { name: " ", value: "```Chưa hoàn tất thanh toán```", inline: false }
            );

        // Add voucher info if applied
        if (voucherData) {
            embed.addFields(
                { name: " ", value: "ㅤ", inline: false },
                { name: "Giá gốc", value: `\`\`\`${voucherData.originalAmount.toLocaleString('vi-VN')} VND\`\`\``, inline: false },
                { name: "Giảm", value: `\`\`\`${voucherData.discountAmount.toLocaleString('vi-VN')} VND\`\`\``, inline: true },
                { name: "Mã giảm giá", value: `\`\`\`${voucherData.code}\`\`\``, inline: true },
                { name: "Mã đơn hàng", value: `\`\`\`${body.orderCode}\`\`\``, inline: true },
                { name: " ", value: "ㅤ", inline: false },
                { name: "Tổng cộng", value: `\`\`\`${body.amount.toLocaleString('vi-VN')} VND\`\`\``, inline: false }
            );
        } else {
            embed.addFields(
                { name: "Mã đơn hàng", value: `\`\`\`${body.orderCode}\`\`\``, inline: true },
                { name: "Số tiền", value: `\`\`\`${body.amount.toLocaleString('vi-VN')} VND\`\`\``, inline: true }
            );
        }

        embed.setImage(qrCodeImageUrl);
        embed.setTimestamp();

        // Gửi tin nhắn DM và lưu trạng thái thanh toán
        //console.log(`${body.checkoutUrl}`);
        const sentMessage = await sendDM(client, interaction.user.id, { embeds: [embed], components: [] });

        // Gửi thông tin đến kênh thanh toán
        const pendingChannel = await client.channels.fetch(config.paymentsChannelId);
        if (pendingChannel && pendingChannel.isTextBased()) {
            await pendingChannel.send({
                embeds: [
                    (function () {
                        const channelEmbed = new EmbedBuilder()
                            .setTitle("Thông tin giao dịch người dùng")
                            .setDescription('**Trạng thái thanh toán:** ```Chưa hoàn tất thanh toán```')
                            .addFields(
                                { name: "Mã đơn hàng", value: `${body.orderCode}`, inline: true },
                                { name: "ID người dùng", value: `<@${interaction.user.id}>`, inline: true },
                                { name: "Sản phẩm", value: `**\`${getProductDisplayName(selectedSubProduct)}\`**`, inline: false }
                            );

                        if (voucherData) {
                            channelEmbed.addFields(
                                { name: "Giá gốc", value: `\`\`\`${voucherData.originalAmount.toLocaleString('vi-VN')} VND\`\`\``, inline: true },
                                { name: "Mã giảm giá", value: `\`\`\`${voucherData.code}\`\`\``, inline: true },
                                { name: "Giảm", value: `\`\`\`${voucherData.discountAmount.toLocaleString('vi-VN')} VND\`\`\``, inline: true },
                                { name: " ", value: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", inline: false },
                                { name: "Tổng cộng", value: `\`\`\`${body.amount.toLocaleString('vi-VN')} VND\`\`\``, inline: true }
                            );
                        } else {
                            channelEmbed.addFields(
                                { name: "Số tiền", value: `\`${body.amount} VND\``, inline: true }
                            );
                        }

                        channelEmbed.addFields(
                            { name: "Liên kết thanh toán", value: `[Thanh toán qua liên kết](${body.checkoutUrl})`, inline: false }
                        );
                        channelEmbed.setTimestamp();

                        return channelEmbed;
                    })()
                ]
            });
        }

        const voucherCodeToSave = voucherData ? voucherData.code : null;
        await savePaymentToDB(body, selectedSubProduct, interaction, sentMessage, voucherCodeToSave);

        const voucherCode = voucherData ? voucherData.code : null;

        let successDescription = 'Đã gửi mã QR thanh toán qua DM.';
        if (voucherCode) {
            successDescription = `Đã áp dụng mã **${voucherCode.toUpperCase()}** và gửi QR thanh toán qua DM.`;
        }

        await interaction.editReply({
            content: '',
            embeds: [
                new EmbedBuilder()
                    .setDescription(successDescription)
                    .setColor(0x00FF00) // Green success
            ],
            components: [] // Remove any buttons/select menus
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
