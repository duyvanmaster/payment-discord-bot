const express = require('express');
const router = express.Router();
const { EmbedBuilder } = require('discord.js');
const { getPendingPaymentFromDB, saveWebhookPaymentToDB } = require('../../utils/mongodb');
const client = require('../../discord/client');
const { createTicket } = require('../../handler/ticketManager');
const { getProductDisplayName } = require('../../utils/productname');
const { updatePaymentStatusOnChannel } = require('../../utils/statusonchanel');
const { applyVoucher } = require('../../services/voucherService');
const config = require('../../config/config');

router.post('/payos-webhook', async (req, res) => {
    try {
        console.log("Received Webhook Data:", req.body.data);
        const { orderCode, description, amount } = req.body.data;

        if (orderCode === 123 && description === "VQRIO123") {
            return res.status(200).send("Webhook confirmed received");
        }

        // Kiểm tra trạng thái thanh toán và cập nhật thông tin
        const pendingPayment = await getPendingPaymentFromDB(orderCode);

        if (!pendingPayment) {
            console.warn(`Không tìm thấy giao dịch với mã đơn hàng ${orderCode}`);
            return res.status(200).send("Không tìm thấy giao dịch.");
        }

        // Lấy thông tin từ giao dịch đang chờ
        const userId = pendingPayment.userId || "unknownUser";
        const product = pendingPayment.product || "unknownProduct";
        const messageId = pendingPayment.messageId || null;
        const voucherCode = pendingPayment.voucherCode || null;

        // If voucher was used, mark it as used
        if (voucherCode) {
            try {
                await applyVoucher(voucherCode, userId, orderCode, amount);
                console.log(`Voucher ${voucherCode} marked as used for order ${orderCode}`);
            } catch (voucherError) {
                console.error(`Error applying voucher ${voucherCode}:`, voucherError);
                // Continue with payment processing even if voucher marking fails
            }
        }

        const user = await client.users.fetch(userId);
        const guild = await client.guilds.fetch(config.guildId);
        const ticketChannel = await createTicket(client, guild, user);

        await saveWebhookPaymentToDB(orderCode, amount, product, userId, "completed");

        const updatedEmbed = new EmbedBuilder()
            .setTitle("Thanh toán của bạn đã hoàn tất")
            .setDescription(`\`\`\`diff\n+ Thanh toán của bạn đã được xử lý thành công\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
            .addFields(
                { name: "Số tiền", value: `\`${amount} VND\``, inline: true },
                { name: "Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
                { name: "Sản phẩm", value: `\`${getProductDisplayName(product)}\``, inline: true }
            )
            .setColor(0x00FF00)
            .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
            .setTimestamp();

        try {
            const dmChannel = await user.createDM();
            console.log(`Đã tạo kênh DM cho người dùng ${userId}`);

            if (messageId) {
                try {
                    const sentMessage = await dmChannel.messages.fetch(messageId);
                    await sentMessage.edit({ embeds: [updatedEmbed] });
                } catch (fetchError) {
                    await dmChannel.send({ embeds: [updatedEmbed] });
                }
            } else {
                await dmChannel.send({ embeds: [updatedEmbed] });
            }
        } catch (dmError) {
            console.error(`Lỗi khi gửi hoặc chỉnh sửa DM cho người dùng ${userId}:`, dmError);
        }

        // Cập nhật trạng thái thanh toán lên Discord channel
        await updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, "completed");

        return res.status(200).send("Webhook successfully processed");
    } catch (error) {
        console.error("Lỗi xử lý webhook:", error);
        res.status(500).send("Lỗi xử lý webhook");
    }
});

module.exports = router;
