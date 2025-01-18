const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const dotenv = require("dotenv");
const payOS = require('./src/payos/payos');
const { updatePaymentStatusOnChannel } = require('./src/utils/statusonchanel');
const qrcode = require('./src/handler/qrcode')
const verify = require('./src/handler/verify')
const reply = require('./src/handler/reply')
const sendmessage = require('./src/handler/sendmessage')
const express = require("express");
const fs = require("fs");
const path = require("path");
const { createTicket } = require('./src/handler/ticketManager');
const mongoose = require('mongoose');
const { savePaymentToDB, saveFreeProductToDB, saveWebhookPaymentToDB } = require('./src/utils/mongodb');
const { userMention } = require('@discordjs/builders');
const { getProductInfo } = require('./src/firebase/firebaseService');
const { getProductDisplayName } = require('./src/utils/productname')
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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  client.user.setActivity({
    name: '.gg/legitvn',
  });
});

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

// Cập nhật chức năng lấy thông tin sản phẩm từ Firebase
async function createFreeProductEmbed(selectedSubProduct) {
  const products = await getProductInfo();  // Lấy dữ liệu từ Firebase
  const product = products.freeproductInfo[selectedSubProduct];
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

  const linkButton = new ButtonBuilder()
    .setLabel('Tải xuống')
    .setURL(product.downloadLink || 'https://discord.gg/legitvn')
    .setStyle(ButtonStyle.Link);

  const row = new ActionRowBuilder().addComponents(linkButton);

  const embed = new EmbedBuilder()
    .setTitle(product.title || 'Không có tiêu đề')
    .setDescription(product.description || 'Không có mô tả')
    .setImage(product.imageUrl)
    .setFooter({
      text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!",
      iconURL: 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/rf2o4ffc.png'
    })
    .setTimestamp();

  return { embed, components: [row] };
}


