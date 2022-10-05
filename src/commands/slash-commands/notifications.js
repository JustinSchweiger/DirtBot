import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { File } from '../../helper/GetFileFromGitlab.js';

export default {
    async getChoices() {
        return [
            {
                name: 'notification',
                choices: JSON.parse(await File.get('ticket-notifications.json')).map(ticketNotification => {
                    return {
                        name: ticketNotification['name'],
                        value: ticketNotification['short'],
                    };
                }),
            },
        ];
    },
    data: new SlashCommandBuilder()
        .setName('notifications')
        .setDescription('Lists, adds, or removes ticket notifications.')
        .addSubcommand(
            subcommand => subcommand
                .setName('list')
                .setDescription('Lists all ticket notifications of a user.')
                .addUserOption(option => option.setName('target').setDescription('The user to list ticket notifications for.').setRequired(true)),
        ).addSubcommand(
            subcommand => subcommand
                .setName('add')
                .setDescription('Adds a ticket notification for a user.')
                .addUserOption(
                    option => option
                        .setName('target')
                        .setDescription('The user to add a ticket notification for.')
                        .setRequired(true),
                ).addStringOption(
                    option => option
                        .setName('notification')
                        .setDescription('The notification to add.')
                        .setRequired(true)
                        .addChoices({ name: 'notification', value: 'notification' }),
                ),
        ).addSubcommand(
            subcommand => subcommand
                .setName('remove')
                .setDescription('Removes a ticket notification from a user.')
                .addUserOption(
                    option => option
                        .setName('target')
                        .setDescription('The user to remove a ticket notification from.')
                        .setRequired(true),
                ).addStringOption(
                    option => option
                        .setName('notification')
                        .setDescription('The notification to remove.')
                        .setRequired(true)
                        .addChoices({ name: 'notification', value: 'notification' }),
                ),
        ),
    extra: {
        hidden: false,
        hasChoices: true,
        inHelp: true,
    },
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const target = interaction.options.getUser('target');
        const extra = await Extra.get();
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));

        const enabled = [];
        if (subcommand === 'list') {
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
                interaction.reply({ content: `${extra['bulletpoint']} ${target} has no ticket notifications enabled.`, ephemeral: true });
                return;
            }

            const list = [
                {
                    name: '__Enabled Notifications__',
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
                    text: 'Use the add or remove subcommand to add/remove notifications!',
                    iconURL: extra['footer-icon'],
                });

            interaction.reply({ embeds: [embed], ephemeral: true });
        } else if (subcommand === 'add') {
            const notification = interaction.options.getString('notification');
            const ticketNotification = ticketNotifications.find(notif => notif['short'] === notification);
            const fileContent = JSON.parse(readFileSync(resolve(`./ticket-notifications/${notification}.json`)).toString());
            if (fileContent.includes(target.id)) {
                interaction.reply({ content: 'This user already has this notification enabled!', ephemeral: true });
            } else {
                fileContent.push(target.id);
                const embed = new EmbedBuilder()
                    .setColor('#df0000')
                    .setTitle(`${extra['bulletpoint']} Notification Added ${extra['bulletpoint']}`)
                    .setDescription(`Successfully added <:${ticketNotification['emoji']['name']}:${ticketNotification['emoji']['id']}> ${ticketNotification['name']} to ${target}`)
                    .setFooter({
                        text: 'Use the add or remove subcommand to add/remove notifications!',
                        iconURL: extra['footer-icon'],
                    });
                interaction.reply({ embeds: [embed], ephemeral: true });
                writeFileSync(resolve(`./ticket-notifications/${notification}.json`), JSON.stringify(fileContent));
            }
        } else if (subcommand === 'remove') {
            const notification = interaction.options.getString('notification');
            const ticketNotification = ticketNotifications.find(notif => notif['short'] === notification);
            const fileContent = JSON.parse(readFileSync(resolve(`./ticket-notifications/${notification}.json`)).toString());
            if (fileContent.includes(target.id)) {
                fileContent.splice(fileContent.indexOf(target.id), 1);

                const embed = new EmbedBuilder()
                    .setColor('#df0000')
                    .setTitle(`${extra['bulletpoint']} Notification Removed ${extra['bulletpoint']}`)
                    .setDescription(`Successfully removed <:${ticketNotification['emoji']['name']}:${ticketNotification['emoji']['id']}> ${ticketNotification['name']} from ${target}`)
                    .setFooter({
                        text: 'Use the add or remove subcommand to add/remove notifications!',
                        iconURL: extra['footer-icon'],
                    });
                interaction.reply({ embeds: [embed], ephemeral: true });
                writeFileSync(resolve(`./ticket-notifications/${notification}.json`), JSON.stringify(fileContent));
            } else {
                interaction.reply({ content: 'This user does not have this notification enabled!', ephemeral: true });
            }
        }
    },
};