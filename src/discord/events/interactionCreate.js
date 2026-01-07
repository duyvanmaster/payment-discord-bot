const { InteractionType } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
                }
            }
        } else if (interaction.isStringSelectMenu() || interaction.isButton()) {
            try {
                // Handle legitvn select menus
                if (interaction.customId === 'select_product' ||
                    interaction.customId === 'select_sub_product' ||
                    interaction.customId === 'select_sub_sub_product' ||
                    interaction.customId === 'select_voucher_code') {
                    const command = interaction.client.commands.get('legitvn');
                    if (command && command.handleInteraction) {
                        await command.handleInteraction(interaction);
                    }
                }
                // Handle sendmessagefile button
                else if (interaction.customId === 'sendmessagefile_button' ||
                    interaction.customId === 'sendmessagefile_confirm' ||
                    interaction.customId === 'sendmessagefile_cancel') {
                    const command = interaction.client.commands.get('sendmessage_file');
                    if (command && command.handleButton) {
                        await command.handleButton(interaction);
                    }
                }
                // Handle voucher application buttons
                else if (interaction.customId === 'apply_voucher_button' ||
                    interaction.customId === 'skip_voucher_button') {
                    const command = interaction.client.commands.get('legitvn');
                    if (command && command.handleVoucherButton) {
                        await command.handleVoucherButton(interaction);
                    }
                }
                // Handle createvoucher buttons
                else if (interaction.customId === 'upload_voucher_users' ||
                    interaction.customId === 'skip_voucher_distribution') {
                    const command = interaction.client.commands.get('createvoucher');
                    if (command && command.handleButton) {
                        await command.handleButton(interaction);
                    }
                }
                // Handle managevouchers interactions
                else if (interaction.customId.startsWith('manage_')) {
                    const command = interaction.client.commands.get('managevouchers');
                    if (command && command.handleInteraction) {
                        await command.handleInteraction(interaction);
                    }
                }
            } catch (error) {
                console.error('Error handling component interaction:', error);
                try {
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Đã xảy ra lỗi khi xử lý yêu cầu!', ephemeral: true });
                    } else {
                        await interaction.followUp({ content: 'Đã xảy ra lỗi khi xử lý yêu cầu!', ephemeral: true });
                    }
                } catch (e) {
                    console.error('Error sending error message:', e);
                }
            }
        } else if (interaction.isModalSubmit()) {
            try {
                if (interaction.customId === 'sendmessagefile_modal') {
                    const command = interaction.client.commands.get('sendmessage_file');
                    if (command && command.handleModal) {
                        await command.handleModal(interaction);
                    }
                }
                // Handle createvoucher modal
                else if (interaction.customId === 'createvoucher_modal') {
                    const command = interaction.client.commands.get('createvoucher');
                    if (command && command.handleModal) {
                        await command.handleModal(interaction);
                    }
                }
                // Handle voucher code modal
                else if (interaction.customId === 'voucher_code_modal') {
                    const command = interaction.client.commands.get('legitvn');
                    if (command && command.handleVoucherModal) {
                        await command.handleVoucherModal(interaction);
                    }
                }
            } catch (error) {
                console.error('Error handling modal interaction:', error);
                try {
                    if (!interaction.replied && !interaction.deferred) {
                        await interaction.reply({ content: 'Đã xảy ra lỗi khi xử lý modal!', ephemeral: true });
                    } else {
                        await interaction.followUp({ content: 'Đã xảy ra lỗi khi xử lý modal!', ephemeral: true });
                    }
                } catch (e) {
                    console.error('Error sending error message:', e);
                }
            }
        }
    },
};
