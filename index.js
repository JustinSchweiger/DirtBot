require('colors');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, IntentsBitField, Collection } = require('discord.js');
const { Gitlab } = require('@gitbeaker/node');
const { readdirSync } = require('fs');
const path = require('path');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
    ],
});

const gitlab = new Gitlab({
    token: process.env.ACCESS_TOKEN,
});

// Export client and gitlab api for other files to use
module.exports.GitLab = gitlab;
module.exports.Client = client;

const commands = [];
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
console.log(`Loading ${commandFiles.length} commands...`.yellow);
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
}

client.on('ready', () => {
    const guild_ids = client.guilds.cache.map(guild => guild.id);

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    for (const guildId of guild_ids) {
        rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
            { body: commands })
            .then(() => console.log('Bot is ready!'.green))
            .catch((err) => {
                    console.error(err);
                    process.exit();
                },
            );
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error executing this command' });
    }
});

client.login(process.env.TOKEN)
    .catch((err) => console.log('[ERROR] DiscordAPI Error: ' + err));