import { SlashCommandBuilder } from '@discordjs/builders';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TicketManager } from '../../helper/TicketManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('Renames a ticket.')
        .addStringOption(
            option => option
                .setName('name')
                .setDescription('The new name of the ticket. You dont have to add the ticket number!')
                .setRequired(true),
        ),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        if (!await TicketManager.hasPermsAndIsTicket(interaction, true)) return;

        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${interaction.channel.id}.json`)));
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const newName = interaction.options.getString('name').replaceAll(' ', '-') + '-' + ticket.ticketId;

        await interaction.editReply({ content: `Renamed ticket to ${newName}!`, ephemeral: true });

        await TicketManager.renameTicket(newName, channel, interaction.member.user);
    },
};