const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const { Logger, Level } = require('../helper/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Sends a list of all commands.'),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        const commands = interaction.client.commands;
        const commandList = commands
            .filter(command => !command.extra.hidden)
            .map(command => {
                return {
                    name: command.data.name,
                    description: command.data.description,
                };
            });

        const commandsHelp = [
            {
                name: '__Command__',
                value: commandList.map(command => `**/${command.name}**`).join('\n'),
                inline: true,
            },
            {
                name: '__Description__',
                value: commandList.map(command => command.description).join('\n'),
                inline: true,
            },
        ];

        let extra;
        try {
            extra = JSON.parse(await File.get('extra.json'));
        } catch (err) {
            await Logger.log('Error fetching extra.json', Level.ERROR);
            return;
        }

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Bot Commands ${extra['bulletpoint']}`)
            .addFields(commandsHelp)
            .setFooter({ text: `Found a total of ${commandList.length} commands.`, iconURL: extra['footer-icon'] })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    },
};