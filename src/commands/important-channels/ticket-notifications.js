const { ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { File } = require('../../helper/GetFileFromGitlab');
const { TicketNotificationFiles } = require('../../helper/TicketNotificationFiles');
const { readFileSync, writeFileSync } = require('fs');
const path = require('path');
const { Extra } = require('../../helper/Extra');

module.exports = {
    extra: {
        hidden: true,
    },
    async TicketNotificationsButtons(ticketNotifications) {
        const buttons = ticketNotifications.map((ticketNotification) => {
            return new ButtonBuilder()
                .setCustomId(`ticket-notification-${ticketNotification['short']}`)
                .setLabel(ticketNotification['name'])
                .setStyle(ButtonStyle.Secondary)
                .setEmoji({
                    name: ticketNotification['emoji']['name'],
                    id: ticketNotification['emoji']['id'],
                });
        });

        const actionRows = [];
        for (let i = 0; i < buttons.length; i += 5) {
            actionRows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
        }

        return actionRows;
    },
    async TicketNotificationsEmbed() {
        const extra = await Extra.get();

        return new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Ticket Notifications ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: '\u200b',
                    value: 'Click on the button below to get pinged when a ticket is created for that server.',
                    inline: false,
                },
                {
                    name: '\u200b',
                    value: `<@&${JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'config', 'roles.json'))).admin}> users will also get pinged when the ticket is set to admin level!`,
                    inline: false,
                },
            ])
            .setFooter({ text: 'To unsubscribe just select the server again.', iconURL: extra['footer-icon'] })
            .setTimestamp();
    },
    async execute(interaction) {
        const filePath = path.join(__dirname, '..', '..', '..', 'ticket-notifications');
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        await TicketNotificationFiles.serve(ticketNotifications);

        const customId = interaction.customId.replace('ticket-notification-', '');
        const memberId = interaction.member.id;

        let added = undefined;

        const file = JSON.parse(readFileSync(`${filePath}/${customId}.json`, 'utf8'));
        if (file.includes(memberId)) {
            file.splice(file.indexOf(memberId), 1);
        } else {
            file.push(memberId);
            added = customId;
        }

        writeFileSync(`${filePath}/${customId}.json`, JSON.stringify(file, null, 2));

        const extra = await Extra.get();

        if (added) {
            const addedEmbed = new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} Added ${extra['bulletpoint']}`)
                .setDescription(`<:${ticketNotifications.find(ticketNotification => ticketNotification['short'] === customId)['emoji']['name']}:${ticketNotifications.find(ticketNotification => ticketNotification['short'] === customId)['emoji']['id']}> **${ticketNotifications.find(ticketNotification => ticketNotification['short'] === customId)['name']}**`)
                .setTimestamp();
            await interaction.reply({ embeds: [addedEmbed], ephemeral: true });
            return;
        }

        const removedEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} Removed ${extra['bulletpoint']}`)
            .setDescription(`<:${ticketNotifications.find(ticketNotification => ticketNotification['short'] === customId)['emoji']['name']}:${ticketNotifications.find(ticketNotification => ticketNotification['short'] === customId)['emoji']['id']}> **${ticketNotifications.find(ticketNotification => ticketNotification['short'] === customId)['name']}**`)
            .setTimestamp();
        await interaction.reply({ embeds: [removedEmbed], ephemeral: true });
    },
};