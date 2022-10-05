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
        if (!await VerificationDatabase.hasUser(interaction.user.id)) {
            await interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#df0000').setDescription('Your Discord Account is not linked to any Minecraft Account!')],
            });
            return;
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor('#df0000').setDescription('Your Discord Account has been unlinked from your Minecraft Account.')],
        });

        await VerificationDatabase.unlinkUser(interaction.user.id);

        const verifiedRole = JSON.parse(readFileSync(resolve('./src/config/roles.json'))).verified;
        await interaction.guild.members.fetch(interaction.user.id).then(member => {
            member.roles.remove(verifiedRole);
        });
    },
};