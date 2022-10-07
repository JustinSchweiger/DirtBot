import { createTranscript } from 'discord-html-transcripts';
import { ActionRowBuilder, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { AppealManager } from '../../helper/manager/AppealManager.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async showModal(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('deny-appeal-modal')
            .setTitle('Deny Appeal');

        const message = new TextInputBuilder()
            .setCustomId('deny-appeal-reason')
            .setLabel('Reason')
            .setPlaceholder('The reason why this appeal has been denied')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(300)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(message),
        );

        await interaction.showModal(modal);
    },
    async execute(interaction) {
        await interaction.deferUpdate();
        const channel = interaction.guild.channels.cache.get(interaction.channel.id);
        const reason = interaction.fields.getTextInputValue('deny-appeal-reason');
        const appeal = JSON.parse(readFileSync(resolve(`./appeals/${channel.id}.json`)));

        const transcriptChannel = channel.guild.channels.cache.get(JSON.parse(readFileSync(resolve('./src/config/channels.json'))).transcriptsChannel);

        const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: 'string',
            minify: true,
            saveImages: true,
            useCDN: true,
        });

        const transcriptEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setDescription(`[**Appeal #${channel.name}**](${process.env.FRONTEND_URL}/?transcript=${appeal.appealUUID}) closed by ${interaction.user}`)
            .setTimestamp();

        transcriptChannel.send({ embeds: [transcriptEmbed] });
        channel.delete();

        writeFileSync(resolve(`./transcripts/${appeal.appealUUID}.html`), transcript);
        unlinkSync(resolve(`./appeals/${channel.id}.json`));

        const extra = await Extra.get();
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
            .setDescription(`Your appeal has been **denied** by ${interaction.user} with the following reason:\n\`\`\`${reason}\`\`\`\nYou may appeal again at a later date!`)
            .setFooter({
                text: 'DirtCraft Appeal System',
                iconURL: extra['footer-icon'],
            }).setTimestamp();

        const author = interaction.guild.members.cache.get(appeal.userDiscordId);
        if (author) {
            author.send({
                embeds: [embed],
            });
        }

        const appealLogEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Appeal System ${extra['bulletpoint']}`)
            .setDescription(`Appeal #${channel.name} **denied** by ${interaction.user} with the following reason:\n\`\`\`${reason}\`\`\``)
            .addFields([
                {
                    name: '__**Appeal Information:**__',
                    value: `**Appeal Channel:** ${channel}\n` +
                        `**Action completed by:** ${interaction.user}`,
                    inline: false,
                },
            ]).setTimestamp();

        await AppealManager.logAppealEmbed(appealLogEmbed);
    },
};