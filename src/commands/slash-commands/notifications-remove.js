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
        .setName('notifications-remove')
        .setDescription('Removes ticket notifications from someone.')
        .setDefaultMemberPermissions(0)
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
    extra: {
        hidden: false,
        hasChoices: true,
        inHelp: true,
    },
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const notification = interaction.options.getString('notification');

        const extra = await Extra.get();
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
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
    },
};