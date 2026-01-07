const { connectToDatabase } = require('../utils/database');
const { sendDM } = require('../utils/helpers');
const { EmbedBuilder } = require('discord.js');

/**
 * Create a new voucher in the database
 * @param {Object} voucherData - Voucher details
 * @returns {Promise<Object>} Created voucher
 */
async function createVoucher(voucherData) {
    try {
        const db = await connectToDatabase();
        const vouchersCollection = db.collection('vouchers');

        const currentDate = new Date();

        // Calculate expiration date
        let expiresAt;
        if (voucherData.expirationDays === 0) {
            // 0 days = 15 seconds expiration for testing
            expiresAt = new Date(currentDate.getTime() + 15 * 1000);
        } else {
            // Calculate target date based on days
            const targetTime = new Date(currentDate.getTime() + voucherData.expirationDays * 24 * 60 * 60 * 1000);

            // We want "End of Day" in Vietnam Time (GMT+7)
            const vnOffset = 7 * 60 * 60 * 1000;
            const vnTime = new Date(targetTime.getTime() + vnOffset);

            // Set to end of day (23:59:59.999)
            vnTime.setUTCHours(23, 59, 59, 999);

            // Shift back to real UTC timestamp
            expiresAt = new Date(vnTime.getTime() - vnOffset);
        }

        const voucher = {
            code: voucherData.code.toUpperCase(), // Store in uppercase for consistency
            discountType: voucherData.discountType, // 'fixed' or 'percentage'
            discountValue: voucherData.discountValue,
            applicableProducts: voucherData.applicableProducts || [], // Empty array = all products
            createdBy: voucherData.createdBy,
            createdAt: currentDate,
            expiresAt: expiresAt,
            isActive: true,
            maxUses: voucherData.maxUses || null, // null = unlimited
            currentUses: 0
        };

        await vouchersCollection.insertOne(voucher);
        console.log(`Voucher created: ${voucher.code}`);
        return voucher;
    } catch (error) {
        console.error('Error creating voucher:', error);
        throw error;
    }
}

async function getVoucherByCode(code) {
    try {
        const db = await connectToDatabase();
        return await db.collection('vouchers').findOne({ code: code.toUpperCase() });
    } catch (error) {
        console.error('Error getting voucher by code:', error);
        throw error;
    }
}

async function getAllVouchers() {
    try {
        const db = await connectToDatabase();
        return await db.collection('vouchers').find({}).sort({ createdAt: -1 }).toArray();
    } catch (error) {
        console.error('Error getting all vouchers:', error);
        throw error;
    }
}

async function getUserVouchers(userId) {
    try {
        const db = await connectToDatabase();
        return await db.collection('uservouchers').aggregate([
            { $match: { userId: userId } },
            {
                $lookup: {
                    from: 'vouchers',
                    localField: 'voucherCode',
                    foreignField: 'code',
                    as: 'voucherDetails'
                }
            },
            { $unwind: '$voucherDetails' }
        ]).toArray();
    } catch (error) {
        console.error('Error getting user vouchers:', error);
        throw error;
    }
}

async function validateVoucher(code, userId, productId) {
    try {
        const voucher = await getVoucherByCode(code);
        if (!voucher) {
            return { valid: false, message: 'Mã giảm giá không tồn tại.' };
        }

        if (!voucher.isActive) {
            return { valid: false, message: 'Mã giảm giá đang bị tắt.' };
        }

        if (new Date() > new Date(voucher.expiresAt)) {
            return { valid: false, message: 'Mã giảm giá đã hết hạn.' };
        }

        if (voucher.maxUses && voucher.currentUses >= voucher.maxUses) {
            return { valid: false, message: 'Mã giảm giá đã hết số lượng sử dụng.' };
        }

        // Check product applicability
        if (voucher.applicableProducts.length > 0 && !voucher.applicableProducts.includes(productId)) {
            return { valid: false, message: 'Mã giảm giá không áp dụng cho sản phẩm này.' };
        }

        // Check if user owns this voucher (if using distribution model)
        // Or if it's a public code, we might check if they already usage it.
        // Assuming Distributed Model based on getUserVouchers existence:
        const db = await connectToDatabase();
        const userVoucher = await db.collection('uservouchers').findOne({
            userId: userId,
            voucherCode: code.toUpperCase()
        });

        if (!userVoucher) {
            // If strictly distributed:
            return { valid: false, message: 'Bạn chưa sở hữu mã giảm giá này.' };
            // If mixed model (public codes allowed), we would change this.
            // But let's stick to distributed for now based on context.
        }

        if (userVoucher.isUsed) {
            return { valid: false, message: 'Bạn đã sử dụng mã giảm giá này rồi.' };
        }

        return { valid: true, voucher, userVoucher };
    } catch (error) {
        console.error('Error validating voucher:', error);
        return { valid: false, message: 'Lỗi hệ thống khi kiểm tra mã.' };
    }
}

async function deleteVoucher(code) {
    try {
        const db = await connectToDatabase();
        await db.collection('vouchers').deleteOne({ code: code.toUpperCase() });
        // Clean up distributed copies too
        await db.collection('uservouchers').deleteMany({ voucherCode: code.toUpperCase() });
    } catch (error) {
        console.error('Error deleting voucher:', error);
        throw error;
    }
}

async function updateVoucherStatus(code, isActive) {
    try {
        const db = await connectToDatabase();
        await db.collection('vouchers').updateOne(
            { code: code.toUpperCase() },
            { $set: { isActive: isActive } }
        );
    } catch (error) {
        console.error('Error updating voucher status:', error);
        throw error;
    }
}

