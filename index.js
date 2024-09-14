const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
} = require("discord.js");
const dotenv = require("dotenv");
const payOS = require("./src/payos"); // Đảm bảo rằng payOS chứa các phương thức chính xác
const express = require("express");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let pendingPayments = {};

// Khi bot đã sẵn sàng
client.once("ready", () => {
  console.log("Bot is online!");
});

// Tạo đơn hàng và lưu thông tin vào pendingPayments
client.on("messageCreate", async (message) => {
  if (message.content === "!create-payment") {
    const domain = process.env.YOUR_DOMAIN;
    const orderCode = Number(String(Date.now()).slice(-6)); // Tạo mã đơn hàng duy nhất
    const body = {
      orderCode,
      amount: 10000,  // Ví dụ bạn đang lưu số tiền 10000
      description: "legitvn 150",
      returnUrl: `${domain}/success.html`,
      cancelUrl: `${domain}/cancel.html`,
    };

    try {
      const paymentLinkResponse = await payOS.createPaymentLink(body);
      const qrCodeImageUrl = `https://img.vietqr.io/image/${
        paymentLinkResponse.bin
      }-${paymentLinkResponse.accountNumber}-vietqr_pro.jpg?amount=${
        paymentLinkResponse.amount
      }&addInfo=${encodeURIComponent(paymentLinkResponse.description)}`;

      const embed = new EmbedBuilder()
        .setTitle("Payment Link")
        .setDescription(
          "Please use the link or scan the QR code to complete the payment."
        )
        .addFields(
          { name: "Order Code", value: `${orderCode}`, inline: true },
          { name: "Amount", value: `${body.amount}`, inline: true }
        )
        .setImage(qrCodeImageUrl)
        .setURL(paymentLinkResponse.checkoutUrl);

      const messageResponse = await message.reply({
        embeds: [embed],
      });

      // Lưu thông tin thanh toán vào pendingPayments
      pendingPayments[orderCode] = {
        amount: body.amount,
        messageId: messageResponse.id,
        status: "pending",
        qrCodeImageUrl,
        body,
        userId: message.author.id, // Lưu userId để gửi DM sau này
      };

      // Log pendingPayments để kiểm tra
      console.log("Pending Payments:", pendingPayments);
    } catch (error) {
      console.error("Error creating payment:", error);
      message.reply("Something went wrong with creating the payment link.");
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Webhook xử lý khi nhận thanh toán
app.post("/payos-webhook", async (req, res) => {
  try {
    console.log("Received Webhook Data:", req.body.data);
    const { orderCode, amount } = req.body.data;

    // Kiểm tra orderCode và amount nhận từ webhook
    console.log(`OrderCode from webhook: ${orderCode}, Amount from webhook: ${amount}`);
    console.log("Pending Payments:", pendingPayments);

    // Kiểm tra xem mã đơn hàng và số tiền có khớp không
    if (pendingPayments[orderCode] && pendingPayments[orderCode].amount === amount) {
      pendingPayments[orderCode].status = "completed";

      const userId = pendingPayments[orderCode].userId;
      console.log(`UserId for this payment: ${userId}`);

      // Kiểm tra xem userId có tồn tại không
      if (!userId) {
        console.error("User ID not found for order:", orderCode);
        return res.status(500).send("User ID not found");
      }

      // Lấy người dùng qua userId
      const user = await client.users.fetch(userId);
      console.log("Fetched user:", user);

      if (!user) {
        console.error("User not found for ID:", userId);
        return res.status(500).send("User not found");
      }

      // Gửi tin nhắn xác nhận thanh toán qua DM
      await user.send({
        embeds: [
          {
            title: "Xác nhận thanh toán",
            description: `Thanh toán của bạn với mã đơn hàng **${orderCode}** đã được xác nhận!`,
            fields: [
              { name: "Số tiền", value: `${amount} VND`, inline: true },
              { name: "Mã đơn hàng", value: `${orderCode}`, inline: true }
            ],
            color: 0x00FF00, // Màu xanh lá cây để thể hiện thành công
            footer: { text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!" }
          }
        ]
      });
      console.log("Payment confirmed and DM sent to user");

      res.status(200).send(`Payment for order ${orderCode} completed`);
    } else {
      console.error("Invalid order code or amount");
      return res.status(500).send("Invalid order code or amount");
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).send("Error processing webhook");
  }
});

// Khởi động bot Discord
client.login(process.env.TOKEN);

// Khởi động máy chủ Express
app.listen(PORT, function () {
  console.log(`Express server is listening on port ${PORT}`);
});
