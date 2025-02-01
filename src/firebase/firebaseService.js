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

async function getEmbedConfig() {
  const dbRef = ref(fisebasedb);
  try {
      const snapshot = await get(child(dbRef, `embedConfig`));
      if (snapshot.exists()) {
          return snapshot.val();
      } else {
          console.log('Không tìm thấy cấu hình embed!');
          return null;
      }
  } catch (error) {
      console.error('Lỗi khi lấy cấu hình embed từ Firebase:', error);
  }
}

module.exports = { getProductInfo, getEmbedConfig };
