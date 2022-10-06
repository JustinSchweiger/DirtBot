import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Extra } from '../../helper/Extra.js';

export default {
    data: new SlashCommandBuilder()
        .setName('pack-types')
        .setDescription('Shows information about the different types of modpacks.'),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const extra = await Extra.get();
        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Pack Types ${extra['bulletpoint']}`)
            .setDescription('__**With quests:**__\n' +
                '```Overworld:```' +
                '**FTB Oceanblock** is a Ocean based pack with quests.\n' +
                '**Infinity Evolved Reloaded** is an overworld based kitchen sink modpack with quests.\n' +
                '**FTB Infinity Evolved** is an Overworld based kitchen sink modpack with quests, and is on 1.7.10.\n' +
                '**MC Eternal** is another overworld based modpack with quests.\n' +
                '**FTB Continuum** is an overworld based pack with quests.\n' +
                '**Roguelike Adventures and Dungeons** is an adventuring pack in the overworld with quests.\n' +
                '**Glacial Awakening** is a Stoneblock + Overworld based pack with quests.\n' +
                '**Interactions** is a Skyblock + Overworld based pack with quests.\n' +
                '**Nomifactory** is a lost cities (Overworld but with loads of skyscrapers) based pack with quests.\n' +
                '**RL Craft** is an Overworld adventure based modpack designed to be very challenging.\n' +
                '\n' +
                '```SkyBlock:```' +
                '**Sky Odyssey** is a Skyblock based pack with quests.\n' +
                '**Sky Adventures** is a Skyblock based pack with quests.\n' +
                '**Sky Factory 3 & 4** are Skyblock based packs with quests.\n' +
                '**Interactions** is a Skyblock + Overworld based pack with quests.\n' +
                '**Project Ozone 3** is a Skyblock based pack with quests.\n' +
                '\n' +
                '```Stoneblock:```' +
                '**Stoneblock 1 & 2** are Stoneblock based packs with quests, but SB1 has the Nether + End.\n' +
                '**Glacial Awakening** is a Stoneblock + Overworld based pack with quests.\n' +
                '\n' +
                '__**Without quests:**__\n' +
                '```Overworld:```' +
                '**FTB Revelation** is an Overworld based kitchen sink modpack without quests.\n' +
                '**Direwolf20 (1.12.2)** is an Overworld based kitchen sink modpack without quests.\n' +
                '**Direwolf20 (1.16.5)** is an Overworld based kitchen sink modpack without quests.\n' +
                '**FTB Ultimate Reloaded** is an Overworld based kitchen sink modpack without quests.\n' +
                '**Pixelmon** is an Overworld Pokemon based modpack without quests.')
            .setFooter({ text: 'DirtCraft Pack Types', iconURL: extra['footer-icon'] })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};