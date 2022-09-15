const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const { File } = require('../helper/GetFileFromGitlab');
const fs = require('fs');
const path = require('path');
const Logger = require('../helper/Logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ips')
        .setDescription('Shows the ips of all our servers.'),
    async execute(interaction) {
        const pixelPath = path.join(__dirname, '..', '..', 'assets', 'pixel-ips.json');
        const modpackPath = path.join(__dirname, '..', '..', 'assets', 'modpack-ips.json');
        try {
            const file = await File.get('pixel-ips.json');
            const json = JSON.parse(file);
            if (!fs.existsSync(pixelPath) || !fs.readFileSync(pixelPath).equals(Buffer.from(json))) {
                fs.writeFileSync(pixelPath, JSON.stringify(json, null, 2));
            }
        } catch (err) {
            interaction.reply('Error fetching Pixelmon IPs!');
            if (err.type === 'invalid-json') {
                await Logger.log('Error fetching Pixelmon IPs: Invalid JSON', Logger.level.error);
            } else {
                await Logger.log(err, Logger.level.error);
            }
            return;
        }

        try {
            const file = await File.get('modpack-ips.json');
            const json = JSON.parse(file);
            if (!fs.existsSync(modpackPath) || !fs.readFileSync(modpackPath).equals(Buffer.from(json))) {
                fs.writeFileSync(modpackPath, JSON.stringify(json, null, 2));
            }
        } catch (err) {
            interaction.reply('Error fetching Modpack IPs!');
            if (err.type === 'invalid-json') {
                await Logger.log('Error fetching Modpack IPs: Invalid JSON', Logger.level.error);
            } else {
                await Logger.log(err, Logger.level.error);
            }
            return;
        }

        const pixelIps = JSON.parse(fs.readFileSync(pixelPath).toString());
        const modpackIps = JSON.parse(fs.readFileSync(pixelPath).toString());
        const pixelStats = fs.statSync(pixelPath);
        const modpackStats = fs.statSync(modpackPath);
        const pixelDate = new Date(pixelStats.mtime);
        const modpackDate = new Date(modpackStats.mtime);

        const pixel = [
            {
                name: '__Pixelmon Server__',
                value: pixelIps.map(obj => obj.server).join('\n'),
                inline: true,
            },
            {
                name: 'Minecraft Version',
                value: `**${pixelIps.map(obj => obj.version).join('\n')}**`,
                inline: true,
            },
            {
                name: '__IP__',
                value: pixelIps.map(obj => obj.ip).join('\n'),
                inline: true,
            },
        ];

        const modpack = [
            {
                name: '__Modpack Server__',
                value: modpackIps.map(obj => obj.server).join('\n'),
                inline: true,
            },
            {
                name: 'Minecraft Version',
                value: `**${modpackIps.map(obj => obj.version).join('\n')}**`,
                inline: true,
            },
            {
                name: '__IP__',
                value: modpackIps.map(obj => obj.ip).join('\n'),
                inline: true,
            },
        ];

        const pixelEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle('<:redbulletpoint:1019567816757751888> DirtCraft Pixelmon Server IPs <:redbulletpoint:1019567816757751888>')
            .addFields(pixel)
            .setImage('https://i.imgur.com/GdrLxI7.gif')
            .setFooter({ text: 'Last Update ', iconURL: 'https://i.imgur.com/eyyy6A4.png' })
            .setTimestamp(pixelDate);

        const modpackEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle('<:redbulletpoint:1019567816757751888> DirtCraft Modpack Server IPs <:redbulletpoint:1019567816757751888>')
            .addFields(modpack)
            .setImage('https://i.imgur.com/C6houqk.gif')
            .setFooter({ text: 'Last Update ', iconURL: 'https://i.imgur.com/eyyy6A4.png' })
            .setTimestamp(modpackDate);

        interaction.reply({ embeds: [pixelEmbed, modpackEmbed] });
    },
};