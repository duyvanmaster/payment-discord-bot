# Payment Discord Bot

Welcome to the Payment Discord Bot project! This bot is designed to help manage and facilitate payments within your Discord server.

## Features

- Display product information
- Process payments
- Track transaction history
- Notify users of payment status

## Configuration

1. Clone the repository.

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file base on the `.env.example` in the root directory and add your configuration.

4. Go to [payOS](https://my.payos.vn) to create a payment gateway and set webhook URL is `https://${your_domain}/payos-webhook`.

## Running the Bot

1. Start the bot:

   ```sh
   npm run dev
   ```

2. Invite the bot to your server using the OAuth2 URL.

## Contributing

Feel free to submit issues or pull requests. Contributions are welcome!
