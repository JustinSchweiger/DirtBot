import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Database as VerificationDatabase } from '../../helper/VerificationDatabase.js';

export default {
    data: new SlashCommandBuilder()
        .setName('unverify')
        .setDescription('Unlink your Discord & Minecraft account.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        await interaction.deferReply();
        const hasUser = await VerificationDatabase.hasUser(interaction.user.id);
        if (hasUser === 'no-connection') {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#df0000').setDescription('The verification database can\'t be reached! Please try again later!')],
            });
        } else if (!hasUser) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#df0000').setDescription('Your Discord Account is not linked to any Minecraft Account!')],
            });
        }

        const success = await VerificationDatabase.unlinkUser(interaction.user.id);

        if (!success) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#df0000').setDescription('The unlinking process failed! Please try again later!')],
            });
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor('#df0000').setDescription('Your Discord Account has been unlinked from your Minecraft Account.')],
        });

        const verifiedRole = JSON.parse(readFileSync(resolve('./src/config/roles.json'))).verified;
        await interaction.guild.members.fetch(interaction.user.id).then(member => {
            member.roles.remove(verifiedRole);
        });
    },
};