async function handlePayment(selectedSubProduct, interaction, body) {
  try {
    // Kiểm tra nếu deferReply đã được gọi trước đó
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const paymentLinkResponse = await payOS.createPaymentLink(body);
    const qrCodeImageUrl = `https://img.vietqr.io/image/${paymentLinkResponse.bin
      }-${paymentLinkResponse.accountNumber}-vietqr_pro.jpg?amount=${paymentLinkResponse.amount
      }&addInfo=${encodeURIComponent(paymentLinkResponse.description)}`;
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
    const sentMessage = await sendDM(interaction.user.id, { embed, components: [] });

    // Gửi thông tin đến kênh thanh toán
    const pendingChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID);
    if (pendingChannel && pendingChannel.isTextBased()) {
      await pendingChannel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle("Thông tin giao dịch người dùng")
            .setDescription('**Trạng thái thanh toán:** ```Chưa hoàn tất thanh toán```')
            .addFields(
              { name: "Mã đơn hàng", value: `${body.orderCode}`, inline: true },
              { name: "ID người dùng", value: `<@${interaction.user.id}>`, inline: true },
              { name: "Số tiền", value: `${body.amount} VND`, inline: true },
              { name: "Sản phẩm", value: `**\`${getProductDisplayName(selectedSubProduct)}\`**`, inline: false },
              // { name: "URL mã QR", value: `[Thanh toán QRCode](${qrCodeImageUrl})` },
              { name: "Liên kết thanh toán", value: `[Thanh toán qua liên kết](${body.checkoutUrl})`, inline: false }
            )
            // .setImage(qrCodeImageUrl)
            .setTimestamp()
        ]
      });
    }

    // Dùng Edit Reply để xử lí bất đồng bộ
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription('Đã gửi mã QR thanh toán qua DM của bạn!')
          .setColor(0x007AFF)
      ]
    });

    pendingPayments[body.orderCode] = {
      amount: body.amount,
      product: selectedSubProduct,
      userId: interaction.user.id,
      messageId: sentMessage.id,
    };

    await savePaymentToDB(body, selectedSubProduct, interaction, sentMessage);

    return qrCodeImageUrl;
  } catch (error) {
    console.error("Lỗi khi tạo liên kết thanh toán:", error);

    await interaction.editReply({ content: "Đã xảy ra lỗi khi tạo liên kết thanh toán." });
    throw error;
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

  if (interaction.isChatInputCommand() && interaction.commandName === 'legitvn') {
    const member = interaction.member;
    const guildOwnerId = interaction.guild.ownerId;

    const products = await getProductInfo();  // Lấy dữ liệu từ Firebase

    if (member.id === guildOwnerId) {
      const mainOptions = Object.keys(products.productInfo).map(key => ({
        label: products.productInfo[key].title,
        value: key,
        emoji: products.productInfo[key].emoji,
      }));

      const mainRow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_product')
            .setPlaceholder('CHỌN DỊCH VỤ')
            .addOptions(mainOptions)
        );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('ÔNG BỤT LEGITVN CHỌN GÌ CÓ ĐÓ')
            .setDescription('<a:arrow:1293222327126982737> Trang Web chính thức: [LegitVN](https://legitvn.com/)\n<a:arrow:1293222327126982737> Mọi vấn đề liên quan liên hệ: <@948239925701115914>')
            .setImage('https://cdn.discordapp.com/attachments/1161271813460996126/1204309215582232616/gamesensepricehigh.gif?ex=67061f5b&is=6704cddb&hm=b16470f4c08857c5a0a9690120a11fc7102ef15f0d49bf3abbef4dfe7422b022&')
            .setFooter({ text: 'LegitVN | The best or nothing' })
            .setTimestamp(),
        ],
        components: [mainRow]
      });
    }
    else {
      await interaction.reply({ content: 'Bạn không có quyền để sử dụng lệnh này.', ephemeral: true });
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_product') {
    const selectedProduct = interaction.values[0];
    const products = await getProductInfo();  // Lấy dữ liệu từ Firebase
    const productDetails = products.productInfo[selectedProduct];

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
      emoji: productDetails.subProducts[subProductKey].emoji,
    }));

    const subMenuRow = new ActionRowBuilder()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_sub_product')
          .setPlaceholder('Chọn dịch vụ tại đây')
          .addOptions(subOptions)
      );

    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(productDetails.title)
          .setDescription(productDetails.description)
          .setImage(productDetails.imageUrl)
          .setTimestamp(),
      ],
      components: [subMenuRow],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_sub_product') {
    const selectedSubProduct = interaction.values[0];
    const products = await getProductInfo();  // Lấy dữ liệu từ Firebase

    await interaction.deferReply({ ephemeral: true });

    if (selectedSubProduct.startsWith('free_')) {
      const { embed, components } = await createFreeProductEmbed(selectedSubProduct);
      await sendDM(interaction.user.id, { embed, components });

      const freeProductInfo = {
        product: selectedSubProduct,
        userId: interaction.user.id,
        orderCode: `FREE-${Date.now()}`,
      };

      let mentionableUser;

      try {
        mentionableUser = userMention(interaction.user.id);
      } catch (error) {
        mentionableUser = interaction.user.username;
      }

      const displayNameWithAt = `@${interaction.member ? interaction.member.displayName : interaction.user.username}`;

      pendingPayments[freeProductInfo.orderCode] = freeProductInfo;

      const pendingChannel = await client.channels.fetch(process.env.PAYMENTS_CHANNEL_ID);
      if (pendingChannel && pendingChannel.isTextBased()) {
        await pendingChannel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thông tin sản phẩm miễn phí")
              .setDescription('**Trạng thái:** ```diff\n+ Sản phẩm miễn phí đã được yêu cầu```')
              .addFields(
                { name: "ID người dùng", value: mentionableUser, inline: false },
                { name: "Mã đơn hàng", value: `\`${freeProductInfo.orderCode}\``, inline: false },
                { name: "Sản phẩm", value: `\`${getProductDisplayName(selectedSubProduct)}\``, inline: false }
              )
              .setTimestamp()
          ]
        });
      }

      await interaction.editReply({
        embeds: [
          new EmbedBuilder()
            .setDescription('Đã gửi thông tin sản phẩm miễn phí vào DM của bạn!')
            .setColor(0x007AFF)
        ],
        ephemeral: true
      });

      await saveFreeProductToDB(freeProductInfo, interaction);

    } else {
      const products = await getProductInfo();  // Lấy dữ liệu từ Firebase
      const parentProduct = Object.keys(products.productInfo).find(productKey => {
        return products.productInfo[productKey].subProducts && products.productInfo[productKey].subProducts[selectedSubProduct];
      });

      if (!parentProduct) {
        await interaction.reply({
          content: 'Sản phẩm không hợp lệ. Vui lòng thử lại.',
          ephemeral: true,
        });
        return;
      }

      const subProductDetails = products.productInfo[parentProduct].subProducts[selectedSubProduct];

      if (!subProductDetails) {
        await interaction.reply({
          content: 'Lựa chọn không hợp lệ. Vui lòng thử lại.',
          ephemeral: true,
        });
        return;
      }

      if (subProductDetails.subProducts) {
        let subSubOptions = Object.keys(subProductDetails.subProducts).map(subSubProductKey => ({
          label: subProductDetails.subProducts[subSubProductKey].title,
          emoji: subProductDetails.subProducts[subSubProductKey].emoji,
          value: subSubProductKey,
          description: subProductDetails.subProducts[subSubProductKey].description,
        }));

        const subSubMenuRow = new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('select_sub_sub_product')
              .setPlaceholder('Chọn hiệu ứng muốn mua')
              .addOptions(subSubOptions)
          );

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle(subProductDetails.title)
              .setImage(subProductDetails.imageUrl)
          ],
          components: [subSubMenuRow],
          ephemeral: true,
        });
      } else {
        const orderCode = Number(String(Date.now()).slice(-6));
        const productPrice = products.productPrices[selectedSubProduct] || 10000;

        const body = {
          orderCode,
          amount: productPrice,
          description: selectedSubProduct,
          returnUrl: `${process.env.YOUR_DOMAIN}/success.html`,
          cancelUrl: `${process.env.YOUR_DOMAIN}/cancel.html`,
        };

        const qrCodeImageUrl = await handlePayment(selectedSubProduct, interaction, body);
      }
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
      return res.status(200).send("Webhook confirmed received");
    }

    if (pendingPayments[orderCode] && pendingPayments[orderCode].amount === amount) {
      const { userId, product, messageId } = pendingPayments[orderCode];

      // Tạo kênh ticket cho người dùng
      const user = await client.users.fetch(userId);
      const guild = await client.guilds.fetch(process.env.GUILD_ID);
      const ticketChannel = await createTicket(client, guild, user);

      const keyFilePath = path.join(__dirname, './src/key', `${product}.json`);
      let keys;

      const dmChannel = await user.createDM();
      const sentMessage = await dmChannel.messages.fetch(messageId);

      if (!fs.existsSync(keyFilePath)) {
        console.error("File key không tồn tại:", keyFilePath);

        await sentMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thanh toán của bạn đã hoàn tất")
              .setDescription(`\`\`\`diff\n+ Thanh toán của bạn đã được xử lý thành công\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
              .addFields(
                { name: "Số tiền", value: `\`${amount} VND\``, inline: true },
                { name: "Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
                { name: "Sản phẩm", value: `\`${getProductDisplayName(product)}\``, inline: true }
              )
              .setColor(0x00FF00)
              .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
              .setTimestamp()
          ]
        });

        await saveWebhookPaymentToDB(orderCode, amount, product, userId, 'completed_no_key');
        await updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, 'completed_no_key');
        return res.status(200).send("Đã gửi thông báo thay thế 'Thanh toán của bạn đã hoàn tất' do không tồn tại file key");
      }

      try {
        const data = fs.readFileSync(keyFilePath, 'utf8');
        if (!data) {
          throw new Error('File key rỗng');
        }
        keys = JSON.parse(data);
      } catch (err) {
        console.error("Lỗi khi đọc file key:", err);

        await sentMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thanh toán của bạn đã hoàn tất")
              .setDescription(`\`\`\`diff\n+ Thanh toán của bạn đã được xử lý thành công\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
              .addFields(
                { name: "Số tiền", value: `\`${amount} VND\``, inline: true },
                { name: "Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
                { name: "Sản phẩm", value: `\`${getProductDisplayName(product)}\``, inline: true }
              )
              .setColor(0x00FF00)
              .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
              .setTimestamp()
          ]
        });

        await saveWebhookPaymentToDB(orderCode, amount, product, userId, 'completed_key_error');
        return res.status(200).send("Đã gửi thông báo thay thế 'Thanh toán của bạn đã hoàn tất' do lỗi khi đọc file key");
      }

      if (!keys || keys.length === 0) {
        console.error("Không còn key cho sản phẩm:", product);

        await sentMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thanh toán của bạn đã hoàn tất")
              .setDescription(`\`\`\`diff\n+ Thanh toán của bạn đã được xử lý thành công\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
              .addFields(
                { name: "Số tiền", value: `\`${amount} VND\``, inline: true },
                { name: "Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
                { name: "Sản phẩm", value: `\`${getProductDisplayName(product)}\``, inline: true }
              )
              .setColor(0x00FF00)
              .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
              .setTimestamp()
          ]
        });

        await saveWebhookPaymentToDB(orderCode, amount, product, userId, 'completed_no_key_available');
        await updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, 'completed_no_key_available');
        return res.status(200).send("Đã gửi thông báo thay thế 'Thanh toán của bạn đã hoàn tất' do không còn key khả dụng");
      }

      const keyToSend = keys.shift();

      try {
        fs.writeFileSync(keyFilePath, JSON.stringify(keys, null, 2));
      } catch (err) {
        console.error("Lỗi khi lưu file key:", err);

        await sentMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Lỗi khi xử lý Key")
              .setDescription(`\`\`\`diff\n+ Thanh toán của bạn đã được xử lý thành công\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
              .addFields(
                { name: "Số tiền", value: `\`${amount} VND\``, inline: true },
                { name: "Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
                { name: "Sản phẩm", value: `\`${getProductDisplayName(product)}\``, inline: true }
              )
              .setColor(0xFF0000)
              .setFooter({ text: "Vui lòng liên hệ hỗ trợ." })
              .setTimestamp()
          ]
        });

        await saveWebhookPaymentToDB(orderCode, amount, product, userId, 'completed_key_save_error');
        await updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, 'completed_key_save_error');
        return res.status(500).send("Lỗi khi lưu file key");
      }

      const updatedEmbed = new EmbedBuilder()
        .setTitle("Đơn hàng đã hoàn thành")
        .setDescription(`**Key sản phẩm:** \n\`\`\`${keyToSend}\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
        .addFields(
          { name: "Số tiền", value: `\`${amount} VND\``, inline: true },
          { name: "Mã đơn hàng", value: `\`${orderCode}\``, inline: true },
          { name: "Sản phẩm", value: `\`${getProductDisplayName(product)}\``, inline: true }
        )
        .setColor(0x00FF00)
        .setTimestamp();

      await sentMessage.edit({ embeds: [updatedEmbed] });

      await updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, 'completed');

      await saveWebhookPaymentToDB(orderCode, amount, product, userId, 'completed');

      return res.status(200).send(`Thanh toán cho đơn hàng ${orderCode} đã hoàn tất và ticket đã được tạo`);

    } else {
      console.error("Mã đơn hàng hoặc số tiền không hợp lệ");
      return res.status(500).send("Mã đơn hàng hoặc số tiền không hợp lệ");
    }
  } catch (error) {
    console.error("Lỗi xử lý webhook:", error);
    res.status(500).send("Lỗi xử lý webhook");
  }
});

client.login(process.env.TOKEN);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
