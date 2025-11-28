# 🤖 Payment Discord Bot

> Discord bot quản lý thanh toán tự động với VietQR và gửi tin nhắn hàng loạt

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14-5865F2?logo=discord&logoColor=white)](https://discord.js.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Deploy](https://img.shields.io/badge/deploy-Render-46E3B7?logo=render&logoColor=white)](https://render.com)

## ✨ Tính năng

### 💳 Thanh toán
- ✅ **Tích hợp PayOS** - Xử lý thanh toán trực tuyến
- ✅ **VietQR** - Tạo mã QR cho tất cả ngân hàng Việt Nam
- ✅ **Webhook** - Tự động xác nhận thanh toán
- ✅ **Quản lý sản phẩm** - Firebase Realtime Database

### 📬 Gửi tin nhắn hàng loạt
- ✅ **Upload file** - Hỗ trợ JSON và TXT
- ✅ **Không giới hạn** - Gửi cho hàng nghìn người
- ✅ **Preview chuyên nghiệp** - Xem trước trước khi gửi
- ✅ **Xác nhận/Hủy bỏ** - An toàn tránh nhầm lẫn
- ✅ **Thống kê chi tiết** - Progress bar và báo cáo

### 🎯 Commands

| Command | Mô tả |
|---------|-------|
| `/legitvn` | Hiển thị sản phẩm và xử lý thanh toán |
| `/qrcode` | Tạo mã QR VietQR với giá trị mặc định |
| `/sendmessage_file` | Gửi tin nhắn hàng loạt qua file |

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Firebase account
- Discord Bot Token

### Installation

```bash
# Clone repository
git clone https://github.com/duyvanmaster/payment-discord-bot.git
cd payment-discord-bot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Register slash commands
node src/SlashCommands/slashcommands.js

# Start development server
npm run dev
```

## ⚙️ Configuration

### Environment Variables

Tạo file `.env` từ `.env.example` và điền thông tin:

```env
# Discord
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
PAYMENTS_CHANNEL_ID=your_channel_id

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Firebase
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# PayOS (Optional)
PAYOS_CLIENT_ID=your_client_id
PAYOS_API_KEY=your_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key

# Server
PORT=3000
YOUR_DOMAIN=http://localhost:3000
```

### Discord Setup

1. Truy cập [Discord Developer Portal](https://discord.com/developers/applications)
2. Tạo ứng dụng mới → Add Bot
3. Bật **Message Content Intent** và **Server Members Intent**
4. Lấy token và thêm vào `.env`
5. Invite bot với quyền Administrator

### Database Setup

**MongoDB:**
```bash
# Tạo cluster trên MongoDB Atlas
# Copy connection string vào MONGO_URI
```

**Firebase:**
```bash
# 1. Tạo project trên Firebase Console
# 2. Thêm Realtime Database
# 3. Import file realtime-database.json
# 4. Copy config vào .env
```

## 📝 Usage

### `/qrcode` - Tạo mã QR thanh toán

```
/qrcode amount:50000
```

**Tùy chọn:**
- `amount` (bắt buộc): Số tiền
- `bank`: Ngân hàng (mặc định: OCB)
- `account`: Số tài khoản (mặc định: 0988006094)
- `accountname`: Tên tài khoản (mặc định: TRAN VAN QUY)
- `memo`: Nội dung (mặc định: legitvn)

### `/sendmessage_file` - Gửi tin hàng loạt

**Chuẩn bị file JSON:**
```json
[
  {"userId": "123456789"},
  {"userId": "987654321"}
]
```

**Hoặc file TXT:**
```
123456789
987654321
```

**Sử dụng:**
1. Gõ `/sendmessage_file` → Upload file
2. Nhấn nút "Soạn tin nhắn"
3. Nhập nội dung + URL hình (tùy chọn)
4. Xem preview
5. Nhấn "Xác nhận gửi" hoặc "Hủy bỏ"

## 🌐 Deployment

### Render (Khuyến nghị)

Xem hướng dẫn chi tiết: [RENDER_DEPLOY.md](RENDER_DEPLOY.md)

**Quick Deploy:**

1. Fork repository này
2. Tạo Web Service trên [Render](https://render.com)
3. Connect GitHub repo
4. Thêm environment variables
5. Deploy!

**Quan trọng:**
- ⚠️ Setup [UptimeRobot](https://uptimerobot.com/) để ping `/health` mỗi 5-10 phút
- ⚠️ Render Free Tier sẽ sleep sau 15 phút không có traffic

### Other Platforms

Bot cũng chạy tốt trên:
- Railway
- Heroku
- DigitalOcean
- AWS/GCP (VPS)

## 📂 Project Structure

```
payment-discord-bot/
├── src/
│   ├── config/              # Configuration files
│   ├── discord/
│   │   ├── commands/        # Slash commands
│   │   │   ├── legitvn.js
│   │   │   ├── qrcode.js
│   │   │   └── sendmessagefile.js
│   │   ├── events/          # Discord events
│   │   └── client.js
│   ├── server/
│   │   ├── routes/          # Express routes
│   │   └── app.js
│   ├── services/            # Business logic
│   ├── utils/               # Helper functions
│   └── SlashCommands/       # Command registration
├── .env.example             # Environment template
├── .gitignore
├── index.js                 # Entry point
├── package.json
├── README.md
└── RENDER_DEPLOY.md         # Deployment guide
```

## 🛠️ Tech Stack

- **Discord.js v14** - Discord Bot framework
- **Express.js** - Web server & webhook
- **MongoDB** - Primary database
- **Firebase** - Realtime database
- **PayOS** - Payment gateway
- **VietQR API** - QR code generation

## 🔧 Development

```bash
# Development with auto-reload
npm run dev

# Production
npm start

# Register slash commands (after code changes)
node src/SlashCommands/slashcommands.js
```

## 🐛 Troubleshooting

### Bot không nhận được commands
```bash
# Re-register slash commands
node src/SlashCommands/slashcommands.js
```

### Timeout errors
- ✅ Đã fix bằng `deferReply()` trong tất cả commands
- Render cold start có thể mất 20-30s lần đầu

### Failed to send DM
- User đã tắt DM từ server members
- Bot không share server với user đó

## 📊 Features Roadmap

- [ ] Multi-language support
- [ ] Schedule message sending
- [ ] Payment analytics dashboard
- [ ] Role-based permissions
- [ ] Auto-renewal subscriptions

## 🤝 Contributing

Pull requests are welcome! Để contribute:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

## 📄 License

MIT License - xem [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Contact & Support

- **GitHub:** [@duyvanmaster](https://github.com/duyvanmaster)
- **Website:** [e-z.bio/duyvan](https://e-z.bio/duyvan)

## 🌟 Acknowledgments

- [Discord.js](https://discord.js.org/) - Amazing Discord library
- [VietQR](https://vietqr.io/) - QR code API
- [PayOS](https://payos.vn/) - Payment gateway

---

<div align="center">
  <strong>⭐ Star this repo nếu thấy hữu ích!</strong>
  <br/>
  Made with ❤️ by <a href="https://github.com/duyvanmaster">DuyVan</a>
</div>
