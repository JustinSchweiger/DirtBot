import { Gitlab } from '@gitbeaker/node';
import { Client, IntentsBitField } from 'discord.js';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { LoadCommands } from './src/helper/LoadCommands.js';

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
    ],
});
export { client as Client };

const gitlab = new Gitlab({
    token: process.env.ACCESS_TOKEN,
});
export { gitlab as Gitlab };

// Required since there are no such variables in ES6 modules
export const __fileName = fileURLToPath(import.meta.url);
export const __dirname = dirname(__fileName);

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
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
        }
    } else if (interaction.isButton()) {
        const command = client.commands.get(interaction.customId);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error executing this button!', ephemeral: true });
        }
    }
});

client.login(process.env.TOKEN)
    .catch((err) => console.log('[ERROR] DiscordAPI Error: ' + err));