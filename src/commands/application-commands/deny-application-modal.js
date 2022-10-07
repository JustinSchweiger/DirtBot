import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { ApplicationManager } from '../../helper/manager/ApplicationManager.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('deny-application-modal')
            .setTitle('Deny Application');

        const reason = new TextInputBuilder()
            .setCustomId('deny-application-modal-reason')
            .setLabel('Reason')
            .setPlaceholder('The reason this application is being denied. This will be sent to the applicant.')
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reason),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const reason = interaction.fields.getTextInputValue('deny-application-modal-reason');

        const application = JSON.parse(readFileSync(resolve(`./applications/${interaction.channel.id}.json`)));
        await ApplicationManager.silentClose(interaction, channel);
        await ApplicationManager.logApplicationChange('denied', reason, interaction.user, channel);
        const extra = await Extra.get();

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Applications ${extra['bulletpoint']}`)
            .setDescription(`Hello <@${application.userId}>,\n\nUnfortunately your application has been denied for the following reason:\`\`\`${reason}\`\`\`\nPlease wait at least **30 days** before reapplying!`)
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