const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const payOS = require('../payos/payos');
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const bankNames = {
  '970422': 'MBBank',
  '970436': 'Vietcombank',
  '970415': 'VietinBank',
  '970418': 'BIDV',
  '970405': 'Agribank',
  '970448': 'OCB',
  '970407': 'Techcombank',
  '970416': 'ACB',
  '970432': 'VPBank',
  '970423': 'TPBank',
  '970403': 'Sacombank',
  '970437': 'HDBank',
  '970454': 'VietCapitalBank',
  '970429': 'SCB',
  '970441': 'VIB',
  '970443': 'SHB',
  '970431': 'Eximbank',
  '970426': 'MSB',
  '971005': 'ViettelMoney',
  '971011': 'VNPTMoney',
  '970400': 'SaigonBank',
  '970412': 'PVcomBank',
  '970414': 'Oceanbank',
  '970424': 'ShinhanBank',
  '970425': 'ABBANK'
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// client.once('ready', () => {
//   console.log('Bot is ready!');
// });

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'qrcode') {
      const bank = interaction.options.getString('bank');
      const accountNumber = interaction.options.getString('account');
      const accountName = interaction.options.getString('accountname');
      const amount = interaction.options.getInteger('amount');
      const memo = interaction.options.getString('memo');
      // const template = interaction.options.getString('template') || 'compact';
      // const media = interaction.options.getString('media') || 'jpg';

      const body = {
        bank,
        accountName,
        accountNumber,
        amount,
        description: memo || '',
        // template,
        // media,
        orderCode: Number(String(Date.now()).slice(-6)),
        returnUrl: `${process.env.YOUR_DOMAIN}/success.html`,
        cancelUrl: `${process.env.YOUR_DOMAIN}/cancel.html`,
      };

      try {
        const paymentLinkResponse = await payOS.createPaymentLink(body);
        const qrCodeImageUrl = `https://img.vietqr.io/image/${paymentLinkResponse.bin
          }-${paymentLinkResponse.accountNumber}-vietqr_pro.jpg?amount=${paymentLinkResponse.amount
          }&addInfo=${encodeURIComponent(paymentLinkResponse.description)}`;

        body.checkoutUrl = paymentLinkResponse.checkoutUrl;

        const embed = new EmbedBuilder()
          .setDescription('**Trạng thái thanh toán:** ```\nChưa hoàn tất thanh toán```')
          .addFields(
            { name: "Ngân hàng", value: `${bankNames[bank] || 'Unknown Bank'}`, inline: true },
            { name: "Số tài khoản", value: `${accountNumber}`, inline: true },
            { name: "Tên tài khoản", value: `${accountName}`, inline: true },
            { name: "Số tiền", value: `${amount} VND`, inline: true },
            { name: "Nội dung", value: `${memo || 'N/A'}`, inline: true },
            { name: "Mã đơn hàng", value: `${body.orderCode}`, inline: true }
          )
          .setImage(qrCodeImageUrl)
          .setTimestamp();

        await interaction.reply({ embeds: [embed] });

      } catch (err) {
        console.error(err);
        await interaction.reply('Đã xảy ra lỗi khi tạo liên kết thanh toán.');
      }
    }
});


// Xử lý webhook từ PayOS
// app.post("/payos-webhook", async (req, res) => {
//   try {
//     const { orderCode, description, amount } = req.body.data;

//     if (!orderCode) {
//       console.error("Invalid webhook data:", req.body);
//       return res.status(400).send("Invalid webhook data");
//     }
//     if (orderCode === 123 && description === "VQRIO123") {
//       return res.status(200).send("Webhook confirmed received");
//     }

//     if (pendingPayments[orderCode] && pendingPayments[orderCode].amount === amount) {
//       const { userId, product, messageId } = pendingPayments[orderCode];

//       const user = await client.users.fetch(userId); // Lấy thông tin người dùng
//       const guild = await client.guilds.fetch(process.env.GUILD_ID); // Lấy thông tin server Discord (cập nhật GUILD_ID)

//       const dmChannel = await user.createDM();
//       const sentMessage = await dmChannel.messages.fetch(messageId);

//       await sentMessage.edit({
//         embeds: [
//           new EmbedBuilder()
//             .setTitle("Thanh toán của bạn đã hoàn tất")
//             .setDescription(`\`\`\`yaml\nThanh toán của bạn đã được xử lý thành công\`\`\``)
//             .addFields(
//               { name: "Số tiền", value: `${amount} VND`, inline: true },
//               { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
//               { name: "Sản phẩm", value: `${product}`, inline: true }
//             )
//             .setColor(0x00FF00)
//             .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
//             .setTimestamp()
//         ]
//       });

//       // Gửi thông tin thanh toán đến kênh quản trị
//       const adminChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID); // ID kênh quản trị
//       await adminChannel.send({
//         embeds: [
//           new EmbedBuilder()
//             .setTitle('Thông báo thanh toán')
//             .addFields(
//               { name: "ID người dùng", value: `<@${userId}>`, inline: true },
//               { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
//               { name: "Sản phẩm", value: `${product}`, inline: true },
//               { name: "Số tiền", value: `${amount} VND`, inline: true }
//             )
//             .setColor(0x00FF00)
//             .setTimestamp()
//         ]
//       });

//       // Xóa thông tin thanh toán khỏi pendingPayments
//       // delete pendingPayments[orderCode];

//       return res.status(200).send(`Thanh toán cho đơn hàng ${orderCode} đã hoàn tất và ticket đã được tạo`);
//     } else {
//       console.error("Mã đơn hàng hoặc số tiền không hợp lệ");
//       return res.status(500).send("Mã đơn hàng hoặc số tiền không hợp lệ");
//     }
//   } catch (error) {
//     console.error("Lỗi xử lý webhook:", error);
//     res.status(500).send("Lỗi xử lý webhook");
//   }
// });

// Đăng nhập vào Discord bằng token
client.login(process.env.TOKEN);
