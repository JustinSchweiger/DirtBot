import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TicketManager } from '../../helper/TicketManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a user from a ticket')
        .addUserOption(
            option => option
                .setName('player')
                .setDescription('The player to remove')
                .setRequired(true),
        ),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        await TicketManager.hasPermsAndIsTicket(interaction, true);

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const playerToRemove = interaction.options.getUser('player');

        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        if (!ticket.users.includes(playerToRemove.id)) {
            return interaction.editReply({ content: 'This player is not in the ticket!', ephemeral: true });
        }

        if (ticket.author === playerToRemove.id) {
            return interaction.editReply({ content: 'You can\'t remove the author of the ticket!', ephemeral: true });
        }

        await interaction.editReply({ content: `Successfully removed ${playerToRemove} from the ticket!`, ephemeral: true });

        await TicketManager.removePlayer(playerToRemove, channel, interaction.member.user);
    },
};