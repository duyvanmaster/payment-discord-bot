const { connectToDatabase } = require('./database'); // Import hàm connectToDatabase từ file database.js

// Hàm lưu giao dịch có thanh toán vào MongoDB
async function savePaymentToDB(body, selectedSubProduct, interaction, sentMessage) {
  try {
    const db = await connectToDatabase();
    const paymentsCollection = db.collection('payments');

    const currentDate = new Date();
    const vietnamDate = new Date(currentDate.setHours(currentDate.getHours() + 7));

    await paymentsCollection.insertOne({
      orderCode: body.orderCode,
      amount: body.amount,
      product: selectedSubProduct,
      userId: interaction.user.id,
      messageId: sentMessage.id,
      status: 'pending',
      createdAt: vietnamDate,
    });

    console.log(`Transaction data saved: ${body.orderCode}`);
  } catch (error) {
    console.error("Lỗi khi lưu thông tin giao dịch vào MongoDB:", error);
    throw error;
  }
}

// Hàm lưu thông tin sản phẩm miễn phí vào MongoDB
async function saveFreeProductToDB(freeProductInfo, interaction) {
  try {
    const db = await connectToDatabase();
    const paymentsCollection = db.collection('freedata');

    const currentDate = new Date();
    const vietnamDate = new Date(currentDate.setHours(currentDate.getHours() + 7));

    await paymentsCollection.insertOne({
      orderCode: freeProductInfo.orderCode,
      product: freeProductInfo.product,
      userId: interaction.user.id,
      amount: 0, // Sản phẩm miễn phí nên không có số tiền
      status: 'completed',
      createdAt: vietnamDate,
    });

    console.log(`Free data saved: ${freeProductInfo.orderCode}`);
  } catch (error) {
    console.error("Lỗi khi lưu thông tin sản phẩm miễn phí vào MongoDB:", error);
    throw error;
  }
}

async function saveWebhookPaymentToDB(orderCode, amount, product, userId, status) {
  try {
    const db = await connectToDatabase();
    const paymentsCollection = db.collection('completedPayments');

    const currentDate = new Date();
    const vietnamDate = new Date(currentDate.setHours(currentDate.getHours() + 7));

    await paymentsCollection.insertOne({
      orderCode: orderCode,
      amount: amount,
      product: product, 
      userId: userId, 
      status: status,
      createdAt: vietnamDate, 
    });

    console.log(`Webhook data saved: ${orderCode}`);
  } catch (error) {
    console.error("Lỗi khi lưu dữ liệu webhook vào MongoDB:", error);
    throw error;
  }
}

module.exports = {
  savePaymentToDB,
  saveFreeProductToDB,
  saveWebhookPaymentToDB,
};
