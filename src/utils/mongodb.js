const { connectToDatabase } = require('./database'); // Import hàm connectToDatabase từ file database.js

// Hàm lưu giao dịch có thanh toán vào MongoDB
async function savePaymentToDB(body, selectedSubProduct, interaction, sentMessage, voucherCode = null) {
  try {
    const db = await connectToDatabase();
    const paymentsCollection = db.collection('paymentsdata');

    const currentDate = new Date();
    const vietnamDate = new Date(currentDate.setHours(currentDate.getHours() + 7));

    await paymentsCollection.insertOne({
      orderCode: body.orderCode,
      amount: body.amount,
      product: selectedSubProduct,
      userId: interaction.user.id,
      messageId: sentMessage.id,
      checkoutUrl: body.checkoutUrl,
      status: 'pending',
      voucherCode: voucherCode, // Store voucher code if applied
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

async function saveWebhookPaymentToDB(orderCode, amount, product, userId, status = "completed") {
  try {
    const db = await connectToDatabase();
    const paymentsCollection = db.collection('paymentsdata');
    const currentDate = new Date();
    const vietnamDate = new Date(currentDate.setHours(currentDate.getHours() + 7));

    const updateResult = await paymentsCollection.updateOne(
      { orderCode: orderCode, userId: userId, product: product, status: { $in: ["pending"] } }, // Tìm giao dịch đang chờ hoặc đang xử lý
      {
        $set: {
          status: status,
          updatedAt: vietnamDate, // Thêm trường cập nhật thời gian
        },
      },
      { upsert: false } // Không tạo mới nếu không tìm thấy
    );

    if (updateResult.matchedCount === 0) {
      console.warn(`Không tìm thấy giao dịch với orderCode: ${orderCode} để cập nhật.`);
      //Tuỳ chọn: Bạn có thể quyết định tạo mới nếu giao dịch không tồn tại
      await paymentsCollection.insertOne({
        orderCode: orderCode,
        amount: amount,
        product: product,
        userId: userId,
        status: status,
        createdAt: vietnamDate,
        updatedAt: vietnamDate,
      });
      console.log(`Webhook data saved (mới): ${orderCode}`);
    } else {
      console.log(`Webhook data updated: ${orderCode}`);
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật dữ liệu webhook vào MongoDB:", error);
    throw error;
  }
}

async function getPendingPaymentFromDB(orderCode) {
  try {
    const db = await connectToDatabase();
    const pendingPaymentsCollection = db.collection('paymentsdata');

    const payment = await pendingPaymentsCollection.findOne({ orderCode });
    if (payment) {
      console.log(`Pending payment found: ${orderCode}`);
    } else {
      console.warn(`Không tìm thấy giao dịch đang chờ: ${orderCode}`);
    }
    return payment;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin giao dịch đang chờ:", error);
    throw error;
  }
}

module.exports = {
  savePaymentToDB,
  saveFreeProductToDB,
  saveWebhookPaymentToDB,
  getPendingPaymentFromDB
};
