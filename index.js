const { Client, GatewayIntentBits, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const dotenv = require('dotenv');
const payOS = require('./src/payos'); // Đảm bảo rằng payOS chứa các phương thức chính xác
const express = require('express');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

let pendingPayments = {};

client.once('ready', () => {
    console.log('Bot is online!');
});

client.on('messageCreate', async message => {
    if (message.content === '!create-payment') {
        const YOUR_DOMAIN = 'http://localhost:3030';
        const orderCode = Number(String(Date.now()).slice(-6)); // Tạo mã đơn hàng duy nhất
        const body = {
            orderCode,
            amount: 10000,
            description: 'legitvn 150',
            returnUrl: `${YOUR_DOMAIN}/success.html`,
            cancelUrl: `${YOUR_DOMAIN}/cancel.html`
        };

        try {
            const paymentLinkResponse = await payOS.createPaymentLink(body);
            const qrCodeImageUrl = `https://img.vietqr.io/image/${paymentLinkResponse.bin}-${paymentLinkResponse.accountNumber}-vietqr_pro.jpg?amount=${paymentLinkResponse.amount}&addInfo=${encodeURIComponent(paymentLinkResponse.description)}`;

            const completePaymentButton = new ButtonBuilder()
                .setCustomId('complete_payment')
                .setLabel('Hoàn tất thanh toán')
                .setStyle(ButtonStyle.Success);

            const cancelPaymentButton = new ButtonBuilder()
                .setCustomId('cancel_payment')
                .setLabel('Hủy thanh toán')
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(completePaymentButton, cancelPaymentButton);

            const embed = new EmbedBuilder()
                .setTitle('Payment Link')
                .setDescription('Please use the link or scan the QR code to complete the payment.')
                .addFields(
                    { name: 'Order Code', value: `${orderCode}`, inline: true },
                    { name: 'Amount', value: `${body.amount}`, inline: true }
                )
                .setImage(qrCodeImageUrl)
                .setURL(paymentLinkResponse.checkoutUrl);

            const messageResponse = await message.reply({ embeds: [embed], components: [row] });

            pendingPayments[orderCode] = {
                messageId: messageResponse.id,
                status: 'pending'
            };
        } catch (error) {
            console.error(error);
            message.reply('Something went wrong with creating the payment link.');
        }
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isButton()) return;

    const { customId } = interaction;
    const orderCode = Object.keys(pendingPayments).find(code => pendingPayments[code].messageId === interaction.message.id);

    if (!orderCode) {
        await interaction.reply({ content: 'Invalid action. Please start a new payment process.', ephemeral: true });
        return;
    }

    if (customId === 'complete_payment') {
        try {
            // Gửi yêu cầu kiểm tra trạng thái thanh toán
            const paymentSuccessful = await payOS.checkPaymentStatus(orderCode);

            if (paymentSuccessful) {
                await interaction.update({
                    content: 'Thanh toán của bạn đã được xác nhận! Cảm ơn bạn.',
                    components: []
                });
                pendingPayments[orderCode].status = 'completed';
            } else {
                await interaction.update({
                    content: 'Thanh toán chưa hoàn tất. Vui lòng thử lại hoặc kiểm tra thông tin thanh toán.',
                    components: []
                });
            }
        } catch (error) {
            console.error('Error checking payment status:', error);
            await interaction.reply({ content: 'Error checking payment status. Please try again later.', ephemeral: true });
        }
    } else if (customId === 'cancel_payment') {
        try {
            await payOS.cancelPayment(orderCode); // Gọi hàm hủy thanh toán chính xác
            await interaction.update({
                content: 'Thanh toán đã bị hủy.',
                components: []
            });
            pendingPayments[orderCode].status = 'canceled';
        } catch (error) {
            console.error('Error canceling payment:', error);
            await interaction.reply({ content: 'Không thể hủy thanh toán. Vui lòng thử lại.', ephemeral: true });
        }
    }
});

app.post('/payos-webhook', async (req, res) => {
    try {
        console.log('Received Webhook Data:', req.body);

        const { orderCode, status } = req.body.data;

        if (!orderCode || !status) {
            console.error('Invalid webhook data:', req.body);
            return res.status(400).send('Invalid webhook data');
        }

        // Cập nhật trạng thái thanh toán vào bộ nhớ tạm thời
        if (pendingPayments[orderCode]) {
            pendingPayments[orderCode].status = status;
        }

        res.status(200).send('Webhook received');
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('Error processing webhook');
    }
});

// Khởi động bot Discord
client.login(process.env.TOKEN);

// Khởi động máy chủ Express
app.listen(PORT, function () {
    console.log(`Express server is listening on port ${PORT}`);
});
