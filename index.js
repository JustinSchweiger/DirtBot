import { Gitlab } from '@gitbeaker/node';
import chalk from 'chalk';
import { CronJob } from 'cron';
import { ActivityType, Client, IntentsBitField, MessageType } from 'discord.js';
import { readdirSync } from 'fs';
import { join as joinPath } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { LoadCommands } from './src/helper/LoadCommands.js';
import { Level, Logger } from './src/helper/Logger.js';

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
    client.user.setPresence({
        activities: [{
            name: 'over DirtCraft',
            type: ActivityType.Watching,
        }],
        status: 'online',
    });
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
    .catch((err) => console.log('[ERROR] DiscordAPI Error: ' + err))
    .then(async () => {
        try {
            const cronJobs = readdirSync('./src/cronjobs');
            let jobsRegistered = 0;
            for (const cronJob of cronJobs) {
                const filePath = joinPath(__fileName, '..', 'src', 'cronjobs', cronJob);
                const { default: job } = await import(pathToFileURL(filePath).href);
                new CronJob(
                    job.time,
                    job.run,
                    null,
                    true,
                );
                jobsRegistered++;
            }

            console.log(chalk.yellow(`Registered ${jobsRegistered} CronJobs!`));
            await Logger.log(`🛠 Registered ${jobsRegistered} CronJobs!`, Level.INFO);
        } catch (e) {
            console.error(e);
        }
    });