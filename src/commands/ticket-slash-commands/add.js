import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TicketManager } from '../../helper/TicketManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds a player to a ticket')
        .setDefaultMemberPermissions(0)
        .addUserOption(
            option => option
                .setName('player')
                .setDescription('The player to add to the ticket')
                .setRequired(true),
        ),
    extra: {
        hidden: false,
        inHelp: true,
        ticketCommand: true,
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (!await TicketManager.hasPermsAndIsTicket(interaction, true)) return;

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const playerToAdd = interaction.options.getUser('player');

        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        if (ticket.users.includes(playerToAdd.id)) {
            return interaction.editReply({ content: 'This player is already in the ticket!', ephemeral: true });
        }

        if (playerToAdd.bot) {
            return interaction.editReply({ content: 'You cannot add a bot to a ticket!', ephemeral: true });
        }

        await interaction.editReply({ content: `Successfully added ${playerToAdd} to the ticket!`, ephemeral: true });

        await TicketManager.addPlayer(playerToAdd, channel, interaction.member.user);
    },
};