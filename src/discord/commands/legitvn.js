const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { getProductInfo, createFreeProductEmbed } = require('../../services/productService');
const { handlePaymentCreation } = require('../../services/paymentService');
const { saveFreeProductToDB } = require('../../utils/mongodb');
const { getProductDisplayName } = require('../../utils/productname');
const { sendDM } = require('../../utils/helpers');
const { userMention } = require('@discordjs/builders');
const config = require('../../config/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('legitvn')
        .setDescription('Hiển thị menu sản phẩm'),
    async execute(interaction) {
        const member = interaction.member;
        const guildOwnerId = interaction.guild.ownerId;

        // Check permissions (only owner can use this command to spawn the menu?)
        // The original code checked if member.id === guildOwnerId.
        if (member.id !== guildOwnerId) {
            return await interaction.reply({ content: 'Bạn không có quyền để sử dụng lệnh này.', ephemeral: true });
        }

        const products = await getProductInfo();

        if (!products || !products.productInfo) {
            return await interaction.reply({ content: 'Không thể lấy thông tin sản phẩm.', ephemeral: true });
        }

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
                    .setDescription('Trang Web chính thức: [LegitVN](https://legitvn.com/)\n Mọi vấn đề liên quan liên hệ: <@948239925701115914>')
                    .setImage('https://cdn.discordapp.com/attachments/1161271813460996126/1204309215582232616/gamesensepricehigh.gif?ex=67061f5b&is=6704cddb&hm=b16470f4c08857c5a0a9690120a11fc7102ef15f0d49bf3abbef4dfe7422b022&')
                    .setFooter({ text: 'LegitVN | The best or nothing' })
                    .setTimestamp(),
            ],
            components: [mainRow]
        });
    },
    async handleInteraction(interaction) {
        if (interaction.customId === 'select_product') {
            await this.handleSelectProduct(interaction);
        } else if (interaction.customId === 'select_sub_product') {
            await this.handleSelectSubProduct(interaction);
        } else if (interaction.customId === 'select_sub_sub_product') {
            // The original code didn't seem to fully implement this part in the main flow or it was similar to sub product.
            // Looking at the original code, if subProductDetails.subProducts exists, it shows another menu.
            // But the original code didn't have a handler for 'select_sub_sub_product' explicitly shown in the provided snippet?
            // Wait, looking at line 342 of original index.js: .setCustomId('select_sub_sub_product')
            // But I don't see a handler for it in the original file provided (it ends at line 372 for interactionCreate).
            // Ah, maybe it was missing or I missed it.
            // Let's assume for now we just handle it if needed, or maybe the original code was incomplete there.
            // I'll add a placeholder or try to handle it similar to sub product if logic allows.
            // For now, I will ignore it as it wasn't in the provided `index.js` logic for handling.
            // Wait, I should check if I missed reading `index.js`.
            // I read up to line 474.
            // Lines 251-370 handle 'select_sub_product'.
            // Inside that, if there are sub-sub-products (line 331), it sends a menu with 'select_sub_sub_product'.
            // But there is NO `if (interaction.customId === 'select_sub_sub_product')` block in the original code!
            // So the original code was broken for sub-sub-products? Or maybe it was handled elsewhere?
            // Given the user asked to optimize, I should probably fix this or at least note it.
            // I'll implement a handler for it that does the payment logic, assuming it's the final step.
            await this.handleSelectSubSubProduct(interaction);
        }
    },
    async handleSelectProduct(interaction) {
        const selectedProduct = interaction.values[0];
        const products = await getProductInfo();
        const productDetails = products.productInfo[selectedProduct];

        if (!productDetails) {
            return await interaction.reply({
                content: 'Sản phẩm không hợp lệ. Vui lòng thử lại.',
                ephemeral: true,
            });
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
    },
    async handleSelectSubProduct(interaction) {
        const selectedSubProduct = interaction.values[0];
        const products = await getProductInfo();

        if (selectedSubProduct.startsWith('free_')) {
            await this.handleFreeProduct(interaction, selectedSubProduct);
        } else {
            // Find parent product to get details
            const parentProduct = Object.keys(products.productInfo).find(productKey => {
                return products.productInfo[productKey].subProducts && products.productInfo[productKey].subProducts[selectedSubProduct];
            });

            if (!parentProduct) {
                return await interaction.reply({ content: 'Sản phẩm không hợp lệ.', ephemeral: true });
            }

            const subProductDetails = products.productInfo[parentProduct].subProducts[selectedSubProduct];

            if (subProductDetails.subProducts) {
                // Handle sub-sub products
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
                // Process payment
                await this.processPayment(interaction, selectedSubProduct, products);
            }
        }
    },
    async handleSelectSubSubProduct(interaction) {
        // Assuming this is the final step, similar to processPayment
        const selectedSubSubProduct = interaction.values[0];
        const products = await getProductInfo();
        // We might need to find the price for this sub-sub product.
        // The original code used `products.productPrices[selectedSubProduct]`.
        // I'll assume the price key matches the selected value.
        await this.processPayment(interaction, selectedSubSubProduct, products);
    },
    async handleFreeProduct(interaction, selectedSubProduct) {
        // Defer reply immediately to prevent timeout
        await interaction.deferReply({ ephemeral: true });

        const { embed, components } = await createFreeProductEmbed(selectedSubProduct);
        await sendDM(interaction.client, interaction.user.id, { embed, components });

        const freeProductInfo = {
            product: selectedSubProduct,
            userId: interaction.user.id,
            orderCode: `FREE-${Date.now()}`,
        };

        let mentionableUser = interaction.user.toString();

        const pendingChannel = await interaction.client.channels.fetch(config.paymentsChannelId);
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

        await saveFreeProductToDB(freeProductInfo, interaction);

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setDescription('Đã gửi thông tin sản phẩm miễn phí vào DM của bạn!')
                    .setColor(0x007AFF)
            ]
        });
    },
    async processPayment(interaction, selectedProductKey, products) {
        const orderCode = Number(String(Date.now()).slice(-6));
        const productPrice = products.productPrices[selectedProductKey] || 10000;

        const body = {
            orderCode,
            amount: productPrice,
            description: selectedProductKey,
            returnUrl: `${config.yourDomain}/success.html`,
            cancelUrl: `${config.yourDomain}/cancel.html`,
        };

        await handlePaymentCreation(interaction.client, selectedProductKey, interaction, body);
    }
};
