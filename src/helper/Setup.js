import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../index.js';
import RoleAssignment from '../commands/important-channels/role-assignment.js';
import Support from '../commands/important-channels/support.js';
import TickedNotifications from '../commands/important-channels/ticket-notifications.js';
import Verification from '../commands/important-channels/verification.js';
import { Clear } from './ClearChannel.js';
import { File } from './GetFileFromGitlab.js';

export class Setup {
    static async importantChannels() {
        const channelIds = JSON.parse(readFileSync(resolve('./src/config/channels.json')).toString());
        await Clear.channels([
            channelIds['supportChannel'],
            channelIds['ticketNotificationsChannel'],
            channelIds['infoChannel'],
            channelIds['roleAssignmentChannel'],
            channelIds['verificationChannel'],
            channelIds['punishmentAppealsChannel'],
        ]);

        const ticketNotificationChannel = await Client.channels.fetch(channelIds['ticketNotificationsChannel']);
        await ticketNotification(ticketNotificationChannel);

        const supportChannel = await Client.channels.fetch(channelIds['supportChannel']);
        await support(supportChannel);

        const verificationChannel = await Client.channels.fetch(channelIds['verificationChannel']);
        await verification(verificationChannel);

        const roleAssignmentChannel = await Client.channels.fetch(channelIds['roleAssignmentChannel']);
        await roleAssignment(roleAssignmentChannel);
    }
}

async function ticketNotification(channel) {
    const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
    ticketNotifications.forEach(notif => {
        Client.commands.set(`ticket-notification-${notif['short']}`, TickedNotifications);
    });
    const buttons = await TickedNotifications.TicketNotificationsButtons(ticketNotifications);
    const ticketNotificationEmbed = await TickedNotifications.TicketNotificationsEmbed();
    channel.send({ embeds: [ticketNotificationEmbed], components: [...buttons] });
}

async function support(channel) {
    await Client.commands.set('ticket', Support);
    const button = await Support.TicketButton();
    const supportEmbed = await Support.TicketEmbed();
    channel.send({ embeds: [supportEmbed], components: [button] });
}

async function verification(channel) {
    await Client.commands.set('verification-button', Verification);
    const verificationEmbed = await Verification.VerificationEmbed();
    const button = await Verification.VerificationButton();
    channel.send({ embeds: [verificationEmbed], components: [button] });
}

async function roleAssignment(channel) {
    if (existsSync(resolve('./src/config/role-assignments.json'))) {
        const roleAssignments = JSON.parse(readFileSync(resolve('./src/config/role-assignments.json')));
        roleAssignments.forEach(role => {
            Client.commands.set(role['role'], RoleAssignment);
        });

        const roleAssignmentEmbed = await RoleAssignment.RoleAssignmentEmbed();
        await channel.send({ embeds: [roleAssignmentEmbed] });
        await RoleAssignment.ReloadButtons();
        return;
    }

    const roleAssignmentEmbed = await RoleAssignment.RoleAssignmentEmbed();
    channel.send({ embeds: [roleAssignmentEmbed] });
}