const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const dotenv = require("dotenv");
const payOS = require("./src/payos");
const { getProductImageUrl } = require('./src/productImages');
const express = require("express");
const fs = require("fs");
const path = require("path");
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
  console.log("Bot đang hoạt động!");
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

  // Xử lý lệnh /shop
  if (interaction.isChatInputCommand() && interaction.commandName === 'shop') {
    const mainrow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_product')
          .setPlaceholder('Chọn sản phẩm chính')
          .addOptions([
            { label: 'Sản phẩm 1', description: 'Chọn Sản phẩm 1', value: 'product_1' },
            { label: 'Sản phẩm 2', description: 'Chọn Sản phẩm 2', value: 'product_2' },
            { label: 'Sản phẩm 3', description: 'Chọn Sản phẩm 3', value: 'product_3' }
          ])
      );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Chọn sản phẩm chính')
          .setDescription('Vui lòng chọn sản phẩm chính của bạn.')
          .setTimestamp(),
      ],
      components: [mainrow]
    });
  }

  // Khi người dùng chọn sản phẩm chính
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_product') {
    const selectedProduct = interaction.values[0];
    const productImageUrl = getProductImageUrl(selectedProduct);

    let subOptions = [];
    switch (selectedProduct) {
      case 'product_1':
        subOptions = [
          { label: 'Sản phẩm 1_1', value: 'product_1_1' },
          { label: 'Sản phẩm 1_2', value: 'product_1_2' },
          { label: 'Sản phẩm 1_3', value: 'product_1_3' }
        ];
        break;
      case 'product_2':
        subOptions = [
          { label: 'Sản phẩm 2_1', value: 'product_2_1' },
          { label: 'Sản phẩm 2_2', value: 'product_2_2' }
        ];
        break;
      case 'product_3':
        subOptions = [
          { label: 'Sản phẩm 3_1', value: 'product_3_1' },
          { label: 'Sản phẩm 3_2', value: 'product_3_2' }
        ];
        break;
    }
  
    const subMenuRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_sub_product')
          .setPlaceholder('Chọn lựa chọn phụ')
          .addOptions(subOptions)
      );
  
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('Chọn sản phẩm')
          .setDescription(`Vui lòng chọn lựa chọn phụ cho sản phẩm **${selectedProduct}**`)
          .setImage(productImageUrl)
          .setTimestamp(),
      ],
      components: [subMenuRow],
      ephemeral: true
    });
  }

  // Khi người dùng chọn lựa chọn phụ
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_sub_product') {
    const selectedSubProduct = interaction.values[0];

    // Tạo mã đơn hàng và liên kết thanh toán
    const domain = process.env.YOUR_DOMAIN;
    const orderCode = Number(String(Date.now()).slice(-6)); // Tạo mã đơn hàng duy nhất

    const body = {
      orderCode,
      amount: 10000, // Có thể điều chỉnh số tiền theo sản phẩm
      description: selectedSubProduct,
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

      const user = await client.users.fetch(interaction.user.id);
      if (user) {
        // Tạo Embed ban đầu (Chưa hoàn tất thanh toán)
        const embed = new EmbedBuilder()
          .setDescription('**Trạng thái thanh toán:** ```\nChưa hoàn tất thanh toán```')
          .addFields(
            { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
            { name: "Số tiền", value: `${body.amount}`, inline: true },
            { name: "Sản phẩm", value: selectedSubProduct, inline: true }
          )
          .setImage(qrCodeImageUrl)
          .setTimestamp();
  
        // Gửi tin nhắn DM
        const sentMessage = await user.send({ embeds: [embed] });
  
        // Lưu thông tin thanh toán vào pendingPayments
        pendingPayments[orderCode] = {
          amount: body.amount,
          product: selectedSubProduct,
          userId: interaction.user.id,
          messageId: sentMessage.id, // Lưu messageId để cập nhật sau này
        };
      }
  
      // Hoàn thành tương tác bằng cách gửi phản hồi tới người dùng
      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('Đã gửi mã QR thanh toán qua DM của bạn!')
            .setColor(0x00FF00) // Màu xanh lá cây để biểu thị thành công
        ]
      });

      // Gửi thông tin đơn hàng lên kênh quản trị
      const productImageUrl = getProductImageUrl(selectedSubProduct);
      const pendingChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID);
      if (pendingChannel && pendingChannel.isTextBased()) {
        await pendingChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thông tin giao dịch người dùng")
              .setDescription('**Trạng thái thanh toán:** ```\nChưa hoàn tất thanh toán```')
              .addFields(
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "ID người dùng", value: `${interaction.user.id}`, inline: true },
                { name: "Số tiền", value: `${body.amount}`, inline: true },
                { name: "Sản phẩm", value: `**\`${selectedSubProduct}\`**`, inline: false },
                { name: "URL mã QR", value: `[Thanh toán QRCode](${qrCodeImageUrl})` },
                { name: "Liên kết thanh toán", value: `[Thanh toán qua liên kết](${paymentLinkResponse.checkoutUrl})`, inline: false }
              )             
              //.setImage(qrCodeImageUrl)
              .setImage(productImageUrl)
              .setTimestamp()
          ]
        });
      }

    } catch (error) {
      console.error("Đã xảy ra lỗi khi tạo liên kết thanh toán:", error);
      await interaction.reply({ content: "Đã xảy ra lỗi khi tạo liên kết thanh toán.", ephemeral: true });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Webhook nhận thông báo thanh toán
app.post("/payos-webhook", async (req, res) => {
  try {
    const { orderCode, description, amount } = req.body.data;

    if (!orderCode) {
      console.error("Invalid webhook data:", req.body);
      return res.status(400).send("Invalid webhook data");
    }
    if (orderCode === 123 && description === "VQRIO123") {
      // for confirming webhook
      return res.status(200).send("Webhook confirmed received");
    }

    if (pendingPayments[orderCode].amount === amount) {
      const { userId, product, messageId } = pendingPayments[orderCode];

      // Lấy key từ file JSON
      const keyFilePath = path.join(__dirname, 'key', `${product}_keys.json`);
      let keys;

      try {
        const data = fs.readFileSync(keyFilePath, 'utf8');
        if (!data) {
          throw new Error('File key rỗng');
        }
        keys = JSON.parse(data);
      } catch (err) {
        console.error("Lỗi khi đọc file key:", err);
        const user = await client.users.fetch(userId);
        if (user) {
          await user.send({
            embeds: [
              {
                title: "Lỗi Key",
                description: `Xin lỗi, chúng tôi không thể đọc hoặc lấy key cho sản phẩm **${product}**.`,
                fields: [
                  { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                  { name: "Số tiền", value: `${amount} VND`, inline: true }
                ],
                color: 0xFF0000, // Màu đỏ để báo lỗi
                footer: { text: "Vui lòng liên hệ hỗ trợ." }
              }
            ]
          });
        }
        return res.status(500).send("Lỗi khi đọc file key");
      }

      if (!keys || keys.length === 0) {
        console.error("Không còn key cho sản phẩm:", product);
        const user = await client.users.fetch(userId);
        if (user) {
          await user.send({
            embeds: [
              {
                title: "Key không khả dụng",
                description: `Xin lỗi, không còn key cho sản phẩm **${product}**.`,
                fields: [
                  { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                  { name: "Số tiền", value: `${amount} VND`, inline: true }
                ],
                color: 0xFF0000,
                footer: { text: "Vui lòng liên hệ hỗ trợ." }
              }
            ]
          });
        }
        return res.status(500).send("Không còn key khả dụng");
      }

      const keyToSend = keys.shift(); // Lấy key đầu tiên và xóa khỏi danh sách

      // Lưu lại file JSON đã cập nhật
      try {
        fs.writeFileSync(keyFilePath, JSON.stringify(keys, null, 2));
      } catch (err) {
        console.error("Lỗi khi lưu file key:", err);
        const user = await client.users.fetch(userId);
        if (user) {
          await user.send({
            embeds: [
              {
                title: "Lỗi khi xử lý Key",
                description: `Xin lỗi, đã xảy ra lỗi khi xử lý key của bạn cho sản phẩm **${product}**.`,
                fields: [
                  { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                  { name: "Số tiền", value: `${amount} VND`, inline: true }
                ],
                color: 0xFF0000,
                footer: { text: "Vui lòng liên hệ hỗ trợ." }
              }
            ]
          });
        }
        return res.status(500).send("Lỗi khi lưu file key");
      }

      // Lấy lại tin nhắn ban đầu bằng messageId và cập nhật nó
      const user = await client.users.fetch(userId);
      const dmChannel = await user.createDM();
      const sentMessage = await dmChannel.messages.fetch(messageId);
      const productImageUrl = getProductImageUrl(product);
      if (sentMessage) {
        // Cập nhật tin nhắn với key sản phẩm
        const updatedEmbed = new EmbedBuilder()
          .setTitle("Đơn hàng đã hoàn thành")
          .setDescription(`**Key sản phẩm:** \n\`\`\`${keyToSend}\`\`\``)
          .addFields(
            { name: "Số tiền", value: `${amount} VND`, inline: true },
            { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
            { name: "Sản phẩm", value: `${product}`, inline: true },
          )
          .setColor(0x00FF00) // Màu xanh lá để biểu thị thành công
          .setImage(productImageUrl)
          .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!" })
          .setTimestamp();

        // Cập nhật tin nhắn với embed mới
        await sentMessage.edit({ embeds: [updatedEmbed] });
      }

      // Cập nhật tin nhắn trong kênh quản trị
      
      const pendingChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID);
      const messages = await pendingChannel.messages.fetch({ limit: 100 });
      const orderMessage = messages.find(msg => msg.embeds[0]?.fields.some(field => field.value === orderCode.toString()));

      if (orderMessage) {
        await orderMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle('Hoàn tất thanh toán')
              .setDescription('**Trạng thái thanh toán:** ```\nThanh toán đã hoàn tất```')
              .addFields(
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "Số tiền", value: `${amount} VND`, inline: true },
                { name: "Sản phẩm", value: product, inline: true }
              )
              .setColor(0x00FF00)
              .setTimestamp()
          ]
        });
      }

      // Xóa thông tin thanh toán đã hoàn tất
      delete pendingPayments[orderCode];

      res.status(200).send(`Thanh toán cho đơn hàng ${orderCode} đã hoàn tất`);
    } else {
      console.error("Mã đơn hàng hoặc số tiền không hợp lệ");
      return res.status(500).send("Mã đơn hàng hoặc số tiền không hợp lệ");
    }
  } catch (error) {
    console.error("Lỗi xử lý webhook:", error);
    res.status(500).send("Lỗi xử lý webhook");
  }
});

// Khởi động bot Discord
client.login(process.env.TOKEN);

// Khởi động máy chủ Express
app.listen(PORT, function () {
  console.log(`Máy chủ Express đang lắng nghe trên cổng ${PORT}`);
});
