const { connectToDatabase } = require('./database');
const { EmbedBuilder } = require('discord.js');

// Config
const BATCH_SIZE = 20; // Số lượng tin nhắn tối đa xử lý mỗi lần chạy
const EDIT_DELAY = 1000; // Delay 1s giữa mỗi lần edit để tránh rate limit
const SCHEDULER_INTERVAL = 60 * 1000; // Chạy mỗi 60 giây

/**
 * Check for expired vouchers and update their DM notifications
 * Optimized for performance and rate limits
 * @param {Client} client - Discord bot client
 */
async function updateExpiredVoucherNotifications(client) {
    try {
        const db = await connectToDatabase();
        const userVouchersCollection = db.collection('uservouchers');
        const vouchersCollection = db.collection('vouchers');

        const now = new Date();

        // 1. Tìm tất cả các loại voucher ĐÃ HẾT HẠN
        const expiredVouchersList = await vouchersCollection.find({
            expiresAt: { $lt: now }
        }).toArray();

        if (expiredVouchersList.length === 0) {
            return; // Không có voucher nào hết hạn, thoát sớm
        }

        // Tạo map để tra cứu nhanh thông tin voucher
        const expiredVouchersMap = new Map();
        const expiredCodes = [];

        expiredVouchersList.forEach(v => {
            expiredVouchersMap.set(v.code, v);
            expiredCodes.push(v.code);
        });

        // 2. Tìm các user voucher cần update (limit BATCH_SIZE)
        // Chỉ lấy những record có dmMessageId (đã gửi DM) và chưa update thông báo
        const userVouchersToUpdate = await userVouchersCollection.find({
            voucherCode: { $in: expiredCodes },      // Thuộc các mã đã hết hạn
            dmMessageId: { $exists: true, $ne: null }, // Đã gửi DM
            notificationUpdated: false               // Chưa update thông báo
        }).limit(BATCH_SIZE).toArray();

        if (userVouchersToUpdate.length === 0) {
            return;
        }

        console.log(`[Voucher Scheduler] Processing batch of ${userVouchersToUpdate.length} expired notifications...`);

        // 3. Xử lý từng item
        for (const userVoucher of userVouchersToUpdate) {
            const voucher = expiredVouchersMap.get(userVoucher.voucherCode);
            if (!voucher) continue;

            const expiresAt = new Date(voucher.expiresAt);

            try {
                // Fetch channel và message an toàn
                const channel = await client.channels.fetch(userVoucher.dmChannelId).catch(() => null);
                if (!channel) {
                    await markAsFailed(userVouchersCollection, userVoucher._id, 'Channel not found (User blocked bot or left server)');
                    continue;
                }

                const message = await channel.messages.fetch(userVoucher.dmMessageId).catch(() => null);
                if (!message) {
                    await markAsFailed(userVouchersCollection, userVoucher._id, 'Message not found (User might have deleted verification DM)');
                    continue;
                }

                // Create expired embed (RED color)
                const expiredEmbed = new EmbedBuilder()
                    .setColor(0xFF0000) // Red color
                    .setTitle(`❌ Mã giảm giá đã hết hạn`)
                    .addFields(
                        {
                            name: 'Mã giảm giá',
                            value: `\`\`\`${voucher.code}\`\`\``,
                            inline: true
                        },
                        {
                            name: 'Hết hạn lúc',
                            value: `\`\`\`${new Intl.DateTimeFormat('vi-VN', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }).format(expiresAt)}\`\`\``,
                            inline: true
                        }
                    )
                    .setFooter({ text: 'LegitVN • Mã giảm giá không còn hiệu lực' })
                    .setTimestamp();

                // Edit the message
                await message.edit({ embeds: [expiredEmbed] });

                // Mark as updated in database
                await userVouchersCollection.updateOne(
                    { _id: userVoucher._id },
                    { $set: { notificationUpdated: true, notificationUpdatedAt: new Date() } }
                );

                console.log(`[Voucher Scheduler] Updated: ${voucher.code} -> User ${userVoucher.userId}`);

                // Rate limit protection: delay nhẹ giữa các requests
                await new Promise(resolve => setTimeout(resolve, EDIT_DELAY));

            } catch (error) {
                console.error(`[Voucher Scheduler] Error processing user ${userVoucher.userId}:`, error.message);

                // Chỉ đánh dấu là failed (không retry nữa) với các lỗi "vĩnh viễn"
                // 10008: Unknown Message
                // 10003: Unknown Channel
                // 50007: Cannot send messages to this user (Blocked/Closed DM)
                // 50013: Missing Permissions
                if (error.code === 10008 || error.code === 10003 || error.code === 50007 || error.code === 50013 || error.status === 404 || error.status === 403) {
                    await markAsFailed(userVouchersCollection, userVoucher._id, `Permanent Error: ${error.message}`);
                } else {
                    // Với lỗi mạng, 500, timeout... -> KHÔNG đánh dấu, để lần sau chạy lại retry
                    console.log(`[Voucher Scheduler] Transient error for user ${userVoucher.userId}, will retry next run.`);
                }
            }
        }
    } catch (error) {
        console.error('[Voucher Scheduler] Error:', error);
    }
}

