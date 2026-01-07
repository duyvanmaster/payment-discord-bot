const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { createVoucher, getVoucherByCode, deleteVoucher, distributeVouchers } = require('../../services/voucherService');
const { sendDM } = require('../../utils/helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createvoucher')
        .setDescription('Tạo mã giảm giá mới')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('Mã giảm giá (VD: NEWYEAR2026)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('value')
                .setDescription('Giá trị giảm (VD: 10000 hoặc 20)')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('days')
                .setDescription('Số ngày hết hạn (Mặc định: 30)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('products')
                .setDescription('Sản phẩm áp dụng, phân cách bằng dấu phẩy (Để trống = Tất cả)')
                .setRequired(false))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Loại giảm giá (Tự động nhận diện nếu không chọn)')
                .setRequired(false)
                .addChoices(
                    { name: 'Số tiền cố định (VND)', value: 'fixed' },
                    { name: 'Phần trăm (%)', value: 'percentage' }
                ))
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('File danh sách UserID để phân phối ngay (tùy chọn)')
                .setRequired(false)),

    async execute(interaction) {
        // Only server owner can create vouchers
        if (interaction.user.id !== interaction.guild.ownerId) {
            return await interaction.reply({
                content: '❌ Chỉ có chủ server mới có quyền tạo mã giảm giá.',
                ephemeral: true
            });
        }

        const codeInput = interaction.options.getString('code');
        const code = codeInput ? codeInput.trim() : '';
        const discountValue = interaction.options.getInteger('value');
        const daysInput = interaction.options.getInteger('days');
        const expirationDays = daysInput !== null ? daysInput : 30;
        const productsInput = interaction.options.getString('products');
        let discountType = interaction.options.getString('type');

        // Logic tự động nhận diện loại giảm giá nếu không được chọn
        if (!discountType) {
            discountType = discountValue >= 100 ? 'fixed' : 'percentage';
        }

        // --- VALIDATION SỚM ---
        if (!code || code.length === 0) {
            return await interaction.reply({
                content: '❌ Mã giảm giá không được để trống!',
                ephemeral: true
            });
        }

        if (discountValue <= 0) {
            return await interaction.reply({
                content: '❌ Giá trị giảm phải là số dương!',
                ephemeral: true
            });
        }

        if (discountType === 'percentage' && (discountValue < 1 || discountValue > 100)) {
            return await interaction.reply({
                content: '❌ Phần trăm giảm giá phải từ 1 đến 100!',
                ephemeral: true
            });
        }

        if (expirationDays < 0) {
            return await interaction.reply({
                content: '❌ Số ngày hết hạn không được là số âm!',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // Check existence
            // Check existence
            const existingVoucher = await getVoucherByCode(code);
            if (existingVoucher) {
                const now = new Date();
                const isExpired = new Date(existingVoucher.expiresAt) < now;
                const hasBeenUsed = existingVoucher.currentUses > 0;

                // Allow overwrite if Expired OR Used (as per user request "cái nào đã dùng rồi")
                if (isExpired || hasBeenUsed) {
                    await deleteVoucher(code);
                } else {
                    // Voucher exists, is valid/active, AND has NOT been used yet. Block overwrite.
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xFF0000)
                                .setTitle('❌ Mã đã tồn tại')
                                .setDescription(`Mã giảm giá \`${code.toUpperCase()}\` đã tồn tại, chưa hết hạn và chưa được sử dụng!`)
                        ]
                    });
                }
            }

            // Parse products
            const applicableProducts = productsInput
                ? productsInput.split(',').map(p => p.trim()).filter(p => p.length > 0)
                : [];

            // Create voucher
            const voucherData = {
                code: code,
                discountType: discountType,
                discountValue: discountValue,
                applicableProducts: applicableProducts,
                createdBy: interaction.user.id,
                expirationDays: expirationDays
            };

            const voucher = await createVoucher(voucherData);

            // Response UI
            const expirationDate = new Date(voucher.expiresAt);
            const formattedDate = new Intl.DateTimeFormat('vi-VN', {
                timeZone: 'Asia/Ho_Chi_Minh',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(expirationDate);

            const discountValueDisplay = discountType === 'fixed'
                ? `${discountValue.toLocaleString('vi-VN')} VND`
                : `${discountValue}%`;

            const productsDisplay = applicableProducts.length > 0
                ? applicableProducts.join(', ')
                : 'Tất cả sản phẩm';



            // Kiểm tra xem có file được upload không
            const fileAttachment = interaction.options.getAttachment('file');

            if (fileAttachment) {
                // BƯỚC 1: Gửi embed báo đã tạo mã thành công
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('✨ Mã giảm giá mới đã được tạo')
                            .addFields(
                                {
                                    name: 'Mã giảm giá',
                                    value: `\`\`\`${voucher.code}\`\`\``,
                                    inline: false
                                },
                                {
                                    name: 'Giá trị giảm',
                                    value: `\`\`\`${discountValueDisplay}\`\`\``,
                                    inline: true
                                },
                                {
                                    name: 'Hạn sử dụng mã',
                                    value: `\`\`\`${formattedDate}\`\`\``,
                                    inline: true
                                },
                                {
                                    name: 'Sản phẩm áp dụng',
                                    value: `\`\`\`${productsDisplay}\`\`\``,
                                    inline: true
                                }
                            )
                            .setFooter({ text: '🔄 Đang phân phối mã cho users...' })
                            .setTimestamp()
                    ]
                });

                // BƯỚC 2: Phân phối và gửi embed kết quả
                try {
                    // Download và parse file
                    const response = await fetch(fileAttachment.url);
                    const fileContent = await response.text();
                    const userIds = JSON.parse(fileContent);

                    if (!Array.isArray(userIds)) {
                        throw new Error('File phải chứa một mảng JSON của các UserID');
                    }

                    // Support 2 formats:
                    // 1. Array of strings: ["id1", "id2"]
                    // 2. Array of objects: [{"userId": "id1"}, {"userId": "id2"}]
                    const extractedUserIds = userIds.map(item => {
                        if (typeof item === 'string') {
                            return item;
                        } else if (typeof item === 'object' && item !== null && item.userId) {
                            return item.userId;
                        }
                        return null;
                    });

                    // Lọc bỏ các giá trị không hợp lệ
                    const validUserIds = extractedUserIds.filter(id => {
                        return id !== null &&
                            id !== undefined &&
                            id !== '' &&
                            typeof id === 'string' &&
                            id.trim().length > 0 &&
                            id !== 'null' &&
                            id !== 'undefined';
                    });

                    if (validUserIds.length === 0) {
                        throw new Error('File không chứa UserID hợp lệ nào!');
                    }

                    // Phân phối voucher cho tất cả users
                    const results = await distributeVouchers(voucher.code, validUserIds, interaction.client);

                    // Gửi embed thứ 2 - Kết quả phân phối
                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x57F287)
                                .setTitle('📊 Kết quả phân phối')
                                .setDescription(`Đã phân phối mã \`${voucher.code}\` cho users trong danh sách.`)
                                .addFields(
                                    {
                                        name: '✅ Thành công',
                                        value: `**${results.successCount || 0}** users`,
                                        inline: true
                                    },
                                    {
                                        name: '❌ Thất bại',
                                        value: `**${results.failCount || 0}** users`,
                                        inline: true
                                    },
                                    {
                                        name: '📝 Tổng cộng',
                                        value: `**${validUserIds.length}** users`,
                                        inline: true
                                    }
                                )
                                .setTimestamp(),
                        ],
                        ephemeral: true
                    });

                } catch (fileError) {
                    console.error('Error processing file:', fileError);
                    await interaction.followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0xFF0000)
                                .setTitle('❌ Lỗi phân phối')
                                .setDescription(`Không thể phân phối mã \`${voucher.code}\`.`)
                                .addFields(
                                    {
                                        name: 'Chi tiết lỗi',
                                        value: `\`\`\`${fileError.message}\`\`\``,
                                        inline: false
                                    },
                                    {
                                        name: 'Giải pháp',
                                        value: 'Sử dụng lệnh `/distributevoucher` để phân phối thủ công.',
                                        inline: false
                                    }
                                )
                        ],
                        ephemeral: true
                    });
                }
            } else {
                // Không có file - chỉ thông báo tạo thành công
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('✨ Mã giảm giá mới đã được tạo')
                            .addFields(
                                {
                                    name: 'Mã giảm giá',
                                    value: `\`\`\`${voucher.code}\`\`\``,
                                    inline: false
                                },
                                {
                                    name: 'Giá trị giảm',
                                    value: `\`\`\`${discountValueDisplay}\`\`\``,
                                    inline: true
                                },
                                {
                                    name: 'Hạn sử dụng mã',
                                    value: `\`\`\`${formattedDate}\`\`\``,
                                    inline: true
                                },
                                {
                                    name: 'Sản phẩm áp dụng',
                                    value: `\`\`\`${productsDisplay}\`\`\``,
                                    inline: true
                                }
                            )
                            .setTimestamp()
                    ]
                });
            }

        } catch (error) {
            console.error('Error creating voucher:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ Lỗi hệ thống')
                        .setDescription('Không thể tạo mã giảm giá. Vui lòng thử lại sau.')
                        .addFields({ name: 'Chi tiết', value: `\`\`\`${error.message}\`\`\`` })
                ]
            });
        }
    },

    async handleButton(interaction) {
        if (interaction.customId === 'upload_voucher_users') {
            const voucher = pendingVouchers.get(interaction.user.id);
            if (!voucher) {
                return await interaction.reply({
                    content: '⏱️ Phiên làm việc đã hết hạn hoặc không tìm thấy mã.',
                    ephemeral: true
                });
            }
            // Use Embed for prompt as well
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x007AFF)
                        .setTitle('📤 Phân phối mã giảm giá')
                        .setDescription(`Sử dụng lệnh sau để upload file danh sách người dùng:\n\n\`/distributevoucher code:${voucher.code} file:[chọn file]\``)
                        .addFields({
                            name: 'Đinh dạng JSON hỗ trợ',
                            value: '```json\n["ID1", "ID2", "ID3"]\n```'
                        })
                ],
                ephemeral: true
            });
        } else if (interaction.customId === 'skip_voucher_distribution') {
            pendingVouchers.delete(interaction.user.id);
            await interaction.update({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFFA500)
                        .setDescription('✅ **Đã hoàn tất tạo mã.** Bạn có thể phân phối sau bằng lệnh `/distributevoucher`.')
                ],
                components: []
            });
        }
    }
};

