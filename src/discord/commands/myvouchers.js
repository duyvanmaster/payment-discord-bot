const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserVouchers } = require('../../services/voucherService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('myvouchers')
        .setDescription('Xem danh sách mã giảm giá của bạn'),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const userId = interaction.user.id;
            const userVouchers = await getUserVouchers(userId);

            if (userVouchers.length === 0) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(0x5865F2)
                            .setTitle('Mã giảm giá của bạn')
                            .setDescription('*Bạn chưa có mã giảm giá nào.*')
                    ]
                });
            }

            const now = new Date();
            let activeCount = 0;
            let expiredCount = 0;
            let usedCount = 0;

            const voucherLines = [];

            for (const userVoucher of userVouchers) {
                const voucher = userVoucher.voucherDetails;
                const isExpired = now > new Date(voucher.expiresAt);
                const isUsed = userVoucher.isUsed;

                let statusEmoji = '✅';
                let statusText = 'Khả dụng';

                if (isUsed) {
                    const usedDate = new Intl.DateTimeFormat('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).format(new Date(userVoucher.usedAt));

                    statusEmoji = '✅';
                    statusText = `Đã dùng (${usedDate})`;
                    usedCount++;
                } else if (isExpired) {
                    statusEmoji = '⚠️';
                    statusText = 'Hạn sử dụng mã';
                    expiredCount++;
                } else {
                    activeCount++;

                    // Only add to display list if Active
                    const expirationDate = new Date(voucher.expiresAt);
                    const formattedExpiration = new Intl.DateTimeFormat('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    }).format(expirationDate);

                    const discountDisplay = voucher.discountType === 'fixed'
                        ? `${voucher.discountValue.toLocaleString('vi-VN')} VND`
                        : `${voucher.discountValue}%`;

                    // Build consistent item block
                    // Using code blocks for key data to stand out
                    voucherLines.push([
                        `${statusEmoji} **${voucher.code}**`,
                        `\`\`\``,
                        `Giảm giá: ${discountDisplay}`,
                        `Hết hạn : ${formattedExpiration}`,
                        `Status  : ${statusText}`,
                        `\`\`\``,
                        ''
                    ].join('\n'));
                }
            }

            const description = [
                `Bạn có **${userVouchers.length}** mã giảm giá.`,
                '',
                `**Tổng quan**`,
                `\`\`\`yml`,
                `Khả dụng : ${activeCount}`,
                `Đã dùng  : ${usedCount}`,
                `Hết hạn  : ${expiredCount}`,
                `\`\`\``,
                '━━━━━━━━━━━━━━━━━━━━━━',
                '',
                ...voucherLines
            ].join('\n');

            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setTitle('🧧 Kho mã giảm giá của bạn')
                .setDescription(description)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error getting user vouchers:', error);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ Lỗi')
                        .setDescription('Không thể tải danh sách mã giảm giá!')
                        .addFields({ name: 'Chi tiết lỗi', value: `\`\`\`${error.message}\`\`\`` })
                ]
            });
        }
    }
};
