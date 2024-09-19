const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const dotenv = require("dotenv");
const payOS = require("./src/payos");
const { getProductImageUrl } = require('./src/productImages');
const productPrices = require('./src/productPrices');
const freeproductInfo = require('./src/freeproductinfo');
const express = require("express");
const fs = require("fs");
const path = require("path");
const productInfo = require('./src/productInfo');

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

// Hàm gửi DM cho người dùng
async function sendDM(userId, { embed, components }) {
  try {
    const user = await client.users.fetch(userId);
    if (user) {
      return await user.send({ embeds: [embed], components });
    }
  } catch (error) {
    console.error(`Lỗi khi gửi DM tới ${userId}:`, error);
  }
}

// Tạo embed cho sản phẩm miễn phí
function createFreeProductEmbed(selectedSubProduct) {
  const productImageUrl = getProductImageUrl(selectedSubProduct);
  
  // Kiểm tra nếu sản phẩm tồn tại trong freeproductInfo
  const product = freeproductInfo[selectedSubProduct];
  if (!product) {
    return {
      embed: new EmbedBuilder()
        .setTitle("Sản phẩm không hợp lệ")
        .setDescription("Không tìm thấy thông tin sản phẩm")
        .setColor(0xFF0000)
        .setTimestamp(),
      components: []
    };
  }

  // Tạo nút mở link
  const linkButton = new ButtonBuilder()
    .setLabel('Tải xuống')
    .setURL(product.downloadLink || 'https://default-link.com')
    .setStyle(ButtonStyle.Link);

  // Tạo hàng chứa nút
  const row = new ActionRowBuilder().addComponents(linkButton);

  // Tạo embed cho sản phẩm
  const embed = new EmbedBuilder()
    .setTitle(product.title || 'Không có tiêu đề')
    .setDescription(product.description || 'Không có mô tả')
    .setColor(0x007AFF)
    .setImage(productImageUrl)
    .setFooter({
      text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!", 
      iconURL: 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/rf2o4ffc.png'
    })
    .setTimestamp();

  return { embed, components: [row] }; // Trả về embed và hàng chứa nút
}

// Xử lý thanh toán và tạo mã QR
async function handlePayment(selectedSubProduct, interaction, body) {
  try {
    const paymentLinkResponse = await payOS.createPaymentLink(body);
    const qrCodeImageUrl = `https://img.vietqr.io/image/${
      paymentLinkResponse.bin
    }-${paymentLinkResponse.accountNumber}-vietqr_pro.jpg?amount=${
      paymentLinkResponse.amount
    }&addInfo=${encodeURIComponent(paymentLinkResponse.description)}`;
    body.checkoutUrl = paymentLinkResponse.checkoutUrl;

    // Tạo Embed ban đầu
    const embed = new EmbedBuilder()
      .setDescription('**Trạng thái thanh toán:** ```\nChưa hoàn tất thanh toán```')
      .addFields(
        { name: "Sản phẩm", value: `**\`${selectedSubProduct}\`**`, inline: true },
        { name: "Mã đơn hàng", value: `${body.orderCode}`, inline: true },
        { name: "Số tiền", value: `${body.amount}`, inline: true }
      )
      .setImage(qrCodeImageUrl)
      .setTimestamp();

    // Gửi tin nhắn DM và lưu trạng thái thanh toán
    const sentMessage = await sendDM(interaction.user.id, { embed, components: [] });
    pendingPayments[body.orderCode] = {
      amount: body.amount,
      product: selectedSubProduct,
      userId: interaction.user.id,
      messageId: sentMessage.id,
    };

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('Đã gửi mã QR thanh toán qua DM của bạn!')
          .setColor(0x007AFF)
      ],
      ephemeral: true
    });

    return qrCodeImageUrl;
  } catch (error) {
    console.error("Lỗi khi tạo liên kết thanh toán:", error);
    await interaction.reply({ content: "Đã xảy ra lỗi khi tạo liên kết thanh toán.", ephemeral: true });
    throw error;
  }
}

