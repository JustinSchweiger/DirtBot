import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('announcement-modal')
            .setTitle('New Announcement');

        const title = new TextInputBuilder()
            .setCustomId('title')
            .setLabel('Title')
            .setPlaceholder('Give the announcement a title.')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const image = new TextInputBuilder()
            .setCustomId('image')
            .setLabel('Image')
            .setPlaceholder('The image will be not be shown in the preview!')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const announcement = new TextInputBuilder()
            .setCustomId('announcement')
            .setLabel('Announcement')
            .setPlaceholder('Supports markdown and \\n for new lines.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        const footer = new TextInputBuilder()
            .setCustomId('footer')
            .setLabel('Footer')
            .setPlaceholder('The small text below the announcement.')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1000)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(title),
            new ActionRowBuilder().addComponents(image),
            new ActionRowBuilder().addComponents(announcement),
            new ActionRowBuilder().addComponents(footer),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        const title = interaction.fields.getTextInputValue('title');
        const announcement = interaction.fields.getTextInputValue('announcement');
        const image = interaction.fields.getTextInputValue('image') || undefined;
        const footer = interaction.fields.getTextInputValue('footer') || ' ';
        const extra = await Extra.get();
        const preview = this.preview;
        const role = this.role || '';

        if (preview) {
            await interaction.deferReply({ ephemeral: true });

            const embed = new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(title)
                .setAuthor({
                    name: interaction.member.nickname || interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setDescription(announcement)
                .setFooter({ text: footer, iconURL: extra['footer-icon'] })
                .setTimestamp();

            await interaction.editReply({
                content: role.toString(),
                embeds: [embed],
            });
            return;
        }

        await interaction.deferUpdate();

        const announcementChannel = interaction.guild.channels.cache.get(JSON.parse(readFileSync(resolve('./src/config/channels.json')))['announcementChannel']);

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(title)
            .setAuthor({
                name: interaction.member.nickname || interaction.user.username,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(announcement)
            .setFooter({ text: footer, iconURL: extra['footer-icon'] })
            .setTimestamp();

        await announcementChannel.send({
            content: role.toString(),
            embeds: [embed],
        });

        await announcementChannel.send({
            files: [image].filter(Boolean),
        });
    },
};