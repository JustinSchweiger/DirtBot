import { ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ApplicationManager } from '../../helper/ApplicationManager.js';
import { Extra } from '../../helper/Extra.js';

export default {
    extra: {
        hidden: false,
        inHelp: false,
    },
    GetButton() {
        return new ButtonBuilder()
                .setCustomId('no-longer-staff')
                .setLabel('I am not longer interested in becoming staff!')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('❌');
    },
    async execute(interaction) {
        if (!await ApplicationManager.isApplication(interaction)) return;
        const application = JSON.parse(readFileSync(resolve(`./applications/${interaction.channel.id}.json`)));

        if (interaction.user.id !== application.userId) {
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription(`Only <@${application.userId}> can close the application this way!\n\nPlease use the buttons on the embed to accept/deny the application.`),
                ],
                ephemeral: true,
            });
            return;
        }

        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        await ApplicationManager.silentClose(interaction, channel);
        await ApplicationManager.logApplicationChange('closed', undefined, interaction.user, channel);

        const applicationChannel = JSON.parse(readFileSync(resolve('./src/config/channels.json')))['applicationChannel'];
        const extra = await Extra.get();

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Applications ${extra['bulletpoint']}`)
            .setDescription(`The application has been closed on **your** behalf.\n\nIf you ever feel like you want to reapply, you can do so by making another application in <#${applicationChannel}>`)
            .setFooter({
                text: 'DirtCraft Application System',
                iconURL: extra['footer-icon'],
            }).setTimestamp();

        if (application.type === 'staff') {
            embed.setThumbnail(extra['staff-thumbnail']);
        } else {
            embed.setThumbnail(extra['dev-thumbnail']);
        }

        interaction.user.send({
            embeds: [embed],
        });
    },
};