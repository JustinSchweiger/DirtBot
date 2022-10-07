import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Minecraft } from '../../helper/Minecraft.js';
import { Database as VerificationDatabase } from '../../helper/VerificationDatabase.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify a user manually if discord-link fails.')
        .setDefaultMemberPermissions(0)
        .addUserOption(
            option => option
                .setName('user')
                .setDescription('The user to verify.')
                .setRequired(true),
        ).addStringOption(
            option => option
                .setName('username')
                .setDescription('The username of the minecraft account of the user.')
                .setMinLength(3)
                .setMaxLength(16)
                .setRequired(true),
        ),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        await interaction.deferReply();
        const username = interaction.options.getString('username');
        const user = interaction.options.getUser('user');

        const uuid = await Minecraft.getUUID(username);

        if (!uuid) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#df0000').setDescription('Invalid username.')],
            });
        }

        const success = await VerificationDatabase.linkUser(user.id, uuid);

        if (!success) {
            return interaction.editReply({
                embeds: [new EmbedBuilder().setColor('#df0000').setDescription('The verification database is currently not available. Please try again later.')],
            });
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor('#df0000').setDescription(`<@${user.id}> has been linked to username **${username}**.`)],
        });

        const verifiedRole = JSON.parse(readFileSync(resolve('./src/config/roles.json'))).verified;
        await interaction.guild.members.fetch(user.id).then(member => {
            member.roles.add(verifiedRole);
        });
    },
};