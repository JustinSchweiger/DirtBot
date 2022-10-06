import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../index.js';
import AcceptApplicationModal from '../commands/application-commands/accept-application-modal.js';
import AcceptApplication from '../commands/application-commands/accept-application.js';
import DenyApplicationModal from '../commands/application-commands/deny-application-modal.js';
import DenyApplication from '../commands/application-commands/deny-application.js';
import NoLongerStaff from '../commands/application-commands/no-longer-staff.js';
import AnnouncementModal from '../commands/important-channels/announcement-modal.js';
import Application from '../commands/important-channels/applications.js';
import DevAppModal from '../commands/important-channels/dev-app-modal.js';
import RoleAssignment from '../commands/important-channels/role-assignment.js';
import StaffAppModal from '../commands/important-channels/staff-app-modal.js';
import TicketModal from '../commands/important-channels/support-modal.js';
import Support from '../commands/important-channels/support.js';
import TickedNotifications from '../commands/important-channels/ticket-notifications.js';
import Verification from '../commands/important-channels/verification.js';
import Close from '../commands/ticket-slash-commands/close.js';
import { File } from './GetFileFromGitlab.js';

export class RegisterExtraCommands {
    static async ticketNotifications() {
        const ticketNotificationsJson = JSON.parse(await File.get('ticket-notifications.json'));
        ticketNotificationsJson.map(ticketNotification => {
            Client.commands.set(`ticket-notification-${ticketNotification['short']}`, TickedNotifications);
        });
    }

    static async applications() {
        await Client.commands.set('staff-app', Application);
        await Client.commands.set('dev-app', Application);
        await Client.commands.set('dev-app-modal', DevAppModal);
        await Client.commands.set('staff-app-modal', StaffAppModal);
        await Client.commands.set('no-longer-staff', NoLongerStaff);
        await Client.commands.set('accept-application', AcceptApplication);
        await Client.commands.set('deny-application', DenyApplication);
        await Client.commands.set('deny-application-modal', DenyApplicationModal);
        await Client.commands.set('accept-application-modal', AcceptApplicationModal);
    }

    static async support() {
        await Client.commands.set('ticket', Support);
    }

    static async verification() {
        await Client.commands.set('verification-button', Verification);
    }

    static async ticketModal() {
        await Client.commands.set('ticket-modal', TicketModal);
    }

    static async ticketCloseButtons() {
        await Client.commands.set('close-ticket', Close);
        await Client.commands.set('cancel-closure', Close);
    }

    static async roleAssignmentButtons() {
        if (!existsSync(resolve('./assets/role-assignments.json'))) {

            return;
        }

        const roleAssignments = JSON.parse(readFileSync(resolve('./assets/role-assignments.json')));
        roleAssignments.forEach(role => {
            Client.commands.set(role['role'], RoleAssignment);
        });
    }

    static async announcementModal() {
        await Client.commands.set('announcement-modal', AnnouncementModal);
    }
}