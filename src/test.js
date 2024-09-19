const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const dotenv = require("dotenv");

// Nạp biến môi trường từ file .env (nếu có)
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Prefix cho lệnh
const prefix = "!";

// Token từ file .env hoặc bạn có thể dán trực tiếp token vào đây
const TOKEN = process.env.TOKEN || 'MTI2OTYzMzU5OTMwMTM1MzQ4Mg.G0VabC.6tIQCRm6SPYsjk5k5khvpAiEpjpD5cmD4BOHVA';

// Khi bot đã sẵn sàng
client.once("ready", () => {
  console.log("Bot đã sẵn sàng!");
});

// Lắng nghe tin nhắn
client.on("messageCreate", (message) => {
  // Bỏ qua tin nhắn của bot và tin nhắn không có prefix
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Lấy nội dung lệnh sau prefix
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Nếu lệnh là "link"
  if (command === "link") {
    // Tạo một button mở link
    const linkButton = new ButtonBuilder()
      .setLabel('Tải FFx86') // Văn bản trên nút
      .setURL('https://drive.usercontent.google.com/download?id=1oHfxmrH3r19OOAECJ50onPhHe0OrrFBo&export=download&authuser=0&confirm=t&uuid=d8be2673-dd81-411f-800f-6a2659c7479d&at=AO7h07dADQnc4xmPe5-MPmI9nnTN%3A1726661416939') // URL mà nút sẽ mở
      .setStyle(ButtonStyle.Link); // Đặt kiểu nút là Link

    // Tạo hàng chứa button
    const row = new ActionRowBuilder().addComponents(linkButton);

    // Tạo embed
    const embed = new EmbedBuilder()
      .setTitle('FFX86 OB46 Share By LegitVN')
      .setDescription('```Loại file là APK, khả dụng với các giả lập phổ biến như Bluestacks và Msi Player. Lưu ý: Xóa FreeFire gốc đã cài đặt trước đó để sử dụng FFx86.```')
      .setThumbnail('https://cdn.discordapp.com/attachments/1152492381631942697/1285945277760540692/Free-Fire-Advance-Server-Download-OB45-APK-for-Android.png?ex=66ec1d5d&is=66eacbdd&hm=e5c31a704e0bf25c8323d41d22742c2485195b176b6d3e3b98428fd1199dd3d7&')
      .setFooter({
        text: "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!", 
        iconURL: 'https://r2.e-z.host/2825fb47-f8a4-472c-9624-df2489f897c0/rf2o4ffc.png'
      })
      .setColor(0x007AFF);

    // Gửi embed cùng với nút mở liên kết
    message.channel.send({
      embeds: [embed],
      components: [row], // Chứa nút mở link
    });
  }
});

// Đăng nhập bot bằng token
client.login(TOKEN);
