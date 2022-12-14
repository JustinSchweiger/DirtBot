import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Level, Logger } from '../../helper/Logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clear a specified amount of messages in the channel.')
        .setDefaultMemberPermissions(0)
        .addIntegerOption(
            option => option
                .setName('amount')
                .setDescription('The amount of messages to clear.')
                .setRequired(true),
        ),
    extra: {
        hidden: false,
        inHelp: true,
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