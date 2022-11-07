import { readdirSync, readFileSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../index.js';
import { Level, Logger } from '../helper/Logger.js';
import { TicketManager } from '../helper/manager/TicketManager.js';

export default {
    time: '0 * * * * *',
    async run() {
        const ticketsPath = resolve('./tickets');
        const compareDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const ticketsToClose = readdirSync(ticketsPath)
            .filter(file => file.endsWith('.json') && file !== '#####.json')
            .filter(file => {
                const json = JSON.parse(readFileSync(resolve(ticketsPath, file)));
                return json.closed.length > 0;
            }).filter(file => {
                const json = JSON.parse(readFileSync(resolve(ticketsPath, file)));
                return new Date(json.closed).toISOString() < compareDate;
            });

        for (const ticket of ticketsToClose) {
            let channel;
            try {
                channel = await Client.channels.fetch(ticket.replace('.json', ''));
            } catch (e) {
                unlinkSync(resolve(ticketsPath, ticket));
                await Logger.log('Found an old ticket file that didnt get deleted. Deleting it now ...', Level.ERROR);
                continue;
            }

            await TicketManager.closeTicket(channel);
        }
    },
};