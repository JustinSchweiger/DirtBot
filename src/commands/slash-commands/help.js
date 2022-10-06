import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
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
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));
        const applicationCommands = await interaction.guild.commands.fetch().then(commands => {
            return commands.map(command => {
                return {
                    commandId: command.id,
                    commandName: command.name,
                    permissions: undefined,
                };
            });
        });

        const applicationCommandPermissions = await interaction.guild.commands.permissions.fetch();

        const commandPermissions = [];
        for (const [key, value] of applicationCommandPermissions) {
            applicationCommands.forEach(command => {
                if (command.commandId === key) {
                    commandPermissions.push({
                        ...command,
                        permissions: value.map(permission => {
                            if (permission.type === 3 || permission.id === roles.everyone) {
                                return;
                            }

                            return {
                                roleId: permission.id,
                                permission: permission.permission,
                            };
                        }).filter(Boolean),
                    });
                }
            });
        }

        const userRoles = interaction.member.roles.cache.map((role) => role.id);

        const commands = interaction.client.commands;
        const normalCommands = commands
            .filter(command => command.extra.inHelp && !command.extra.ticketCommand && !command.extra.hidden)
            .map(command => {
                return {
                    name: command.data.name,
                    description: command.data.description,
                };
            }).map(command => {
                const commandPermission = commandPermissions.find(permission => permission.commandName === command.name);
                if (!commandPermission) {
                    return command;
                }

                const rolePermissions = commandPermission.permissions.map(permission => permission.roleId);
                if (rolePermissions.some(role => userRoles.includes(role))) {
                    return command;
                }
            }).filter(Boolean);

        let ticketCommands =
            commands.filter(command => command.extra.inHelp && command.extra.ticketCommand)
                .map(command => {
                    return {
                        name: command.data.name,
                        description: command.data.description,
                    };
                }).filter((value, index, self) =>
                    index === self.findIndex((t) => (
                        t.name === value.name
                    )),
            );

        if (!userRoles.includes(roles.staff)) {
            ticketCommands = [];
        }

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
        ];

        if (ticketCommands.length > 0) {
            commandsHelp.push(
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
            );
        }


        const extra = await Extra.get();

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Bot Commands ${extra['bulletpoint']}`)
            .addFields(commandsHelp)
            .setFooter({
                text: `Found a total of ${normalCommands.length + ticketCommands.length} commands.`,
                iconURL: extra['footer-icon'],
            })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
    ,
};