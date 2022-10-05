import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ApplicationManager } from '../../helper/ApplicationManager.js';
import { Extra } from '../../helper/Extra.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('accept-application-modal')
            .setTitle('Accept Application');

        const inviteLink = new TextInputBuilder()
            .setCustomId('accept-application-invite')
            .setLabel('Invite Link')
            .setPlaceholder('https://discord.gg/########')
            .setStyle(TextInputStyle.Short)
            .setMinLength(27)
            .setMaxLength(27)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(inviteLink),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const invite = interaction.fields.getTextInputValue('accept-application-invite');

        const application = JSON.parse(readFileSync(resolve(`./applications/${interaction.channel.id}.json`)));
        await ApplicationManager.silentClose(interaction, channel);
        await ApplicationManager.logApplicationChange('accepted', undefined, interaction.user, channel);
        const extra = await Extra.get();

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Applications ${extra['bulletpoint']}`)
            .setDescription(`**Congratulations!** Your application has been accepted!\n\nPlease use the following link to join our Staff Server: ${invite}\n\nPlease make sure to read the rules and follow them at all times! You will be representing the whole network now!\n\nIf you have any questions, please contact a staff member.`)
            .setFooter({
                text: 'DirtCraft Application System',
                iconURL: extra['footer-icon'],
            }).setTimestamp();

        if (application.type === 'staff') {
            embed.setThumbnail(extra['staff-thumbnail']);
        } else {
            embed.setThumbnail(extra['dev-thumbnail']);
        }

        interaction.guild.members.cache.get(application.userId).send({
            embeds: [embed],
        });
    },
};