import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import DevAppModal from './dev-app-modal.js';
import StaffAppModal from './staff-app-modal.js';

export default {
    extra: {
        hidden: true,
        inHelp: false,
    },
    async ApplicationButtons() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('staff-app')
                .setLabel('Staff Application')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji((await Extra.get())['staff-emoji']),
            new ButtonBuilder()
                .setCustomId('dev-app')
                .setLabel('Developer Application')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji((await Extra.get())['dev-emoji']),
        );
    },
    async ApplicationEmbed() {
        const extra = await Extra.get();

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Applications ${extra['bulletpoint']}`)
            .setThumbnail(extra['footer-icon'])
            .addFields([
                {
                    name: '__**Application Rules:**__',
                    value: '**1.** Do not make multiple applications at once!\n' +
                        '**2.** If your application has been denied once, please wait for **1 month** before making a new one!\n' +
                        '**3.** Do not ask staff members about your application! This will get it denied pretty quickly!',
                    inline: false,
                },
                {
                    name: '__**What we want to see:**__',
                    value: '**1.** Patience! Your app will be discussed in private by the admins. You will be informed afterwards!\n' +
                        '**2.** Age of **16** and over! (There are exceptions if you behave in a mature manner!)\n' +
                        '**3.** You providing all the required information in the modal and asking any further questions from staff!\n' +
                        '**4.** Be helpful in-game. You need to actually assist people, so we can determine how useful you are.',
                    inline: false,
                },
                {
                    name: '__**What will get your rejected:**__',
                    value: '**1.** Major sanctions within last 1-2 months.\n' +
                        '**2.** Being banned from staff / the server.\n' +
                        '**3.** Spamming applications within a short amount of time. (Please wait for **1 month** before making a new one)\n' +
                        '**4.** Asking staff members about your application.',
                    inline: false,
                },
                {
                    name: '__**What happens after I get accepted?**__',
                    value: 'If you get accepted, you will be set up as a helper and be invited to the staff discord.\n' +
                        'When you are a helper you are basically expected to help out in chat, issue minor sanctions to rule breakers, moderate chat and assist in tickets.\n' +
                        'Further commitment to the server will generally earn you a promotion to moderator, then eventually admin, if there is space.',
                    inline: false,
                },
            ]);
    },
    async execute(interaction) {
        const customId = interaction.customId;

        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        if (interaction.member.roles.cache.get(roles.noApplications)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#df0000')
                        .setDescription('You are not allowed to make new applications!'),
                ],
                ephemeral: true,
            });
        }

        if (customId === 'staff-app') {
            await StaffAppModal.showModal(interaction);
        } else if (customId === 'dev-app') {
            await DevAppModal.showModal(interaction);
        }
    },
};