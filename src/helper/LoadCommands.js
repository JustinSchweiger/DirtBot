import { REST } from '@discordjs/rest';
import chalk from 'chalk';
import { Routes } from 'discord-api-types/v10';
import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join as joinPath, resolve } from 'path';
import { pathToFileURL } from 'url';
import { __fileName, Client } from '../../index.js';
import { Level, Logger } from './Logger.js';
import { RegisterExtraCommands } from './RegisterExtraCommands.js';

export class LoadCommands {
    static async loadCommands() {
        const commands = [];
        Client.commands = new Collection();

        let commandsAmount = 0;

        const commandsPath = resolve('./src/commands/slash-commands');
        const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            commandsAmount++;
            const filePath = joinPath(__fileName, '..', 'src', 'commands', 'slash-commands', file);
            const { default: command } = await import(pathToFileURL(filePath).href);

            // Replace the choices
            if (command.extra.hasChoices) {
                const choices = await command.getChoices();
                for (const choice of choices) {
                    deepReplace(command, 'choices', choice.choices);
                }
            }

            Client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }

        const ticketCommandsPath = resolve('./src/commands/ticket-slash-commands');
        const ticketCommandFiles = readdirSync(ticketCommandsPath).filter(file => file.endsWith('.js'));
        for (const file of ticketCommandFiles) {
            commandsAmount++;
            const filePath = joinPath(__fileName, '..', 'src', 'commands', 'ticket-slash-commands', file);
            const { default: command } = await import(pathToFileURL(filePath).href);

            // Replace the choices
            if (command.extra.hasChoices) {
                const choices = await command.getChoices();
                for (const choice of choices) {
                    deepReplace(command, 'choices', choice.choices);
                }
            }

            Client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }


        console.log(chalk.yellow(`Registering ${commandsAmount} commands ...`));
        await Logger.log(`Registering ${commandsAmount} commands ...`, Level.INFO);
        await RegisterExtraCommands.ticketNotifications();
        await RegisterExtraCommands.support();
        await RegisterExtraCommands.ticketModal();
        await RegisterExtraCommands.ticketCloseButtons();
        await RegisterExtraCommands.verification();
        await RegisterExtraCommands.roleAssignmentButtons();
        await RegisterExtraCommands.applications();
        await RegisterExtraCommands.announcementModal();
        await RegisterExtraCommands.appeals();

        const guild_ids = Client.guilds.cache.map(guild => guild.id);
        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
        for (const guildId of guild_ids) {
            rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                { body: commands })
                .then(async () => {
                    console.log(chalk.green('Commands successfully registered.'));
                    await Logger.log('Commands successfully registered.', Level.INFO);
                })
                .catch((err) => {
                        console.error(err);
                        process.exit();
                    },
                );
        }
    }
}

/**
 * Loops through all keys in an object and replaces a key with a value
 * @param obj {Object} The object to loop through
 * @param keyName {String} The key to replace
 * @param replacer {any} The value to replace the key with
 */
const deepReplace = (obj, keyName, replacer) => {
    for (const key in obj) {
        if (key === keyName) {
            obj[key] = replacer;
        } else if (Array.isArray(obj[key])) {
            obj[key].forEach(member => deepReplace(member, keyName, replacer));
        } else if (typeof obj[key] === 'object') {
            deepReplace(obj[key], keyName, replacer);
        }
    }
};