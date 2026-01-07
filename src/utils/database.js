const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function ensureIndexes(db) {
  try {
    // Index cho vouchers collection
    // Tìm nhanh voucher theo code (cho scheduler)
    await db.collection('vouchers').createIndex({ code: 1 });
    await db.collection('vouchers').createIndex({ expiresAt: 1 }); // Tìm voucher hết hạn nhanh update 

    // Index cho uservouchers collection
    // Tìm nhanh record cần update (dmMessageId exists + notificationUpdated false)
    await db.collection('uservouchers').createIndex({
      notificationUpdated: 1,
      dmMessageId: 1
    });
    // Tìm nhanh theo voucherCode để join
    await db.collection('uservouchers').createIndex({ voucherCode: 1 });
    // Tìm nhanh theo userId (check duplicate)
    await db.collection('uservouchers').createIndex({ userId: 1, voucherCode: 1 });

    // console.log('Database indexes ensured');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
    // Tạo index ngay khi connect lần đầu
    await ensureIndexes(client.db(process.env.DB_NAME));
  }
  return client.db(process.env.DB_NAME);
}

module.exports = {
  connectToDatabase,
};