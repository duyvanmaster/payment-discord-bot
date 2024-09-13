const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require("discord.js");

const completePaymentButton = new ButtonBuilder()
  .setCustomId("complete_payment")
  .setLabel("Hoàn tất thanh toán")
  .setStyle(ButtonStyle.Success);

const cancelPaymentButton = new ButtonBuilder()
  .setCustomId("cancel_payment")
  .setLabel("Hủy thanh toán")
  .setStyle(ButtonStyle.Danger);

const componentRow = new ActionRowBuilder().addComponents(
  completePaymentButton,
  cancelPaymentButton
);

module.exports = componentRow;
