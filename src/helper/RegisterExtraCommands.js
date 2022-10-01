import { Client } from '../../index.js';
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
}