import { Gitlab } from '@gitbeaker/node';
import { CronJob } from 'cron';
import { Client, IntentsBitField, MessageType } from 'discord.js';
import { readdirSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { LoadCommands } from './src/helper/LoadCommands.js';
import { TicketManager } from './src/helper/TicketManager.js';

new CronJob(
    '0 * * * * *',
    async () => {
        const ticketsPath = resolve('./tickets');
        const compareDate = new Date(Date.now() - 86400 * 1000).toISOString();

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
            const channel = await client.channels.fetch(ticket.replace('.json', ''));
            await TicketManager.closeTicket(channel);
        }
    },
    null,
    true,
);

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildPresences,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.MessageContent,
    ],
});
export { client as Client };

const gitlab = new Gitlab({
    token: process.env.ACCESS_TOKEN,
});
export { gitlab as Gitlab };

// Required since there are no such variables in ES6 modules
export const __fileName = fileURLToPath(import.meta.url);

client.on('ready', async () => {
    await LoadCommands.loadCommands();
});

client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        const command = client.commands.get(interaction.customId);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply({ content: 'There was an error executing this button!', ephemeral: true });
        }
    } else if (interaction.isModalSubmit()) {
        const command = client.commands.get(interaction.customId);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.log(error);
            await interaction.reply({ content: 'There was an error executing this modal!', ephemeral: true });
        }
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot && message.type === MessageType.ChannelPinnedMessage) {
        await message.delete();
    }
});

client.login(process.env.TOKEN)
    .catch((err) => console.log('[ERROR] DiscordAPI Error: ' + err));