async function markAsFailed(collection, id, reason) {
    // Đánh dấu là đã update (để không retry vô hạn) nhưng ghi lại lỗi
    await collection.updateOne(
        { _id: id },
        { $set: { notificationUpdated: true, updateFailedReason: reason } }
    );
}

/**
 * Check for used vouchers and update their DM notifications
 * @param {Client} client - Discord bot client
 */
async function updateUsedVoucherNotifications(client) {
    try {
        const db = await connectToDatabase();
        const userVouchersCollection = db.collection('uservouchers');
        const vouchersCollection = db.collection('vouchers');

        // Tìm các user voucher đã được sử dụng
        const usedVouchersToUpdate = await userVouchersCollection.find({
            isUsed: true,                                   // Đã sử dụng
            dmMessageId: { $exists: true, $ne: null },      // Đã gửi DM
            usedNotificationUpdated: { $ne: true }          // Chưa update thông báo used
        }).limit(BATCH_SIZE).toArray();

        if (usedVouchersToUpdate.length === 0) {
            return;
        }

        console.log(`[Voucher Scheduler] Processing batch of ${usedVouchersToUpdate.length} used notifications...`);

        // Lấy thông tin voucher cho mỗi user voucher
        for (const userVoucher of usedVouchersToUpdate) {
            const voucher = await vouchersCollection.findOne({ code: userVoucher.voucherCode });
            if (!voucher) continue;

            const usedAt = userVoucher.usedAt ? new Date(userVoucher.usedAt) : new Date();

            try {
                // Fetch channel và message an toàn
                const channel = await client.channels.fetch(userVoucher.dmChannelId).catch(() => null);
                if (!channel) {
                    await markAsUsedFailed(userVouchersCollection, userVoucher._id, 'Channel not found (User blocked bot or left server)');
                    continue;
                }

                const message = await channel.messages.fetch(userVoucher.dmMessageId).catch(() => null);
                if (!message) {
                    await markAsUsedFailed(userVouchersCollection, userVoucher._id, 'Message not found (User might have deleted DM)');
                    continue;
                }

                // Create used embed (GRAY/MUTED color)
                const usedEmbed = new EmbedBuilder()
                    .setColor(0x95A5A6) // Muted gray color
                    .setTitle(`✅Mã giảm giá đã sử dụng`)
                    .addFields(
                        {
                            name: 'Mã giảm giá',
                            value: `\`\`\`${voucher.code}\`\`\``,
                            inline: true
                        },
                        {
                            name: 'Sử dụng lúc',
                            value: `\`\`\`${new Intl.DateTimeFormat('vi-VN', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }).format(usedAt)}\`\`\``,
                            inline: true
                        }
                    )
                    .setFooter({ text: 'LegitVN • Cảm ơn bạn đã sử dụng' })
                    .setTimestamp();

                // Edit the message
                await message.edit({ embeds: [usedEmbed] });

                // Mark as updated in database
                await userVouchersCollection.updateOne(
                    { _id: userVoucher._id },
                    { $set: { usedNotificationUpdated: true, usedNotificationUpdatedAt: new Date() } }
                );

                console.log(`[Voucher Scheduler] Updated Used: ${voucher.code} -> User ${userVoucher.userId}`);

                // Rate limit protection
                await new Promise(resolve => setTimeout(resolve, EDIT_DELAY));

            } catch (error) {
                console.error(`[Voucher Scheduler] Error processing used voucher for user ${userVoucher.userId}:`, error.message);

                // Đánh dấu failed cho các lỗi vĩnh viễn
                if (error.code === 10008 || error.code === 10003 || error.code === 50007 || error.code === 50013 || error.status === 404 || error.status === 403) {
                    await markAsUsedFailed(userVouchersCollection, userVoucher._id, `Permanent Error: ${error.message}`);
                } else {
                    console.log(`[Voucher Scheduler] Transient error for user ${userVoucher.userId}, will retry next run.`);
                }
            }
        }
    } catch (error) {
        console.error('[Voucher Scheduler] Error in updateUsedVoucherNotifications:', error);
    }
}

async function markAsUsedFailed(collection, id, reason) {
    await collection.updateOne(
        { _id: id },
        { $set: { usedNotificationUpdated: true, usedUpdateFailedReason: reason } }
    );
}

/**
 * Start the voucher expiration checker
 * Runs periodically to check for expired vouchers
 * @param {Client} client - Discord bot client
 */
function startVoucherExpirationScheduler(client) {
    console.log(`[Voucher Scheduler] Started. Interval: ${SCHEDULER_INTERVAL}ms`);

    // Run immediately on start
    updateExpiredVoucherNotifications(client);
    updateUsedVoucherNotifications(client);

    // Then run periodically
    setInterval(() => {
        updateExpiredVoucherNotifications(client);
        updateUsedVoucherNotifications(client);
    }, SCHEDULER_INTERVAL);
}

module.exports = {
    startVoucherExpirationScheduler,
    updateExpiredVoucherNotifications,
    updateUsedVoucherNotifications
};
