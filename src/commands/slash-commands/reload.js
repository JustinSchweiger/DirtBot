import { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { Extra } from '../../helper/Extra.js';
import { LoadCommands } from '../../helper/LoadCommands.js';
import { Logger } from '../../helper/Logger.js';

export default {
    data: new SlashCommandBuilder()
        .setName('reload')
        .setDescription('Reloads the commands. Needed for choices.')
        .setDefaultMemberPermissions(
            PermissionsBitField.Flags.ManageRoles,
        ),
    extra: {
        hidden: true,
        inHelp: true,
    },
    execute: async function(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const extra = await Extra.get();

        const reloadStart = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} Reload ${extra['bulletpoint']}`)
            .setDescription('Reloading commands...');
        await Logger.logEmbed(reloadStart);

        await LoadCommands.loadCommands();
        await interaction.editReply({ content: ':white_check_mark: Reload complete.', ephemeral: true });

        const reloadEnd = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} Reload ${extra['bulletpoint']}`)
            .setDescription(`Reload completed by ${interaction.user}.`);
        await Logger.logEmbed(reloadEnd);
    },
};