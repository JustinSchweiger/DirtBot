import { SlashCommandBuilder } from '@discordjs/builders';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../../index.js';
import { Level, Logger } from '../../helper/Logger.js';
import RoleAssignment from '../important-channels/role-assignment.js';

export default {
    data: new SlashCommandBuilder()
        .setName('removerole')
        .setDescription('Removes a role from the role-assignment channel.')
        .addRoleOption(
            option => option
                .setName('role')
                .setDescription('The role to remove.')
                .setRequired(true),
        ),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const role = interaction.options.getRole('role');

        if (!existsSync(resolve('./assets/role-assignments.json'))) {
            return;
        }

        const roleAssignments = JSON.parse(readFileSync(resolve('./assets/role-assignments.json')));

        if (!roleAssignments.find(roleAssignment => roleAssignment.role === role.id)) {
            await interaction.reply({ content: `${role} is not yet in the role-assignment channel.`, ephemeral: true });
            return;
        }

        await Logger.log(`${interaction.user} has **removed** ${role} from the role-assignment channel.`, Level.WARNING);
        await interaction.reply({ content: `Successfully **removed** ${role} from the role-assignment channel.`, ephemeral: true });

        roleAssignments.splice(roleAssignments.findIndex(roleAssignment => roleAssignment.role === role.id), 1);
        writeFileSync(resolve('./assets/role-assignments.json'), JSON.stringify(roleAssignments, null, 2));

        await Client.commands.delete(role.id);
        await RoleAssignment.ReloadButtons();
    },
};