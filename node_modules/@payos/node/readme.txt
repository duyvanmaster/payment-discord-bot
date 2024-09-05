Hướng dẫn publish thư viện @payos/node lên npm

B1: Đã đăng kí tài khoản npm

B2: Build thư viện bằng lệnh:
npm run build 

B3: Vào file package.json thay đổi giá trị version

B4: Để test package thì chạy lệnh (phải build trước):
npm install /path/to/package

Ví dụ: npm install ~/Documents/payos-lib-node

B5: Publish thư viện lên npm bằng lệnh:
npm publish 

Đăng nhập tài khoản npm nếu hỏi tài khoản

Tham khảo: https://docs.npmjs.com/creating-and-publishing-scoped-public-packages