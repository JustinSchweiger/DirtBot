const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const { Logger, Level } = require('../helper/Logger');
const { readFileSync, statSync } = require('fs');
const path = require('path');
const { GitLabFile } = require('../helper/EnsureFileSync');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ips')
        .setDescription('Shows the ips of all our servers.'),
    async execute(interaction) {
        await GitLabFile.serve(interaction, 'servers.json');
        const serversPath = path.join(__dirname, '..', '..', 'assets', 'servers.json');

        const serversJson = JSON.parse(readFileSync(serversPath).toString());
        const stats = statSync(serversPath);
        const date = new Date(stats.mtime);

        const pixel = [
            {
                name: '__Pixelmon Server__',
                value: serversJson
                    .filter(server => server['isPixelmon'])
                    .map(server => server['new'] ? `:new: ${server['server']}` : server['server'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '\u200b',
                value: '\u200b',
                inline: true,
            },
            {
                name: '__Server IPs__',
                value: serversJson
                    .filter(server => server['isPixelmon'])
                    .map(server => server['ip'])
                    .join('\n'),
                inline: true,
            },
        ];

        const modpack = [
            {
                name: '__Modpack__',
                value: serversJson
                    .filter(server => !server['isPixelmon'])
                    .map(server => server['new'] ? `:new: ${server['server']}` : server['server'])
                    .join('\n'),
                inline: true,
            },
            {
                name: '__Server IP__',
                value: serversJson
                    .filter(server => !server['isPixelmon'])
                    .map(server => server['ip'])
                    .join('\n'),
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

        const pixelEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Pixelmon Server IPs ${extra['bulletpoint']}`)
            .addFields(pixel)
            .setImage(extra['pixel-banner'])
            .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        const modpackEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Modpack Server IPs ${extra['bulletpoint']}`)
            .addFields(modpack)
            .setImage(extra['modpack-banner'])
            .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        const hubEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Hub${extra['bulletpoint']}`)
            .setDescription('You can connect to the hub by using the IP `dirtcraft.gg` or `pixelmon.gg`.\nFrom there you can connect to all of our `1.7.10`, `1.10.2` and `1.12.2` servers!\n \nThere is currently no hub for our `1.16.5` servers!\nPlease use the direct ip for now!')
            .setFooter({ text: 'Last Updated ', iconURL: extra['footer-icon'] })
            .setTimestamp(date);

        interaction.reply({ embeds: [pixelEmbed, modpackEmbed, hubEmbed] });
    },
};