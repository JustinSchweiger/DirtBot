import { SlashCommandBuilder } from '@discordjs/builders';
import { TicketManager } from '../../helper/TicketManager.js';

export default {
    data: new SlashCommandBuilder()
        .setName('silentclose')
        .setDescription('Silently closes a ticket without notifying the author'),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        if (!await TicketManager.hasPermsAndIsTicket(interaction, false)) return;

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);

        await TicketManager.silentClose(channel, interaction.member.user);
    },
};