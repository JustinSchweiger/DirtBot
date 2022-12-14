import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { AppealManager } from '../../helper/manager/AppealManager.js';
import PunishmentAppealModal from './punishment-appeal-modal.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async AppealButtons() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ban-appeal')
                .setLabel('Ban Appeal')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🚫'),
            new ButtonBuilder()
                .setCustomId('mute-appeal')
                .setLabel('Mute Appeal')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔇'),
        );
    },
    async AppealEmbed() {
        const extra = await Extra.get();

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: '__How to use:__',
                    value: '**1.** Click one of the appropriate buttons below to start.' +
                        '\n**2.** Fill out the form that pops up.' +
                        '\n**3.** Hit the "Submit" button.' +
                        '\n**4.** A new appeal channel will be created for you. Click on it.',
                    inline: false,
                },
                {
                    name: '\u200b',
                    value: '**Note**: We\'re all human. Please be respectful and patient and wait for a staff member to respond.',
                    inline: false,
                },
            ])
            .setFooter({ text: 'Please be respectful towards each other!', iconURL: extra['footer-icon'] });
    },
    async execute(interaction) {
        const customId = interaction.customId;

        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        if (interaction.member.roles.cache.get(roles.noAppeals)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You are not allowed to make new appeals!'),
                ],
                ephemeral: true,
            });
        }

        if (customId === 'ban-appeal') {
            if (AppealManager.hasOpenAppeal(interaction.user.id, 'ban')) {
                return interaction.reply({ embeds: [new EmbedBuilder().setColor('#df0000').setDescription('You can only have one open appeal at a time!')], ephemeral: true });
            }

            PunishmentAppealModal.type = 'ban';
            return PunishmentAppealModal.showModal(interaction);
        }

        if (AppealManager.hasOpenAppeal(interaction.user.id, 'mute')) {
            return interaction.reply({ embeds: [new EmbedBuilder().setColor('#df0000').setDescription('You can only have one open appeal at a time!')], ephemeral: true });
        }

        PunishmentAppealModal.type = 'mute';
        return PunishmentAppealModal.showModal(interaction);
    },
};