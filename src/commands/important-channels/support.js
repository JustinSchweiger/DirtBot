import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import TicketModal from './support-modal.js';

export default {
    extra: {
        hidden: true,
    },
    async TicketButton() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ticket')
                .setLabel('Create Ticket')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji((await Extra.get())['ticket']),
        );
    },
    async TicketEmbed() {
        const extra = await Extra.get();

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Ticket System ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: '__How to use:__',
                    value: '**1.** Click on the button below. ' +
                        '\n**2.** Fill out the form that pops up.' +
                        '\n**3.** Hit the "Submit" button.' +
                        '\n**4.** A ticket with a link to it will be created for you. Click on it.' +
                        '\n**5.** A staff member will be with you shortly.',
                    inline: false,
                },
                {
                    name: '\u200b',
                    value: '**Note 1**: The form does not support images right now. Either use **[Imgur](https://imgur.com/)** and paste the link or just paste your image after the ticket has been created.',
                    inline: false,
                },
                {
                    name: '\u200b',
                    value: `**Note 2**: Please only make tickets for issues that can only be resolved by staff!\nFor small questions, please head over to <#${JSON.parse(readFileSync(resolve('./src/config/channels.json')))['quickSupportChannel']}>`,
                    inline: false,
                },
            ])
            .setFooter({ text: 'Thank you for using our ticket system!', iconURL: extra['footer-icon'] });
    },
    async execute(interaction) {
        await TicketModal.showModal(interaction);
    },
};