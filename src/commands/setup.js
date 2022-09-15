const { SlashCommandBuilder } = require('@discordjs/builders');
const { Logger, Level } = require('../helper/Logger');
const { writeFileSync } = require('fs');
const { EmbedBuilder } = require('discord.js');
const path = require('path');
const { File } = require('../helper/GetFileFromGitlab');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Setup important channels for the bot.')
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
    extra: {
        hidden: false,
    },
    async execute(interaction) {
        const channelIds = {
            'botLogChannel': interaction.options.getChannel('bot-log').id,
            'ticketLogChannel': interaction.options.getChannel('ticket-log').id,
            'appealLogChannel': interaction.options.getChannel('appeal-log').id,
            'ticketNotificationsChannel': interaction.options.getChannel('ticket-notifications').id,
            'supportChannel': interaction.options.getChannel('support').id,
            'punishmentAppealsChannel': interaction.options.getChannel('punishment-appeals').id,
            'verificationChannel': interaction.options.getChannel('verification').id,
            'roleAssignmentChannel': interaction.options.getChannel('role-assignment').id,
            'infoChannel': interaction.options.getChannel('info').id,
        };

        writeFileSync(path.join(__dirname, '..', 'config', 'channels.json'), JSON.stringify(channelIds, null, 2));
        let extra;
        try {
            extra = JSON.parse(await File.get('extra.json'));
        } catch (err) {
            await Logger.log('Error fetching extra.json', Level.ERROR);
            return;
        }

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

        await interaction.reply({ content: 'Successfully set all channels.', ephemeral: true });
    },
};