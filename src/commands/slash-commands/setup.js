import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { existsSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { Logger } from '../../helper/Logger.js';
import { Setup } from '../../helper/Setup.js';

export default {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup the bot.')
        .addSubcommand(
            subcommand => subcommand
                .setName('messages')
                .setDescription('Send the messages to the channels.'),
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('roles')
                .setDescription('Setup the roles.')
                .addRoleOption(
                    option => option
                        .setName('verified')
                        .setDescription('The Verified role.')
                        .setRequired(true),
                ).addRoleOption(
                    option => option
                        .setName('staff')
                        .setDescription('The Staff role. Players with this role will see tickets.')
                        .setRequired(true),
                ).addRoleOption(
                    option => option
                        .setName('admin')
                        .setDescription('The Admin role. Players with this role will be pinged when the ticket is set to admin level.')
                        .setRequired(true),
                ).addRoleOption(
                    option => option
                        .setName('network-admin')
                        .setDescription('The Network Admin role. Network Admins will be pinged when a ticket is set to network admin level.')
                        .setRequired(true),
                ).addRoleOption(
                    option => option
                        .setName('manager')
                        .setDescription('The Manager role. Players with this role will have access to more commands.')
                        .setRequired(true),
                ).addRoleOption(
                    option => option
                        .setName('owner')
                        .setDescription('The Owner role.')
                        .setRequired(true),
                ),
        )
        .addSubcommand(
            subcommand => subcommand
                .setName('channels')
                .setDescription('Setup the channels for the bot.')
                .addChannelOption(
                    option => option
                        .setName('bot-log')
                        .setDescription('The channel in which to post logs.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('ticket-log')
                        .setDescription('The channel in which to post ticket logs.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('transcripts')
                        .setDescription('The channel in which to send the transcripts of closed channels.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('appeal-log')
                        .setDescription('The channel in which to post appeal logs.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('ticket-notifications')
                        .setDescription('The channel in which staff can subscribe to ticket notifications.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('support')
                        .setDescription('The channel in which to send the ticket creation embed.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('ticket-category')
                        .setDescription('The category under which new tickets will be created.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('quick-support')
                        .setDescription('The forum for quick support.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('punishment-appeals')
                        .setDescription('The channel in which to send the punishment appeals embed.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('verification')
                        .setDescription('The channel in which to send the verification embed.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('role-assignment')
                        .setDescription('The channel in which to send the role assignment embed.')
                        .setRequired(true),
                ).addChannelOption(
                    option => option
                        .setName('info')
                        .setDescription('The channel in which to send the info embed.')
                        .setRequired(true),
                ),
        ),
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'messages') {
            if (!existsSync(resolve('./src/config/channels.json'))) {
                interaction.reply({ content: 'Please run `/setup channels` first!', ephemeral: true });
                return;
            }

            if (!existsSync(resolve('./src/config/roles.json'))) {
                interaction.reply({ content: 'Please run `/setup roles` first!', ephemeral: true });
                return;
            }

            await interaction.deferReply({ ephemeral: true });
            await Setup.importantChannels();
            await interaction.editReply({ content: ':white_check_mark: All messages have been send in their respective channels.', ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'roles') {
            const roles = {
                verified: interaction.options.getRole('verified').id,
                staff: interaction.options.getRole('staff').id,
                admin: interaction.options.getRole('admin').id,
                networkAdmin: interaction.options.getRole('network-admin').id,
                manager: interaction.options.getRole('manager').id,
                owner: interaction.options.getRole('owner').id,
            };

            writeFileSync(resolve('./src/config/roles.json'), JSON.stringify(roles, null, 2));
            const extra = await Extra.get();
            const fields = [
                {
                    name: '\u200b',
                    value: Object.keys(roles).map(role => `**${role}**`).join('\n'),
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: Object.keys(roles).map(() => '>>').join('\n'),
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: Object.values(roles).map(role => `<@&${role}>`).join('\n'),
                    inline: true,
                },
            ];

            const embed = new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Role Setup ${extra['bulletpoint']}`)
                .setDescription(`The required roles for the bot have been setup successfully by ${interaction.user}`)
                .setFields(fields)
                .setFooter({ text: 'Setup Completed', iconURL: extra['footer-icon'] })
                .setTimestamp();

            await Logger.logEmbed(embed);

            interaction.reply({ content: ':white_check_mark: The roles have been set!', ephemeral: true });
        } else if (interaction.options.getSubcommand() === 'channels') {
            const channelIds = {
                'botLogChannel': interaction.options.getChannel('bot-log').id,
                'ticketLogChannel': interaction.options.getChannel('ticket-log').id,
                'transcriptsChannel': interaction.options.getChannel('transcripts').id,
                'appealLogChannel': interaction.options.getChannel('appeal-log').id,
                'ticketNotificationsChannel': interaction.options.getChannel('ticket-notifications').id,
                'supportChannel': interaction.options.getChannel('support').id,
                'ticketCategory': interaction.options.getChannel('ticket-category').id,
                'quickSupportChannel': interaction.options.getChannel('quick-support').id,
                'punishmentAppealsChannel': interaction.options.getChannel('punishment-appeals').id,
                'verificationChannel': interaction.options.getChannel('verification').id,
                'roleAssignmentChannel': interaction.options.getChannel('role-assignment').id,
                'infoChannel': interaction.options.getChannel('info').id,
            };

            writeFileSync(resolve('./src/config/channels.json'), JSON.stringify(channelIds, null, 2));
            const extra = await Extra.get();

            const fields = [
                {
                    name: '\u200b',
                    value: Object.keys(channelIds).map(id => `\`${id}\``).join('\n'),
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: Object.keys(channelIds).map(() => '>>').join('\n'),
                    inline: true,
                },
                {
                    name: '\u200b',
                    value: Object.values(channelIds).map(id => `<#${id}>`).join('\n'),
                    inline: true,
                },
            ];

            const embed = new EmbedBuilder()
                .setColor('#df0000')
                .setTitle(`${extra['bulletpoint']} DirtCraft Bot Setup ${extra['bulletpoint']}`)
                .setDescription(`The required channels for the bot have been setup successfully by ${interaction.user}`)
                .setFields(fields)
                .setFooter({ text: 'Setup Completed', iconURL: extra['footer-icon'] })
                .setTimestamp();

            await Logger.logEmbed(embed);

            await interaction.reply({ content: ':white_check_mark: Successfully set all channels.', ephemeral: true });
        }
    },
};