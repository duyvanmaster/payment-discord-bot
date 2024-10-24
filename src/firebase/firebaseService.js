const { fisebasedb, ref, get, child } = require('./firebaseConfig');

async function getProductInfo() {
  const dbRef = ref(fisebasedb);
  try {
    const snapshot = await get(child(dbRef, `products`));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      console.log('Không tìm thấy dữ liệu sản phẩm!');
      return null;
    }
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu từ Firebase:', error);
  }
}

module.exports = { getProductInfo };