async function applyVoucher(voucherCode, userId, orderCode, originalAmount) {
    try {
        const db = await connectToDatabase();
        const userVouchersCollection = db.collection('uservouchers');

        const voucher = await getVoucherByCode(voucherCode);
        if (!voucher) throw new Error('Voucher not found');

        const currentDate = new Date();
        const vietnamDate = new Date(currentDate.setHours(currentDate.getHours() + 7)); // Simple offset

        let discountAmount = 0;
        if (voucher.discountType === 'fixed') {
            discountAmount = voucher.discountValue;
        } else if (voucher.discountType === 'percentage') {
            discountAmount = Math.round((originalAmount * voucher.discountValue) / 100);
        }

        // Update stats
        await db.collection('vouchers').updateOne(
            { code: voucher.code },
            { $inc: { currentUses: 1 } }
        );

        // Mark user voucher as used
        await userVouchersCollection.updateOne(
            { userId: userId, voucherCode: voucherCode.toUpperCase() },
            {
                $set: {
                    isUsed: true,
                    usedAt: vietnamDate,
                    orderId: orderCode,
                    usedNotificationUpdated: false // Add flag for scheduler to update DM
                }
            }
        );

        return discountAmount;
    } catch (error) {
        console.error('Error applying voucher:', error);
        throw error;
    }
}

async function deleteAllVouchers() {
    try {
        const db = await connectToDatabase();
        // Delete all voucher definitions
        const resultV = await db.collection('vouchers').deleteMany({});
        // Delete all distributed user vouchers
        const resultU = await db.collection('uservouchers').deleteMany({});

        console.log(`Deleted all vouchers: ${resultV.deletedCount}, User Vouchers: ${resultU.deletedCount}`);
        return { deletedVouchers: resultV.deletedCount, deletedUserVouchers: resultU.deletedCount };
    } catch (error) {
        console.error('Error deleting all vouchers:', error);
        throw error;
    }
}

/**
 * Distribute distinct copies of a voucher to a list of users
 * @param {string} voucherCode 
 * @param {string[]} userIds 
 * @param {Object} client - Discord client for sending DMs
 * @returns {Promise<Object>} Distribution stats
 */
async function distributeVouchers(voucherCode, userIds, client) {
    try {
        const db = await connectToDatabase();
        const userVouchersCollection = db.collection('uservouchers');
        const vouchersCollection = db.collection('vouchers');

        const voucher = await getVoucherByCode(voucherCode);
        if (!voucher) throw new Error('Voucher not found');

        let successCount = 0;
        let failCount = 0;
        const details = [];

        for (const userId of userIds) {
            try {
                // Ensure idempotency: Don't distribute if already has it
                const existing = await userVouchersCollection.findOne({
                    userId: userId,
                    voucherCode: voucherCode.toUpperCase()
                });

                if (!existing) {
                    // Gửi DM cho user trước
                    let messageId = null;
                    let channelId = null;

                    if (client) {
                        try {
                            const expirationDate = new Date(voucher.expiresAt);
                            const formattedDate = new Intl.DateTimeFormat('vi-VN', {
                                timeZone: 'Asia/Ho_Chi_Minh',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }).format(expirationDate);

                            const discountValueDisplay = voucher.discountType === 'fixed'
                                ? `${voucher.discountValue.toLocaleString('vi-VN')} VND`
                                : `${voucher.discountValue}%`;

                            const productsDisplay = voucher.applicableProducts && voucher.applicableProducts.length > 0
                                ? voucher.applicableProducts.join(', ')
                                : 'Tất cả sản phẩm';

                            const embed = new EmbedBuilder()
                                .setColor(0x5865F2)
                                .setTitle('🎁 Bạn nhận được mã giảm giá')
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
                                .addFields({
                                    name: '**Mua ngay tại**',
                                    value: 'https://discord.com/channels/1053835122530590781/1205701391297941525',
                                    inline: false
                                },
                                    {
                                        name: 'Video hướng dẫn',
                                        value: '[Cách thanh toán qua Bot LegitVN](https://www.youtube.com/watch?v=VCk9Hl5NmHc)',
                                        inline: false
                                    })
                                .setFooter({ text: 'Sử dụng lệnh `/myvouchers` để xem chi tiết' })
                                .setTimestamp();

                            const sentMessage = await sendDM(client, userId, { embeds: [embed] });

                            if (sentMessage) {
                                messageId = sentMessage.id;
                                channelId = sentMessage.channel.id;
                                console.log(`DM sent successfully to: ${userId}, messageId: ${messageId}`);
                            }
                        } catch (dmError) {
                            console.error(`Failed to send DM to ${userId}:`, dmError.message);
                            // Continue anyway to save voucher record
                        }
                    }

                    // Save to database with message info
                    await userVouchersCollection.insertOne({
                        userId: userId,
                        voucherCode: voucherCode.toUpperCase(),
                        isUsed: false,
                        distributedAt: new Date(),
                        dmMessageId: messageId,
                        dmChannelId: channelId,
                        notificationUpdated: false, // Track if we've updated the embed when expired
                        usedNotificationUpdated: false // Track if we've updated the embed when used
                    });

                    successCount++;
                    details.push({ userId, status: 'success' });
                } else {
                    failCount++;
                    details.push({ userId, status: 'already_exists' });
                }
            } catch (err) {
                console.error(`Failed to distribute to ${userId}:`, err);
                failCount++;
                details.push({ userId, status: 'error', error: err.message });
            }
        }

        return { successCount, failCount, details };

    } catch (error) {
        console.error('Error distributing vouchers:', error);
        throw error;
    }
}

module.exports = {
    createVoucher,
    getVoucherByCode,
    getAllVouchers,
    getUserVouchers,
    validateVoucher,
    deleteVoucher,
    updateVoucherStatus,
    applyVoucher,
    deleteAllVouchers,
    distributeVouchers
};
