import { SlashCommandBuilder } from '@discordjs/builders';
import { TicketManager } from '../../helper/manager/TicketManager.js';
import { Minecraft } from '../../helper/Minecraft.js';

export default {
    data: new SlashCommandBuilder()
        .setName('username')
        .setDescription('Changes the username of a ticket.')
        .setDefaultMemberPermissions(0)
        .addStringOption(
            option => option
                .setName('username')
                .setDescription('The username of the player.')
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
        const newUsername = interaction.options.getString('username');

        const uuid = await Minecraft.getUUID(newUsername);

        if (!uuid) {
            await interaction.editReply({ content: 'The username you entered is invalid!', ephemeral: true });
            return;
        }

        await interaction.editReply({ content: `Changed username to \`${newUsername}\`!`, ephemeral: true });

        await TicketManager.changeUsername(newUsername, uuid, channel, interaction.member.user);
    },
};