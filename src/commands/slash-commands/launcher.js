import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { GitLabFile } from '../../helper/EnsureFileSync.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('launcher')
        .setDescription('Shows download links for the launcher.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        await GitLabFile.serve('launcher.json');

        const launcher = JSON.parse(readFileSync(resolve('./assets/launcher.json')));
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Launcher ${extra['bulletpoint']}`)
            .setDescription(`${launcher['isBroken'] ? 'The launcher is **currently broken** due to changes from CurseForge/FTB.\nPlease use their official launchers or [**PrismLauncher**](https://prismlauncher.org/) for the time being.\n' : ''}` +
                '\n' +
                '__**Windows Installer**__\n' +
                `[**64-Bit**](${launcher['x64']})\n` +
                `[**32-Bit**](${launcher['x86']})\n` +
                '\n' +
                '__**Universal Installer**__\n' +
                `[**All Operating Systems**](${launcher['universal']})\n`,
            )
            .setFooter({ text: 'Have fun with our ~dirty launcher~ :)', iconURL: extra['footer-icon'] });

        await interaction.reply({ embeds: [embed] });
    },
};