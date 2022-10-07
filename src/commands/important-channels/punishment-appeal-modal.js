import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { AppealManager } from '../../helper/manager/AppealManager.js';
import { Minecraft } from '../../helper/Minecraft.js';
import { Database } from '../../helper/VerificationDatabase.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('appeal-modal')
            .setTitle('DirtCraft Punishment Appeal');

        const username = await Database.getUsername(interaction.user.id);

        const userName = new TextInputBuilder()
            .setCustomId('username')
            .setLabel('Username')
            .setPlaceholder('Input your username that has been punished.')
            .setValue(username || '')
            .setStyle(TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(16)
            .setRequired(true);

        const message = new TextInputBuilder()
            .setCustomId('message')
            .setLabel('Why should the punishment be lifted?')
            .setPlaceholder('Please explain why your punishment should be lifted.')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(userName),
            new ActionRowBuilder().addComponents(message),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const username = interaction.fields.getTextInputValue('username');
        const message = interaction.fields.getTextInputValue('message');

        if (!username.match(/^\w+$/)) {
            return interaction.editReply({ content: 'Please enter a valid username.', ephemeral: true });
        }

        let uuid;
        const userIsVerified = interaction.member.roles.cache.has(JSON.parse(readFileSync(resolve('./src/config/roles.json')))['verified']);
        if (!userIsVerified) {
            uuid = await Minecraft.getUUID(username);
        } else {
            uuid = await Database.getUuidFromDiscordId(interaction.user.id);

            if (uuid === 'no-connection') {
                uuid = await Minecraft.getUUID(username);
            }
        }

        if (!uuid) {
            return interaction.editReply({ content: 'Please enter a valid username.', ephemeral: true });
        }

        const extra = Extra.get();
        const newChannel = await AppealManager.createNewAppeal(interaction, username, uuid, message, this.type);
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${(await extra)['bulletpoint']} DirtCraft Appeal System ${(await extra)['bulletpoint']}`)
            .setDescription(`Your appeal (${newChannel}) has been created! Click **[here](${newChannel.url})** to view it.`)
            .setFooter({ text: 'Please be respectful towards each other!', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    },
};