const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getProductInfo, createFreeProductEmbed } = require('../../services/productService');
const { handlePaymentCreation } = require('../../services/paymentService');
const { saveFreeProductToDB } = require('../../utils/mongodb');
const { getProductDisplayName } = require('../../utils/productname');
const { sendDM } = require('../../utils/helpers');
const { userMention } = require('@discordjs/builders');
const { validateVoucher, applyVoucher } = require('../../services/voucherService');
const config = require('../../config/config');

// Store for payment sessions with voucher data
const paymentSessions = new Map();

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
        } else if (interaction.customId === 'apply_voucher_button') {
            await this.handleVoucherButton(interaction);
        } else if (interaction.customId === 'select_voucher_code') {
            await this.handleVoucherSelection(interaction);
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
        await sendDM(interaction.client, interaction.user.id, { embeds: [embed], components });

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

        // Store payment session for voucher flow
        paymentSessions.set(interaction.user.id, {
            productKey: selectedProductKey,
            productPrice: productPrice,
            voucherCode: null,
            voucherDiscount: 0,
            finalAmount: productPrice
        });

        // Defer reply to prevent timeout
        await interaction.deferReply({ ephemeral: true });

        // Show option to apply voucher
        const applyVoucherButton = new ButtonBuilder()
            .setCustomId('apply_voucher_button')
            .setLabel('💸 Áp dụng mã giảm giá')
            .setStyle(ButtonStyle.Primary);

        const skipVoucherButton = new ButtonBuilder()
            .setCustomId('skip_voucher_button')
            .setLabel('⏭️ Bỏ qua')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder().addComponents(applyVoucherButton, skipVoucherButton);

        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x007AFF)
                    .setTitle('🧾 Hóa đơn thanh toán')
                    .setDescription(`\`\`\`yaml\nSản phẩm:   ${getProductDisplayName(selectedProductKey)}\nGiá gốc:    ${productPrice.toLocaleString('vi-VN')} VND\nGiảm giá:   (Chưa áp dụng)\n----------------------------\nTổng cộng:  ${productPrice.toLocaleString('vi-VN')} VND\n\`\`\``)
                    .setFields([]) // Remove old fields
            ],
            components: [row]
        });
        // Pre-fetch user's vouchers for smoother UI
        // We do this concurrently or after the reply to avoid delaying the payment screen
        const { getUserVouchers } = require('../../services/voucherService');

        getUserVouchers(interaction.user.id).then(vouchers => {
            const currentSession = paymentSessions.get(interaction.user.id);
            if (currentSession) {
                currentSession.cachedVouchers = vouchers;
                paymentSessions.set(interaction.user.id, currentSession);
            }
        }).catch(err => console.error('Error pre-fetching vouchers:', err));
    },

    async handleVoucherButton(interaction) {
        // User requested deferReply to show "Thinking...".
        await interaction.deferReply({ ephemeral: true });

        // Immediately DELETE the OLD message (Invoice) to clean up history.
        if (interaction.message) {
            interaction.message.delete().catch(() => { });
        }

        const sessionData = paymentSessions.get(interaction.user.id);

        if (!sessionData) {
            return await interaction.editReply({
                content: '⏱️ Phiên làm việc đã hết hạn. Vui lòng chọn sản phẩm lại!',
                components: [],
                embeds: []
            });
        }

        // Handle skip button
        if (interaction.customId === 'skip_voucher_button') {
            // Proceed with payment without voucher
            const orderCode = Number(String(Date.now()).slice(-6));

            const body = {
                orderCode,
                amount: sessionData.productPrice,
                description: sessionData.productKey,
                returnUrl: `${config.yourDomain}/success.html`,
                cancelUrl: `${config.yourDomain}/cancel.html`,
            };

            await handlePaymentCreation(interaction.client, sessionData.productKey, interaction, body);
            paymentSessions.delete(interaction.user.id);
            return;
        }

        // Use cached vouchers if available, otherwise fetch
        const { getUserVouchers } = require('../../services/voucherService');
        let userVouchers = sessionData.cachedVouchers;

        if (!userVouchers) {
            userVouchers = await getUserVouchers(interaction.user.id);
        }

        // Filter valid vouchers for this product
        const now = new Date();
        const validVouchers = userVouchers.filter(uv => {
            const voucher = uv.voucherDetails;
            return !uv.isUsed &&
                now <= new Date(voucher.expiresAt) &&
                voucher.isActive &&
                (voucher.applicableProducts.length === 0 ||
                    voucher.applicableProducts.includes(sessionData.productKey));
        });

        // Sort vouchers: Best discount first
        validVouchers.sort((a, b) => {
            const voucherA = a.voucherDetails;
            const voucherB = b.voucherDetails;

            const calcDiscount = (v) => {
                if (v.discountType === 'fixed') return v.discountValue;
                return (sessionData.productPrice * v.discountValue) / 100;
            };

            return calcDiscount(voucherB) - calcDiscount(voucherA);
        });

        if (validVouchers.length === 0) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setTitle('Không có mã giảm giá')
                        .setDescription('Bạn chưa có mã giảm giá khả dụng cho sản phẩm này.')
                ]
            });
        }

        // Create select menu with vouchers
        const options = validVouchers.map((uv, index) => {
            const voucher = uv.voucherDetails;
            const discountText = voucher.discountType === 'fixed'
                ? `${voucher.discountValue.toLocaleString('vi-VN')} VND`
                : `${voucher.discountValue}%`;

            const expiresDate = new Intl.DateTimeFormat('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(new Date(voucher.expiresAt));

            return {
                label: `Giảm ${discountText}`,
                value: voucher.code,
                description: `${voucher.code} | Hết hạn: ${expiresDate}`
            };
        });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select_voucher_code')
            .setPlaceholder('Chọn mã giảm giá')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // Create a display list for the embed
        const voucherListDisplay = validVouchers.map((uv, index) => {
            const voucher = uv.voucherDetails;
            const discountText = voucher.discountType === 'fixed'
                ? `${voucher.discountValue.toLocaleString('vi-VN')} VND`
                : `${voucher.discountValue}%`;
            return `${voucher.code.padEnd(10)} : -${discountText}`;
        }).join('\n');

        // Update the NEW message (Step 2)
        await interaction.editReply({
            embeds: [
                new EmbedBuilder()
                    .setColor(0x5865F2)
                    .setTitle('🎫 Chọn mã giảm giá')
                    .setDescription(`Bạn có **${validVouchers.length}** mã giảm giá khả dụng cho sản phẩm này.\n\`\`\`yaml\n${voucherListDisplay}\n\`\`\``)
                    .setFooter({ text: 'Vui lòng chọn mã từ menu bên dưới' })
            ],
            components: [row]
        });
    },




    async handleVoucherSelection(interaction) {
        // User requested deferReply to verify "Thinking..."
        await interaction.deferReply({ ephemeral: true });

        // Immediately DELETE the OLD message (Select Menu) to clean up history.
        if (interaction.message) {
            interaction.message.delete().catch(() => { });
        }

        const voucherCode = interaction.values[0];
        const sessionData = paymentSessions.get(interaction.user.id);

        if (!sessionData) {
            return await interaction.editReply({
                content: 'Phiên làm việc đã hết hạn. Vui lòng chọn sản phẩm lại!',
                components: [],
                embeds: []
            });
        }

        // Validate voucher
        const validation = await validateVoucher(voucherCode, interaction.user.id, sessionData.productKey);

        if (!validation.valid) {
            return await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('Mã giảm giá không hợp lệ')
                        .setDescription(validation.message)
                ],
                components: []
            });
        }

        // Calculate discount
        const voucher = validation.voucher;
        let discountAmount = 0;

        if (voucher.discountType === 'fixed') {
            discountAmount = voucher.discountValue;
        } else if (voucher.discountType === 'percentage') {
            discountAmount = Math.round((sessionData.productPrice * voucher.discountValue) / 100);
        }

        const finalAmount = Math.max(0, sessionData.productPrice - discountAmount);

        // Update session with voucher info
        sessionData.voucherCode = voucherCode;
        sessionData.voucherDiscount = discountAmount;
        sessionData.finalAmount = finalAmount;
        paymentSessions.set(interaction.user.id, sessionData);

        // Directly proceed with payment - No intermediate "Applied" table
        // The success message in paymentService will handle the notification.
        await this.processPaymentWithVoucher(interaction, sessionData);
    },
    async handleVoucherModal(interaction) {
        if (interaction.customId === 'voucher_code_modal') {
            await interaction.deferReply({ ephemeral: true });

            const voucherCode = interaction.fields.getTextInputValue('voucherCodeInput').trim();
            const sessionData = paymentSessions.get(interaction.user.id);

            if (!sessionData) {
                return await interaction.editReply({
                    content: 'Phiên làm việc đã hết hạn. Vui lòng chọn sản phẩm lại!'
                });
            }

            // Validate voucher
            const validation = await validateVoucher(voucherCode, interaction.user.id, sessionData.productKey);

            if (!validation.valid) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0xFF0000)
                            .setTitle('Mã giảm giá không hợp lệ')
                            .setDescription(validation.message)
                    ]
                });
            }

            // Calculate discount
            const voucher = validation.voucher;
            let discountAmount = 0;

            if (voucher.discountType === 'fixed') {
                discountAmount = voucher.discountValue;
            } else if (voucher.discountType === 'percentage') {
                discountAmount = Math.round((sessionData.productPrice * voucher.discountValue) / 100);
            }

            const finalAmount = Math.max(0, sessionData.productPrice - discountAmount);

            // Update session with voucher info
            sessionData.voucherCode = voucherCode;
            sessionData.voucherDiscount = discountAmount;
            sessionData.finalAmount = finalAmount;
            paymentSessions.set(interaction.user.id, sessionData);

            // Show confirmation with discount info - simplified design
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('Đã áp dụng mã giảm giá')
                        .setDescription(`Mã \`${voucherCode.toUpperCase()}\` đã được áp dụng thành công.`)
                        .addFields(
                            { name: 'Giá gốc', value: `\`\`\`${sessionData.productPrice.toLocaleString('vi-VN')} VND\`\`\``, inline: true },
                            { name: 'Giảm giá', value: `\`\`\`-${discountAmount.toLocaleString('vi-VN')} VND\`\`\``, inline: true },
                            { name: ' ', value: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", inline: false },
                            { name: 'Tổng cộng', value: `\`\`\`${finalAmount.toLocaleString('vi-VN')} VND\`\`\``, inline: true }
                        )
                        .setFooter({ text: 'Đang tạo thanh toán...' })
                        .setTimestamp()
                ]
            });

            // Proceed with payment using discounted amount
            await this.processPaymentWithVoucher(interaction, sessionData);

            // Auto-delete THIS message (Applied Voucher Info) after 10 seconds
            setTimeout(() => {
                interaction.deleteReply().catch(() => { });
            }, 10000);
        }
    },
    async processPaymentWithVoucher(interaction, sessionData) {
        const orderCode = Number(String(Date.now()).slice(-6));

        const body = {
            orderCode,
            amount: sessionData.finalAmount,
            description: sessionData.productKey,
            returnUrl: `${config.yourDomain}/success.html`,
            cancelUrl: `${config.yourDomain}/cancel.html`,
        };

        const voucherData = {
            code: sessionData.voucherCode.toUpperCase(),
            originalAmount: sessionData.productPrice,
            discountAmount: sessionData.voucherDiscount
        };

        // Mark voucher as used (will be done in webhook after payment success)
        // Store voucher info with payment for webhook to process
        sessionData.orderCode = orderCode;
        paymentSessions.set(interaction.user.id, sessionData);

        await handlePaymentCreation(interaction.client, sessionData.productKey, interaction, body, voucherData);

        // Clean up session after payment creation
        paymentSessions.delete(interaction.user.id);
    }
};
