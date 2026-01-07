const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { getAllVouchers, deleteVoucher, updateVoucherStatus, deleteAllVouchers } = require('../../services/voucherService');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('managevouchers')
        .setDescription('Quản lý danh sách mã giảm giá (Admin)'),

    async execute(interaction) {
        // Permission check: Owner only for now
        if (interaction.user.id !== interaction.guild.ownerId) {
            return await interaction.reply({
                content: '❌ Chỉ chủ server mới có quyền quản lý mã giảm giá.',
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        // Initial fetch
        const vouchers = await getAllVouchers();
        await showVoucherList(interaction, vouchers);
    },

    // Handle interactions (buttons/select menus)
    async handleInteraction(interaction) {
        if (!interaction.customId.startsWith('manage_')) return;

        const vouchers = await getAllVouchers();

        if (interaction.isStringSelectMenu() && interaction.customId === 'manage_select_voucher') {
            const selectedCode = interaction.values[0];
            await showVoucherDetail(interaction, selectedCode, vouchers);
        } else if (interaction.isButton()) {
            const parts = interaction.customId.split('_');
            const action = parts[1]; // back, delete, toggle, deleteall

            if (action === 'deleteall') {
                // Confirmation before delete all?
                // For now, let's just do it or add a confirmation step?
                // User asked for "button function to delete all". 
                // Let's implement direct delete for speed, or maybe a simple toggle confirmation?
                // Let's assume direct for now, or maybe a follow-up confirm.
                // Given the simple nature, direct delete with success message.

                await deleteAllVouchers();
                await interaction.update({
                    content: '✅ Đã xóa TOÀN BỘ mã giảm giá và dữ liệu phân phát.',
                    embeds: [],
                    components: []
                });
                // Return to empty list
                setTimeout(async () => showVoucherList(interaction, [], true), 2000);

            } else if (action === 'back') {
                await showVoucherList(interaction, vouchers, true);
            } else if (action === 'delete') {
                const code = parts.slice(2).join('_');
                await deleteVoucher(code);
                await interaction.update({
                    content: `✅ Đã xóa mã giảm giá \`${code}\``,
                    embeds: [],
                    components: []
                });
                setTimeout(async () => showVoucherList(interaction, await getAllVouchers(), true), 1000);
            } else if (action === 'toggle') {
                const code = parts.slice(2).join('_');
                const voucher = vouchers.find(v => v.code === code);
                if (voucher) {
                    await updateVoucherStatus(code, !voucher.isActive);
                    const updatedVouchers = await getAllVouchers();
                    await showVoucherDetail(interaction, code, updatedVouchers, true);
                }
            }
        }
    }
};

async function showVoucherList(interaction, vouchers, isUpdate = false) {
    // Row 1: Select Menu (if vouchers exist)
    const rows = [];

    if (vouchers.length > 0) {
        const recentVouchers = vouchers.slice(0, 25);
        const options = recentVouchers.map(v => {
            const statusEmoji = v.isActive ? '🟢' : '🔴';
            const discountDisplay = v.discountType === 'fixed'
                ? `${v.discountValue.toLocaleString('vi-VN')}đ`
                : `${v.discountValue}%`;

            return {
                label: `${v.code} (${discountDisplay})`,
                description: `Status: ${v.isActive ? 'Active' : 'Inactive'} | Used: ${v.currentUses}`,
                value: v.code,
                emoji: statusEmoji
            };
        });

        rows.push(new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('manage_select_voucher')
                .setPlaceholder('Chọn mã để chỉnh sửa/xóa')
                .addOptions(options)
        ));
    }

    // Row 2: Global Actions (Refresh, Delete All)
    // Always show refresh/create hint?
    // Added "Delete All" button
    const actionRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('manage_deleteall_confirm') // Let's name it confirm or just deleteall
            .setCustomId('manage_deleteall')
            .setLabel('Xóa TẤT CẢ Voucher')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️')
            .setDisabled(vouchers.length === 0) // Disable if no vouchers
    );

    rows.push(actionRow);

    const embed = new EmbedBuilder()
        .setColor(0x2B2D31)
        .setTitle('🛠️ Quản lý mã giảm giá')
        .setDescription(vouchers.length > 0
            ? `Tìm thấy **${vouchers.length}** mã giảm giá.\nChọn một mã bên dưới để xem chi tiết hoặc chỉnh sửa.`
            : 'Hiện chưa có mã giảm giá nào. Tạo bằng `/createvoucher`.')
        .setTimestamp();

    if (vouchers.length > 0) {
        const recentVouchers = vouchers.slice(0, 10); // Show top 10 in text
        embed.addFields({
            name: 'Danh sách gần đây',
            value: recentVouchers.map(v => `\`${v.code.padEnd(10)}\` : ${v.isActive ? '🟢' : '🔴'} | Đã dùng: ${v.currentUses}`).join('\n')
        });
    }

    const payload = { embeds: [embed], components: rows };
    // If not Replied and not Deferred, and isUpdate requested -> use update()
    if (isUpdate && interaction.message && !interaction.replied && !interaction.deferred) {
        await interaction.update(payload);
    } else {
        // If already replied/deferred (or not an update), use editReply()
        await interaction.editReply(payload);
    }
}

async function showVoucherDetail(interaction, code, vouchers, isUpdate = true) {
    const voucher = vouchers.find(v => v.code === code);

    if (!voucher) {
        return await interaction.update({
            content: '❌ Mã giảm giá không tồn tại (có thể đã bị xóa).',
            components: []
        });
    }

    const createdDate = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(voucher.createdAt));

    const expiresDate = new Intl.DateTimeFormat('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date(voucher.expiresAt));

    const discountDisplay = voucher.discountType === 'fixed'
        ? `${voucher.discountValue.toLocaleString('vi-VN')} VND`
        : `${voucher.discountValue}%`;

    const statusText = voucher.isActive ? '🟢 Đang hoạt động' : '🔴 Đang tắt';

    const embed = new EmbedBuilder()
        .setColor(voucher.isActive ? 0x57F287 : 0xED4245)
        .setTitle(`Chi tiết mã: ${voucher.code}`)
        .addFields(
            { name: 'Giá trị giảm', value: `\`\`\`${discountDisplay}\`\`\``, inline: true },
            { name: 'Trạng thái', value: `\`\`\`${statusText}\`\`\``, inline: true },
            { name: 'Đã sử dụng', value: `\`\`\`${voucher.currentUses} lần\`\`\``, inline: true },
            { name: 'Ngày tạo', value: `\`\`\`${createdDate}\`\`\``, inline: true },
            { name: 'Hạn sử dụng mã', value: `\`\`\`${expiresDate}\`\`\``, inline: true },
            { name: 'Áp dụng', value: `\`\`\`${voucher.applicableProducts.length > 0 ? voucher.applicableProducts.join(', ') : 'Tất cả'}\`\`\``, inline: false }
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`manage_toggle_${voucher.code}`)
            .setLabel(voucher.isActive ? 'Tắt mã' : 'Bật mã')
            .setStyle(voucher.isActive ? ButtonStyle.Secondary : ButtonStyle.Success)
            .setEmoji(voucher.isActive ? '🛑' : '▶️'),

        new ButtonBuilder()
            .setCustomId(`manage_delete_${voucher.code}`)
            .setLabel('Xóa mã')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️'),

        new ButtonBuilder()
            .setCustomId('manage_back')
            .setLabel('Quay lại')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🔙')
    );

    await interaction.update({
        embeds: [embed],
        components: [row]
    });
}
