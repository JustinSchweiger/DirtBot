import { SlashCommandBuilder } from '@discordjs/builders';
import { TicketManager } from '../../helper/manager/TicketManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('silentclose')
        .setDescription('Silently closes a ticket without notifying the author')
        .setDefaultMemberPermissions(0),
    extra: {
        hidden: false,
        inHelp: true,
        ticketCommand: true,
    },
    async execute(interaction) {
        if (!await TicketManager.hasPermsAndIsTicket(interaction, false)) return;

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        await TicketManager.silentClose(channel, interaction.member.user);
    },
};