// Xử lý lệnh /shop
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

  if (interaction.isChatInputCommand() && interaction.commandName === 'shop') {
    const mainrow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_product')
          .setPlaceholder('Chọn sản phẩm chính')
          .addOptions([
            { label: 'AIO LegitVN', description: 'Nhấn vào đây để xem chi tiết hơn AIO LegitVN', value: 'aiolegitvn' },
            { label: 'Regedit', description: 'Nhấn vào đây để xem bảng giá Regedit', value: 'regedit' },
            { label: 'Tối ưu Giả lập & PC', description: 'Nhấn vào đây để xem bảng giá Tối ưu', value: 'optimize' },
            { label: 'Free', description: 'Nhấn vào đây để xem các mục miễn phí', value: 'free', emoji: '🎁' }
          ])
      );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('LegitVN Bot')
          .setDescription('Lựa chọn sản phẩm dưới menu để thêm biết chi tiết')
          .setTimestamp(),
      ],
      components: [mainrow]
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_product') {
    const selectedProduct = interaction.values[0];
    const productImageUrl = getProductImageUrl(selectedProduct);
    const productDetails = productInfo[selectedProduct];

    if (!productDetails) {
      await interaction.reply({
        content: 'Sản phẩm không hợp lệ. Vui lòng thử lại.',
        ephemeral: true,
      });
      return;
    }

    let subOptions = Object.keys(productDetails.subProducts).map(subProductKey => ({
      label: productDetails.subProducts[subProductKey].title,
      value: subProductKey,
      description: productDetails.subProducts[subProductKey].description,
    }));

    const subMenuRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_sub_product')
          .setPlaceholder('Chọn sản phẩm con')
          .addOptions(subOptions)
      );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(productDetails.title)
          .setDescription(productDetails.description)
          .setImage(productImageUrl)
          .setTimestamp(),
      ],
      components: [subMenuRow],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_sub_product') {
    const selectedSubProduct = interaction.values[0];

    if (selectedSubProduct.startsWith('legit_')) {
      const { embed, components } = createFreeProductEmbed(selectedSubProduct);
      await sendDM(interaction.user.id, { embed, components });

      const freeProductInfo = {
        product: selectedSubProduct,
        userId: interaction.user.id,
        orderCode: `FREE-${Date.now()}`
      };
      pendingPayments[freeProductInfo.orderCode] = freeProductInfo;

      const pendingChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID);
      if (pendingChannel && pendingChannel.isTextBased()) {
        await pendingChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thông tin sản phẩm miễn phí")
              .setDescription('**Trạng thái:** ```\nSản phẩm miễn phí đã được yêu cầu```')
              .addFields(
                { name: "Mã đơn hàng", value: freeProductInfo.orderCode, inline: true },
                { name: "ID người dùng", value: `<@${interaction.user.id}>`, inline: true },
                { name: "Sản phẩm", value: `**\`${selectedSubProduct}\`**`, inline: false }
              )
              .setColor(0x007AFF)
              .setTimestamp()
          ]
        });
      }

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription('Đã gửi thông tin sản phẩm miễn phí vào DM của bạn!')
            .setColor(0x007AFF)
        ],
        ephemeral: true
      });
    } else {
      const parentProduct = Object.keys(productInfo).find(productKey => {
        return productInfo[productKey].subProducts && productInfo[productKey].subProducts[selectedSubProduct];
      });

      if (!parentProduct) {
        await interaction.reply({
          content: 'Sản phẩm không hợp lệ. Vui lòng thử lại.',
          ephemeral: true,
        });
        return;
      }

      const subProductDetails = productInfo[parentProduct].subProducts[selectedSubProduct];

      if (!subProductDetails) {
        await interaction.reply({
          content: 'Lựa chọn không hợp lệ. Vui lòng thử lại.',
          ephemeral: true,
        });
        return;
      }

      const orderCode = Number(String(Date.now()).slice(-6));
      const productPrice = productPrices[selectedSubProduct] || 10000;

      const body = {
        orderCode,
        amount: productPrice,
        description: selectedSubProduct,
        returnUrl: `${process.env.YOUR_DOMAIN}/success.html`,
        cancelUrl: `${process.env.YOUR_DOMAIN}/cancel.html`,
      };

      const qrCodeImageUrl = await handlePayment(selectedSubProduct, interaction, body);

      const pendingChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID);
      if (pendingChannel && pendingChannel.isTextBased()) {
        await pendingChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thông tin giao dịch người dùng")
              .setDescription('**Trạng thái thanh toán:** ```\nChưa hoàn tất thanh toán```')
              .addFields(
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "ID người dùng", value: `<@${interaction.user.id}>`, inline: true },
                { name: "Số tiền", value: `${body.amount} VND`, inline: true },
                { name: "Sản phẩm", value: `**\`${selectedSubProduct}\`**`, inline: false },
                { name: "URL mã QR", value: `[Thanh toán QRCode](${qrCodeImageUrl})` },
                { name: "Liên kết thanh toán", value: `[Thanh toán qua liên kết](${body.checkoutUrl})`, inline: false }
              )
              .setImage(getProductImageUrl(selectedSubProduct))
              .setTimestamp()
          ]
        });
      }
    }
  }
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
      return res.status(200).send("Webhook confirmed received");
    }

    if (pendingPayments[orderCode].amount === amount) {
      const { userId, product, messageId } = pendingPayments[orderCode];

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
        await sendDM(userId, {
          embed: new EmbedBuilder()
            .setTitle("Lỗi Key")
            .setDescription(`Xin lỗi, chúng tôi không thể đọc hoặc lấy key cho sản phẩm **${product}**.`)
            .setColor(0xFF0000)
            .setFooter({ text: "Vui lòng liên hệ hỗ trợ." })
            .setTimestamp(),
          components: []
        });
        return res.status(500).send("Lỗi khi đọc file key");
      }

      if (!keys || keys.length === 0) {
        console.error("Không còn key cho sản phẩm:", product);
        await sendDM(userId, {
          embed: new EmbedBuilder()
            .setTitle("Key không khả dụng")
            .setDescription(`Xin lỗi, không còn key cho sản phẩm **${product}**.`)
            .setColor(0xFF0000)
            .setFooter({ text: "Vui lòng liên hệ hỗ trợ." })
            .setTimestamp(),
          components: []
        });
        return res.status(500).send("Không còn key khả dụng");
      }

      const keyToSend = keys.shift();

      try {
        fs.writeFileSync(keyFilePath, JSON.stringify(keys, null, 2));
      } catch (err) {
        console.error("Lỗi khi lưu file key:", err);
        await sendDM(userId, {
          embed: new EmbedBuilder()
            .setTitle("Lỗi khi xử lý Key")
            .setDescription(`Xin lỗi, đã xảy ra lỗi khi xử lý key của bạn cho sản phẩm **${product}**.`)
            .setColor(0xFF0000)
            .setFooter({ text: "Vui lòng liên hệ hỗ trợ." })
            .setTimestamp(),
          components: []
        });
        return res.status(500).send("Lỗi khi lưu file key");
      }

      const user = await client.users.fetch(userId);
      const dmChannel = await user.createDM();
      const sentMessage = await dmChannel.messages.fetch(messageId);
      const productImageUrl = getProductImageUrl(product);

      if (sentMessage) {
        const updatedEmbed = new EmbedBuilder()
          .setTitle("Đơn hàng đã hoàn thành")
          .setDescription(`**Key sản phẩm:** \n\`\`\`${keyToSend}\`\`\``)
          .addFields(
            { name: "Số tiền", value: `${amount} VND`, inline: true },
            { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
            { name: "Sản phẩm", value: `${product}`, inline: true }
          )
          .setColor(0x00FF00)
          .setImage(productImageUrl)
          .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!" })
          .setTimestamp();

        await sentMessage.edit({ embeds: [updatedEmbed] });
      }

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
                { name: "Sản phẩm", value: product, inline: true },
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "Số tiền", value: `${amount} VND`, inline: true },
                { name: "ID người dùng", value: `<@${userId}>`, inline: true }
              )
              .setColor(0x00FF00)
              .setTimestamp()
          ]
        });
      }

      delete pendingPayments[orderCode];
      res.status(200).send(`Thanh toán cho đơn hàng ${orderCode} đã hoàn tất`);
    } else {
      console.error(" ");
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
