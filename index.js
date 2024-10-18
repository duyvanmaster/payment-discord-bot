const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const dotenv = require("dotenv");
const payOS = require('./src/payos/payos');
const { savePaymentToDB, saveFreeProductToDB, saveWebhookPaymentToDB } = require('./src/utils/mongodb');
const { updatePaymentStatusOnChannel } = require('./src/utils/statusonchanel');
const qrcode = require('./src/handler/qrcode')
const { getProductImageUrl } = require('./src/utils/productImages');
const productPrices = require('./src/utils/productPrices');
const freeproductInfo = require('./src/utils/freeproductinfo');
const express = require("express");
const fs = require("fs");
const path = require("path");
const productInfo = require('./src/utils/productInfo');
const { createTicket } = require('./src/handler/ticketManager');
const mongoose = require('mongoose');
const { userMention } = require('@discordjs/builders');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

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
    .setURL(product.downloadLink || 'https://discord.gg/legitvn')
    .setStyle(ButtonStyle.Link);

  // Tạo hàng chứa nút
  const row = new ActionRowBuilder().addComponents(linkButton);

  // Tạo embed cho sản phẩm
  const embed = new EmbedBuilder()
    .setTitle(product.title || 'Không có tiêu đề')
    .setDescription(product.description || 'Không có mô tả')
    .setImage(getProductImageUrl(selectedSubProduct))
    .setFooter({
      text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!",
      iconURL: 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/rf2o4ffc.png'
    })
    .setTimestamp();

  return { embed, components: [row] }; // Trả về embed và hàng chứa nút
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

    // Tạo Embed ban đầu
    const embed = new EmbedBuilder()
      .setDescription('**Trạng thái thanh toán:**\n```Chưa hoàn tất thanh toán```')
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
              { name: "Sản phẩm", value: `**\`${selectedSubProduct}\`**`, inline: false },
              { name: "URL mã QR", value: `[Thanh toán QRCode](${qrCodeImageUrl})` },
              { name: "Liên kết thanh toán", value: `[Thanh toán qua liên kết](${body.checkoutUrl})`, inline: false }
            )
            .setImage(getProductImageUrl(selectedSubProduct))
            .setTimestamp()
        ]
      });
    }

    // Thay vì reply, sử dụng editReply sau khi xử lý xong
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setDescription('Đã gửi mã QR thanh toán qua DM của bạn!')
          .setColor(0x007AFF)
      ]
    });

    // Xử lý lưu trữ thông tin thanh toán và trạng thái sau khi chờ 3 giây
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    await delay(3000);
    await savePaymentToDB(body, selectedSubProduct, interaction, sentMessage);

    return qrCodeImageUrl;
  } catch (error) {
    console.error("Lỗi khi tạo liên kết thanh toán:", error);

    // Chỉnh sửa lại reply khi có lỗi thay vì gọi lại interaction.reply()
    await interaction.editReply({ content: "Đã xảy ra lỗi khi tạo liên kết thanh toán." });
    throw error;
  }
}



