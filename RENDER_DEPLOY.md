# Render Deployment Guide

## ⚠️ Các vấn đề cần lưu ý

### 1. Keep-Alive (Free Tier Sleep)
**Vấn đề:** Render Free Tier sleep sau 15 phút không có traffic.

**Giải pháp:**
- Dùng dịch vụ ping như [UptimeRobot](https://uptimerobot.com/) hoặc [Cron-job.org](https://cron-job.org/)
- Ping endpoint: `https://your-app.onrender.com/health` mỗi 10-14 phút

### 2. Environment Variables
Trong Render Dashboard, thêm các biến:
```
TOKEN=your_discord_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
PAYMENTS_CHANNEL_ID=your_channel_id
MONGO_URI=your_mongodb_uri
FIREBASE_API_KEY=your_key
FIREBASE_AUTH_DOMAIN=your_domain
FIREBASE_DATABASE_URL=your_url
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_checksum_key
YOUR_DOMAIN=https://your-app.onrender.com
```

⚠️ **KHÔNG** set `PORT` - Render tự động set!

### 3. Build Command
```bash
npm install
```

### 4. Start Command
```bash
npm start
```

Hoặc trong `package.json`:
```json
{
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  }
}
```

### 5. Domain Configuration
- Render cung cấp domain: `https://your-app-name.onrender.com`
- Set `YOUR_DOMAIN` trong env variables
- PayOS webhook URL: `https://your-app.onrender.com/payos-webhook`

### 6. Slash Commands Registration
**SAU KHI DEPLOY**, chạy một lần:
```bash
node src/SlashCommands/slashcommands.js
```

Hoặc thêm vào Build Command:
```bash
npm install && node src/SlashCommands/slashcommands.js
```

### 7. Memory & Performance

#### Bulk Messaging
Code hiện tại gửi tuần tự → **An toàn với Free Tier (512MB RAM)**

Nếu muốn tối ưu hơn, tăng batch size với delay:
```javascript
// Example optimization (không cần thiết cho Free Tier)
for (let i = 0; i < userIds.length; i += 10) {
    const batch = userIds.slice(i, i + 10);
    await Promise.all(batch.map(id => sendDM(client, id, { embed })));
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay
}
```

### 8. Logs & Debugging
- Xem logs trong Render Dashboard → Logs tab
- Render tự động restart nếu app crash
- Logs giữ lại 7 ngày (Free Tier)

### 9. Cold Start
**Vấn đề:** Khi service sleep, lần đầu wake up mất ~30s.

**Ảnh hưởng:**
- Discord interactions có thể timeout
- `deferReply()` đã xử lý → OK ✅

### 10. File Uploads
**Lưu ý:** File uploads trong `/sendmessage_file` dùng Discord attachment URL → **Không vấn đề**

Nếu cần lưu file tạm, dùng `/tmp`:
```javascript
const fs = require('fs');
const tmpPath = '/tmp/userdata.json';
```

## 🚀 Deployment Steps

1. **Push code lên GitHub**
2. **Tạo Web Service trên Render**
   - Connect GitHub repo
   - Set Build Command: `npm install`
   - Set Start Command: `npm start`
3. **Thêm Environment Variables**
4. **Deploy**
5. **Chạy slash command registration** (chỉ một lần)
6. **Setup UptimeRobot** để ping `/health`

## 📊 Monitoring
- **Render Dashboard**: CPU, Memory, Logs
- **UptimeRobot**: Uptime monitoring
- **Discord**: Bot status

## 💡 Tips
- Dùng MongoDB Atlas (miễn phí) cho database
- Firebase Realtime Database free tier đủ dùng
- Nếu cần always-on, nâng lên Paid tier ($7/tháng)

---

✅ **Code của bạn đã sẵn sàng cho Render!**
