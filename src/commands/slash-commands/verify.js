import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import minecraftPlayer from 'minecraft-player';
import { resolve } from 'path';
import { Database as VerificationDatabase } from '../../helper/VerificationDatabase.js';

export default {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('Verify a user manually if discord-link fails.')
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

        const uuid = await minecraftPlayer(username).catch(() => {
            return undefined;
        });

        if (!uuid) {
            await interaction.editReply({
                content: 'Invalid username.',
            });
            return;
        }

        await interaction.editReply({
            embeds: [new EmbedBuilder().setColor('#df0000').setDescription(`<@${user.id}> has been linked to username **${username}**.`)],
        });

        await VerificationDatabase.linkUser(user.id, uuid.uuid);

        const verifiedRole = JSON.parse(readFileSync(resolve('./src/config/roles.json'))).verified;
        await interaction.guild.members.fetch(user.id).then(member => {
            member.roles.add(verifiedRole);
        });
    },
};