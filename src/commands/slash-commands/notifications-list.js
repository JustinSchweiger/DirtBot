import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { File } from '../../helper/GetFileFromGitlab.js';

export default {
    data: new SlashCommandBuilder()
        .setName('notifications-list')
        .setDescription('Lists someones ticket notifications.')
        .addUserOption(
            option => option
                .setName('target')
                .setDescription('The user to list ticket notifications for.')
                .setRequired(true),
        ),
    extra: {
        hidden: false,
        hasChoices: false,
        inHelp: true,
    },
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const extra = await Extra.get();
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));

        const enabled = [];
        for (const ticketNotification of ticketNotifications) {
            const fileContent = JSON.parse(readFileSync(resolve(`./ticket-notifications/${ticketNotification['short']}.json`)).toString());
            if (fileContent.includes(target.id)) {
                enabled.push({
                    name: ticketNotification['name'],
                    emoji: `<:${ticketNotification['emoji']['name']}:${ticketNotification['emoji']['id']}>`,
                });
            }
        }

        if (enabled.length === 0) {
            interaction.reply({
                content: `${extra['bulletpoint']} ${target} in not subscribed to any notifications.`,
                ephemeral: true,
            });
            return;
        }

        const list = [
            {
                name: '__**Enabled Notifications**__',
                value: enabled.map(notification => `${notification['emoji']} ${notification['name']}`).join('\n'),
                inline: true,
            },
        ];

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} Ticket Notifications ${extra['bulletpoint']}`)
            .setDescription(`Ticket notifications for ${target}`)
            .addFields(list)
            .setFooter({
                text: 'Use the notifications-add or notifications-remove command to add/remove notifications!',
                iconURL: extra['footer-icon'],
            });

        interaction.reply({ embeds: [embed], ephemeral: true });
    },
};