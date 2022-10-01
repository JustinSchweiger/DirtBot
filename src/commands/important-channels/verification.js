import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { Extra } from '../../helper/Extra.js';
import { Database as VerificationDatabase } from '../../helper/VerificationDatabase.js';

export default {
    extra: {
        hidden: true,
    },
    async VerificationButton() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verification-button')
                .setLabel('Verify')
                .setEmoji('✅')
                .setStyle(ButtonStyle.Secondary),
        );
    },
    async VerificationEmbed() {
        const extra = await Extra.get();

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Verification ${extra['bulletpoint']}`)
            .setDescription('Click the ✅ button below to link your Discord & Minecraft account.')
            .setFooter({ text: 'Message an Admin if there are any problems.', iconURL: extra['footer-icon'] });
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const username = await VerificationDatabase.getUsername(interaction.user.id);

        if (username) {
            const embed = new EmbedBuilder()
                .setColor('#df0000')
                .setDescription(`Your Discord Account is already linked to **${username}**!\nUse \`/unverify\` in any channel to unlink your account.`)
                .setFooter({ text: 'Message an Admin if there are any problems.', iconURL: extra['footer-icon'] });
            await interaction.editReply({
                embeds: [embed],
                ephemeral: true,
            });
            return;
        }

        const activeCode = await VerificationDatabase.hasUnusedCode(interaction.user.id);
        const extra = await Extra.get();
        if (activeCode) {
            const embed = new EmbedBuilder()
                .setColor('#df0000')
                .setDescription(`You already have an unused verification code!\nUse **/verify ${activeCode}** to verify your account.`)
                .setFooter({ text: 'Message an Admin if there are any problems.', iconURL: extra['footer-icon'] });
            await interaction.editReply({
                embeds: [embed],
                ephemeral: true,
            });
            return;
        }

        const randomHexCode = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
        const newCode = randomHexCode(6);

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setDescription(`Please enter **/verify ${newCode}** on any of our servers.`)
            .setFooter({ text: 'Message an Admin if there are any problems.', iconURL: extra['footer-icon'] });

        await interaction.editReply({ embeds: [embed], ephemeral: true });

        await VerificationDatabase.insertVerificationCode(interaction.user.id, newCode);
    },
};