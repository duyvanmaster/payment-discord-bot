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

app.post("/payos-webhook", async (req, res) => {
  try {
    console.log("Received Webhook Data:", req.body.data);

    const { orderCode, description, amount } = req.body.data;

    if (!orderCode) {
      console.error("Invalid webhook data:", req.body);
      return res.status(400).send("Invalid webhook data");
    }
    if (orderCode === 123 && description === "VQRIO123") {
      // for confirming webhook
      return res.status(200).send("Webhook confirmed received");
    }

    // Check if the order code and amount match the pending payment
    if (
      pendingPayments[orderCode] &&
      pendingPayments[orderCode].amount === amount
    ) {
      pendingPayments[orderCode].status = "completed";
      // Edit messaage to show payment is completed
      const channel = await client.channels.fetch(process.env.CHANNEL_ID);
      if (!channel) {
        return res.status(500).send("Invalid channel ID");
      }

      res.status(200).send(`Payment for order ${orderCode} completed`);
      await channel.messages.edit(pendingPayments[orderCode].messageId, {
        content: "Thanh toán của bạn đã được xác nhận! Cảm ơn bạn.",
        embeds: [],
        components: [],
      });
      return;
    }
    return res.status(500).send("Invalid order code or amount");
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
