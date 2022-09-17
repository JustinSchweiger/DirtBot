import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';

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
                        '\n**2.** Choose a server from the dropdown menu.' +
                        '\n**3.** Fill out the ticket form.' +
                        '\n**4.** A ticket with a link to it will be created for you. Click on it.' +
                        '\n**5.** A staff member will be with you shortly.',
                    inline: false,
                },
                {
                    name: '\u200b',
                    value: `**Note**: Please only make tickets for issues that only the staff can help you with!\n \nFor small questions, please head over to <#${JSON.parse(readFileSync(resolve('./src/config/channels.json')))['quickSupportChannel']}>`,
                    inline: false,
                },
            ])
            .setFooter({ text: 'Thank you for using our ticket system!', iconURL: extra['footer-icon'] });
    },
    async execute(interaction) {
        const customId = interaction.customId;
        const memberId = interaction.member.id;
        console.log(customId);
        console.log(memberId);
    },
};