client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand() && !interaction.isStringSelectMenu()) return;

  if (interaction.isChatInputCommand() && interaction.commandName === 'legitvn') {
    
    const mainOptions = Object.keys(productInfo).map(key => ({
      label: productInfo[key].title,
      value: key,
      emoji: productInfo[key].emoji,
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

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_product') {
    const selectedProduct = interaction.values[0];
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
          .setImage(getProductImageUrl(selectedProduct))
          .setTimestamp(),
      ],
      components: [subMenuRow],
      ephemeral: true
    });
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_sub_product') {
    const selectedSubProduct = interaction.values[0];
    await interaction.deferReply({ ephemeral: true });

    if (selectedSubProduct.startsWith('free_')) {
      const { embed, components } = createFreeProductEmbed(selectedSubProduct);
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
                { name: "Sản phẩm", value: `\`${selectedSubProduct}\``, inline: false }
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

      // Kiểm tra nếu subProduct có subProducts con
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
              //.setDescription('Chọn dịch vụ con từ danh sách dưới đây.')
              .setImage(getProductImageUrl(selectedSubProduct))
          ],
          components: [subSubMenuRow],
          ephemeral: true,
        });
      } else {
        // Nếu chỉ có một sản phẩm con, thực hiện thanh toán ngay lập tức
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
      }
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_sub_sub_product') {
    const selectedSubSubProduct = interaction.values[0];

    // Tìm sản phẩm cha cho sub-sub-product
    const parentProduct = Object.keys(productInfo).find(productKey => {
      const product = productInfo[productKey];
      return product.subProducts && Object.keys(product.subProducts).some(subProductKey =>
        product.subProducts[subProductKey].subProducts && product.subProducts[subProductKey].subProducts[selectedSubSubProduct]
      );
    });

    // Nếu không tìm thấy sản phẩm cha
    if (!parentProduct) {
      await interaction.reply({
        content: 'Sản phẩm không hợp lệ. Vui lòng thử lại.',
        ephemeral: true,
      });
      return;
    }

    // Tìm subProductDetails từ sản phẩm cha
    const subProductKey = Object.keys(productInfo[parentProduct].subProducts).find(subProductKey =>
      productInfo[parentProduct].subProducts[subProductKey].subProducts && productInfo[parentProduct].subProducts[subProductKey].subProducts[selectedSubSubProduct]
    );

    const subProductDetails = productInfo[parentProduct].subProducts[subProductKey].subProducts[selectedSubSubProduct];

    if (!subProductDetails) {
      await interaction.reply({
        content: 'Lựa chọn không hợp lệ. Vui lòng thử lại.',
        ephemeral: true,
      });
      return;
    }

    // Kiểm tra xem subProductDetails có subProducts không
    if (subProductDetails.subProducts) {
      let subSubSubOptions = Object.keys(subProductDetails.subProducts).map(subSubSubProductKey => ({
        label: subProductDetails.subProducts[subSubSubProductKey].title,
        value: subSubSubProductKey,
        emoji: subProductDetails.subProducts[subSubSubProductKey].emoji,
        description: subProductDetails.subProducts[subSubSubProductKey].description,
      }));

      const subSubSubMenuRow = new ActionRowBuilder()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('select_sub_sub_sub_product')
            .setPlaceholder('Chọn hiệu ứng muốn mua')
            .addOptions(subSubSubOptions)
        );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(subProductDetails.title)
            //.setDescription('Chọn dịch vụ con từ danh sách dưới đây.')
            .setImage(getProductImageUrl(selectedSubSubProduct))
        ],
        components: [subSubSubMenuRow],
        ephemeral: true,
      });
    } else {
      // Thực hiện thanh toán ngay lập tức nếu không còn subProducts
      const orderCode = Number(String(Date.now()).slice(-6));
      const productPrice = productPrices[selectedSubSubProduct] || 10000;

      const body = {
        orderCode,
        amount: productPrice,
        description: selectedSubSubProduct,
        returnUrl: `${process.env.YOUR_DOMAIN}/success.html`,
        cancelUrl: `${process.env.YOUR_DOMAIN}/cancel.html`,
      };

      const qrCodeImageUrl = await handlePayment(selectedSubSubProduct, interaction, body);
    }
  }

  if (interaction.isStringSelectMenu() && interaction.customId === 'select_sub_sub_sub_product') {
    const selectedSubSubSubProduct = interaction.values[0];

    // Thực hiện thanh toán ngay lập tức nếu đã đến cấp độ cuối cùng
    const orderCode = Number(String(Date.now()).slice(-6));
    const productPrice = productPrices[selectedSubSubSubProduct] || 10000;

    const body = {
      orderCode,
      amount: productPrice,
      description: selectedSubSubSubProduct,
      returnUrl: `${process.env.YOUR_DOMAIN}/success.html`,
      cancelUrl: `${process.env.YOUR_DOMAIN}/cancel.html`,
    };

    const qrCodeImageUrl = await handlePayment(selectedSubSubSubProduct, interaction, body);
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

      // Kiểm tra xem file key có tồn tại không
      if (!fs.existsSync(keyFilePath)) {
        console.error("File key không tồn tại:", keyFilePath);

        await sentMessage.edit({
          embeds: [
            new EmbedBuilder()
              .setTitle("Thanh toán của bạn đã hoàn tất")
              .setDescription(`\`\`\`diff\n+ Thanh toán của bạn đã được xử lý thành công\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
              .addFields(
                { name: "Số tiền", value: `${amount} VND`, inline: true },
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "Sản phẩm", value: `${product}`, inline: true }
              )
              .setColor(0x00FF00)
              .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
              .setTimestamp()
          ]
        });

        // Cập nhật MongoDB sau khi xử lý không thành công (không có key)
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
                { name: "Số tiền", value: `${amount} VND`, inline: true },
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "Sản phẩm", value: `${product}`, inline: true }
              )
              .setColor(0x00FF00)
              .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
              .setTimestamp()
          ]
        });

        // Cập nhật MongoDB khi có lỗi đọc file key
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
                { name: "Số tiền", value: `${amount} VND`, inline: true },
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "Sản phẩm", value: `${product}`, inline: true }
              )
              .setColor(0x00FF00)
              .setFooter({ text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi." })
              .setTimestamp()
          ]
        });

        // Cập nhật MongoDB khi không có key khả dụng
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
                { name: "Số tiền", value: `${amount} VND`, inline: true },
                { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
                { name: "Sản phẩm", value: `${product}`, inline: true }
              )
              .setColor(0xFF0000)
              .setFooter({ text: "Vui lòng liên hệ hỗ trợ." })
              .setTimestamp()
          ]
        });

        // Cập nhật MongoDB khi có lỗi ghi key
        await saveWebhookPaymentToDB(orderCode, amount, product, userId, 'completed_key_save_error');
        await updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, 'completed_key_save_error');
        return res.status(500).send("Lỗi khi lưu file key");
      }

      const updatedEmbed = new EmbedBuilder()
        .setTitle("Đơn hàng đã hoàn thành")
        .setDescription(`**Key sản phẩm:** \n\`\`\`${keyToSend}\`\`\`\nBạn có thể liên hệ với đội hỗ trợ tại kênh:\n ${ticketChannel}`)
        .addFields(
          { name: "Số tiền", value: `${amount} VND`, inline: true },
          { name: "Mã đơn hàng", value: `${orderCode}`, inline: true },
          { name: "Sản phẩm", value: `${product}`, inline: true }
        )
        .setColor(0x00FF00)
        .setTimestamp();

      await sentMessage.edit({ embeds: [updatedEmbed] });

      await updatePaymentStatusOnChannel(client, orderCode, product, amount, userId, 'completed');

      await saveWebhookPaymentToDB(orderCode, amount, product, userId, 'completed');

      //delete pendingPayments[orderCode];
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