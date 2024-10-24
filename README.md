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
   cd payment-discord-bot
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Create a `.env` file based on the `.env.example` in the root directory and add your configuration.**

4. **Set up Firebase:**

   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Create a new project.
   - Add a web app to your project.
   - Obtain your Firebase configuration and add it to your `.env` file.
   - Set up Firestore to manage your product and transaction data.

5. **Set up the payment gateway:**

   - Go to [payOS](https://my.payos.vn) to create a payment gateway.
   - Set the webhook URL to `https://${your_domain}/payos-webhook`.

## Running the Bot

1. **Start the bot:**

   ```sh
   npm run dev
   ```

2. **Invite the bot to your server using the OAuth2 URL.**

## Contributing

Feel free to submit issues or pull requests. Contributions are welcome!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
