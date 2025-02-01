# Payment Discord Bot

Welcome to the Payment Discord Bot project! This bot is designed to help manage and facilitate payments within your Discord server.

## Features

- Display product information
- Process payments
- Track transaction history
- Notify users of payment status

## Configuration

1. **Clone the repository.**

   ```sh
   git clone https://github.com/duyvanmaster/payment-discord-bot.git
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Create a `.env` file based on the `.env.example` in the root directory and add your configuration.**

4. **Set up Discord Bot Configuration:**

   - Go to the [Discord Developer Portal](https://discord.com/developers/applications).
   - Create a new application and add a bot to this application.
   - Obtain the required credentials such as `TOKEN`, `GUILD_ID`, `CLIENT_ID`, and more from Discord Developer Portal.
   - Add these credentials to your `.env` file (see `.env.example` for reference).

   Ensure "Developer Mode" is enabled in Discord's settings to access the "Copy ID" option for `GUILD_ID`, `PAYMENTS_CHANNEL_ID`, `SUPPORTROLE_ID`, and `BOTROLE_ID`.

5. **Set up MongoDB:**

   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a new cluster.
   - Obtain your MongoDB URI and add it to your `.env` file.

6. **Set up Firebase:**

   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project and add a web app.
   - Obtain your Firebase configuration and add it to your `.env` file.
   - Import [realtime-database.json](https://github.com/duyvanmaster/payment-discord-bot/blob/master/realtime-database.json) into realtime database

7. **Set up the payment gateway:**

   - Go to [payOS](https://my.payos.vn) and create a payment gateway.
   - Obtain the required credentials such as `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, and `PAYOS_CHECKSUM_KEY` and add them to your `.env` file.
   - Set the webhook URL to `https://${YOUR_DOMAIN}/payos-webhook`.

## Running the Bot

1. **Start the bot:**

   ```sh
   npm run dev
   ```

2. **Invite the bot to your server using the OAuth2 URL from the Discord Developer Portal.**

## Contact Information

For questions or support, feel free to reach out: [e-z.bio/duyvan](https://e-z.bio/duyvan)
