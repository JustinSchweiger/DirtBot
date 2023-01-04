import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('modpack-locations')
        .setDescription('Shows information on where to find modpacks.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Modpack Locations ${extra['bulletpoint']}`)
            .setDescription('If **DirtLauncher** doesn\'t work for you, you can either create a support ticket or use another launcher. \n' +
                'This message covers what modpacks are on which launchers in the version we run.\n' +
                '\n' +
                'DW20/DW116/SB3/REV/ULT require [**FTBApp**](https://www.feed-the-beast.com/ftb-app), all other packs need [**CurseForge**](https://download.curseforge.com/), but [**PrismLauncher**](https://prismlauncher.org/) works for both.\n' +
                '\n' +
                '- Use [**FTBApp**](https://www.feed-the-beast.com/ftb-app) or [**PrismLauncher**](https://prismlauncher.org/) for Oceanblock, Direwolf20 (1.12/1.16), Stoneblock 3, Revelation, or Ultimate Reloaded.\n' +
                '- Use [**CurseForge**](https://download.curseforge.com/) or [**PrismLauncher**](https://prismlauncher.org/) for Glacial Awakening, FTB Infinity Evolved (1.7.10), Infinity Evolved Reloaded (1.12.2), MCEternal, Nomifactory, Pixelmon Reforged, Project Ozone 3, RLCraft, Roguelike Adventures and Dungeons, Sky Adventures, SkyFactory 3, SkyFactory 4, Sky Odyssey, Stoneblock 1, Stoneblock 2, or Vault Hunters.')
            .setFooter({ text: 'Have fun playing on our servers :)', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};