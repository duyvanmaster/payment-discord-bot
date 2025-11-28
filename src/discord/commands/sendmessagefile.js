const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { sendDM } = require('../../utils/helpers');

const pendingFileUploads = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sendmessage_file')
        .setDescription('Gửi tin nhắn hàng loạt bằng cách upload file JSON')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('File JSON chứa danh sách userId')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const attachment = interaction.options.getAttachment('file');

        // Validate file type
        if (!attachment.name.endsWith('.json') && !attachment.name.endsWith('.txt')) {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Định dạng file không hợp lệ')
                .setDescription('Vui lòng upload file có định dạng `.json` hoặc `.txt`')
                .addFields({
                    name: '📄 File đã upload',
                    value: `\`${attachment.name}\``,
                    inline: false
                })
                .setFooter({ text: 'Yêu cầu: .json hoặc .txt' })
                .setTimestamp();

            return await interaction.editReply({ embeds: [errorEmbed] });
        }

        // Download and parse file
        try {
            const response = await fetch(attachment.url);
            const text = await response.text();

            let userIds = [];

            if (attachment.name.endsWith('.json')) {
                // Parse JSON
                const data = JSON.parse(text);

                // Support different JSON formats
                if (Array.isArray(data)) {
                    // Format 1: [{"userId": "123"}, {"userId": "456"}]
                    if (data[0] && data[0].userId) {
                        userIds = data.map(item => item.userId);
                    }
                    // Format 2: ["123", "456", "789"]
                    else if (typeof data[0] === 'string') {
                        userIds = data;
                    }
                }
                // Format 3: {"userIds": ["123", "456"]}
                else if (data.userIds && Array.isArray(data.userIds)) {
                    userIds = data.userIds;
                }
            } else {
                // Parse plain text (each line is a user ID)
                userIds = text.split('\n')
                    .map(id => id.trim())
                    .filter(id => id.length > 0);
            }

            // Remove duplicates
            userIds = [...new Set(userIds)];

            if (userIds.length === 0) {
                const emptyEmbed = new EmbedBuilder()
                    .setColor(0xFFA500)
                    .setTitle('⚠️ Không tìm thấy User ID')
                    .setDescription('File không chứa User ID hợp lệ. Vui lòng kiểm tra lại định dạng!')
                    .addFields(
                        {
                            name: '📋 Định dạng JSON hỗ trợ',
                            value: '```json\n[{"userId": "123"}, {"userId": "456"}]\n```\nhoặc\n```json\n["123", "456", "789"]\n```',
                            inline: false
                        },
                        {
                            name: '📝 Định dạng TXT',
                            value: 'Mỗi User ID một dòng',
                            inline: false
                        }
                    )
                    .setFooter({ text: 'Kiểm tra lại file của bạn' })
                    .setTimestamp();

                return await interaction.editReply({ embeds: [emptyEmbed] });
            }

            // Store for button handler
            pendingFileUploads.set(interaction.user.id, userIds);

            // Create button to open modal
            const button = new ButtonBuilder()
                .setCustomId('sendmessagefile_button')
                .setLabel(`✉️ Soạn tin nhắn (${userIds.length} người)`)
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            const successEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('✅ Đã tải file thành công!')
                .setDescription('Danh sách User ID đã được phân tích xong.')
                .addFields(
                    {
                        name: '📊 Thống kê',
                        value: `\`\`\`\n${userIds.length} User ID đã tìm thấy\n\`\`\``,
                        inline: true
                    },
                    {
                        name: '📄 File',
                        value: `\`${attachment.name}\``,
                        inline: true
                    }
                )
                .setFooter({ text: 'Nhấn nút bên dưới để tiếp tục' })
                .setTimestamp();

            await interaction.editReply({
                embeds: [successEmbed],
                components: [row]
            });

        } catch (error) {
            console.error('Error parsing file:', error);

            const errorEmbed = new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Lỗi khi đọc file')
                .setDescription('Không thể phân tích file. Vui lòng kiểm tra định dạng!')
                .addFields({
                    name: '🔍 Chi tiết lỗi',
                    value: `\`\`\`${error.message}\`\`\``,
                    inline: false
                })
                .setFooter({ text: 'Kiểm tra lại cú pháp JSON/TXT' })
                .setTimestamp();

            return await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
    async handleButton(interaction) {
        if (interaction.customId === 'sendmessagefile_button') {
            const userIds = pendingFileUploads.get(interaction.user.id);

            if (!userIds) {
                return await interaction.reply({
                    content: 'Phiên làm việc đã hết hạn. Vui lòng upload file lại!',
                    ephemeral: true
                });
            }

            // Show modal
            const modal = new ModalBuilder()
                .setCustomId('sendmessagefile_modal')
                .setTitle(`Gửi tin cho ${userIds.length} người`);

            const messageInput = new TextInputBuilder()
                .setCustomId('messageInput')
                .setLabel("Nội dung tin nhắn")
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);

            const imageUrlInput = new TextInputBuilder()
                .setCustomId('imageUrlInput')
                .setLabel("URL hình ảnh (Tùy chọn)")
                .setStyle(TextInputStyle.Short)
                .setRequired(false)
                .setPlaceholder('https://example.com/image.png');

            const firstRow = new ActionRowBuilder().addComponents(messageInput);
            const secondRow = new ActionRowBuilder().addComponents(imageUrlInput);

            modal.addComponents(firstRow, secondRow);

            await interaction.showModal(modal);
        }
        else if (interaction.customId === 'sendmessagefile_confirm') {
            // User confirmed, proceed with sending
            const data = pendingFileUploads.get(`confirm_${interaction.user.id}`);

            if (!data) {
                return await interaction.reply({
                    content: '⏱️ Phiên làm việc đã hết hạn. Vui lòng thử lại!',
                    ephemeral: true
                });
            }

            const { userIds, embed } = data;
            pendingFileUploads.delete(`confirm_${interaction.user.id}`);

            await interaction.deferUpdate();
            await this.sendBulkMessages(interaction, userIds, embed);
        }
        else if (interaction.customId === 'sendmessagefile_cancel') {
            // User cancelled
            pendingFileUploads.delete(`confirm_${interaction.user.id}`);

            const cancelEmbed = new EmbedBuilder()
                .setColor(0xFF9900)
                .setTitle('❌ Đã hủy gửi tin nhắn')
                .setDescription('Bạn đã hủy thao tác gửi tin nhắn hàng loạt.')
                .setFooter({ text: 'Không có tin nhắn nào được gửi đi' })
                .setTimestamp();

            await interaction.update({
                embeds: [cancelEmbed],
                components: []
            });
        }
    },
    async handleModal(interaction) {
        if (interaction.customId === 'sendmessagefile_modal') {
            const messageContent = interaction.fields.getTextInputValue('messageInput');
            const imageUrl = interaction.fields.getTextInputValue('imageUrlInput');
            const userIds = pendingFileUploads.get(interaction.user.id);

            if (!userIds) {
                return await interaction.reply({
                    content: 'Không tìm thấy danh sách người nhận. Vui lòng thử lại.',
                    ephemeral: true
                });
            }

            pendingFileUploads.delete(interaction.user.id);

            const embed = new EmbedBuilder()
                .setDescription(messageContent)
                .setColor(0x007AFF)
                .setTimestamp();

            // Add image if provided and valid
            if (imageUrl && imageUrl.trim() !== '') {
                const trimmedUrl = imageUrl.trim();
                // Simple URL validation
                if (this.isValidUrl(trimmedUrl)) {
                    embed.setImage(trimmedUrl);
                }
                // If invalid, just skip adding image (don't crash)
            }

            // Store data for confirmation step
            pendingFileUploads.set(`confirm_${interaction.user.id}`, {
                userIds,
                embed
            });

            await interaction.deferReply({ ephemeral: true });

            const confirmButton = new ButtonBuilder()
                .setCustomId('sendmessagefile_confirm')
                .setLabel('✅ Xác nhận gửi')
                .setStyle(ButtonStyle.Success);

            const cancelButton = new ButtonBuilder()
                .setCustomId('sendmessagefile_cancel')
                .setLabel('❌ Hủy bỏ')
                .setStyle(ButtonStyle.Danger);

            const confirmRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

            // Create header embed for preview
            const headerEmbed = new EmbedBuilder()
                .setColor(0x5865F2) // Discord Blurple color
                .setTitle('📬 Xem trước tin nhắn')
                .setDescription(`Đây là nội dung tin nhắn mà **${userIds.length} người dùng** sẽ nhận được:`)
                .setFooter({ text: '👇 Xem tin nhắn bên dưới • Nhấn "Xác nhận gửi" để gửi hoặc "Hủy bỏ" để dừng' })
                .setTimestamp();

            // Send header + actual message embed
            await interaction.editReply({
                embeds: [headerEmbed, embed],
                components: [confirmRow]
            });
        }
    },
    async sendBulkMessages(interaction, userIds, embed) {
        const results = [];
        let successCount = 0;
        let failCount = 0;

        for (const userId of userIds) {
            try {
                const sent = await sendDM(interaction.client, userId, { embed });

                // Nếu sendDM trả về null/undefined nghĩa là thất bại (đã log lỗi ở helper)
                if (!sent) {
                    throw new Error('Failed to send DM');
                }

                successCount++;
                if (results.length < 20) {
                    results.push(`✅ <@${userId}>`);
                }
            } catch (error) {
                failCount++;
                if (results.length < 20) {
                    results.push(`❌ ${userId} (DM đóng/Bot bị chặn)`);
                }
            }
        }

        // Calculate success rate
        const successRate = ((successCount / userIds.length) * 100).toFixed(1);
        const progressBar = this.createProgressBar(successCount, userIds.length);

        const resultEmbed = new EmbedBuilder()
            .setColor(failCount === 0 ? 0x00FF00 : (successCount > 0 ? 0xFFA500 : 0xFF0000))
            .setTitle('📬 Kết quả gửi tin nhắn')
            .setDescription(`Đã hoàn thành gửi tin nhắn cho **${userIds.length}** người dùng.`)
            .addFields(
                {
                    name: '📊 Thống kê tổng quan',
                    value: `${progressBar}\n\`\`\`diff\n+ Thành công: ${successCount}\n- Thất bại: ${failCount}\n\`\`\``,
                    inline: false
                },
                {
                    name: '📈 Tỷ lệ thành công',
                    value: `\`${successRate}%\``,
                    inline: true
                },
                {
                    name: '👥 Tổng số',
                    value: `\`${userIds.length} người\``,
                    inline: true
                }
            );

        if (results.length > 0) {
            const resultList = results.join('\n');
            const moreText = userIds.length > 20 ? `\n_...và ${userIds.length - 20} người dùng khác_` : '';

            resultEmbed.addFields({
                name: '📋 Chi tiết (20 người đầu)',
                value: resultList + moreText,
                inline: false
            });
        }

        resultEmbed
            .setFooter({ text: `Hoàn thành ${successCount}/${userIds.length} tin nhắn` })
            .setTimestamp();

        await interaction.editReply({ embeds: [resultEmbed], components: [] });
    },
    createProgressBar(current, total, length = 20) {
        const filled = Math.round((current / total) * length);
        const empty = length - filled;
        const bar = '█'.repeat(filled) + '░'.repeat(empty);
        return `${bar} ${current}/${total}`;
    },
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
};
