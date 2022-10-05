import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Sends a list of all commands.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const commands = interaction.client.commands;
        const normalCommands = commands
            .filter(command => command.extra.inHelp && !command.extra.ticketCommand && !command.extra.hidden)
            .map(command => {
                return {
                    name: command.data.name,
                    description: command.data.description,
                };
            });

        const ticketCommands = [
            ...new Set(commands
                .filter(command => command.extra.inHelp && command.extra.ticketCommand)
                .map(command => {
                    return {
                        name: command.data.name,
                        description: command.data.description,
                    };
                }),
            ),
        ].filter((value, index, self) =>
                index === self.findIndex((t) => (
                    t.name === value.name
                )),
        );

        const commandsHelp = [
            {
                name: '__**Normal Commands**__',
                value: normalCommands.map(command => `**/${command.name}**`).join('\n'),
                inline: true,
            },
            {
                name: '\u200b',
                value: normalCommands.map(command => command.description).join('\n'),
                inline: true,
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: false,
            },
            {
                name: '__**Ticket Commands**__',
                value: ticketCommands.map(command => `**/${command.name}**`).join('\n'),
                inline: true,
            },
            {
                name: '\u200b',
                value: ticketCommands.map(command => command.description).join('\n'),
                inline: true,
            },
        ];

        const extra = await Extra.get();

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Bot Commands ${extra['bulletpoint']}`)
            .addFields(commandsHelp)
            .setFooter({ text: `Found a total of ${normalCommands.length + ticketCommands.length} commands.`, iconURL: extra['footer-icon'] })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    },
};