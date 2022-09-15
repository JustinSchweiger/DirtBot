const { SlashCommandBuilder } = require('@discordjs/builders');
const { Logger, Level } = require('../helper/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a specified amount of messages in the channel.')
        .addIntegerOption(
            option => option
                .setName('amount')
                .setDescription('The amount of messages to clear.')
                .setRequired(true),
        ),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        if (amount < 1) {
            await interaction.reply({ content: 'You need to specify a number greater than 0.', ephemeral: true });
            return;
        }

        if (amount > 100) {
            await interaction.reply({ content: 'You can only delete up to 100 messages at a time.', ephemeral: true });
            return;
        }

        await Logger.log(`${interaction.user} has cleared **${amount}** messages in ${interaction.channel}.`, Level.WARNING);
        await interaction.channel.bulkDelete(amount);
        await interaction.reply({ content: `Cleared ${amount} messages.`, ephemeral: true });
    },
};