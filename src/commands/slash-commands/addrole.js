import { SlashCommandBuilder } from '@discordjs/builders';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { Client } from '../../../index.js';
import { Level, Logger } from '../../helper/Logger.js';
import RoleAssignment from '../important-channels/role-assignment.js';

export default {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Adds a role to the role-assignment channel.')
        .setDefaultMemberPermissions(0)
        .addRoleOption(
            option => option
                .setName('role')
                .setDescription('The role to add.')
                .setRequired(true),
        ).addStringOption(
            option => option
                .setName('emoji')
                .setDescription('The emoji to use for the role.')
                .setRequired(true),
        ).addStringOption(
            option => option
                .setName('label')
                .setDescription('The label to use for the role.')
                .setRequired(true),
        ).addStringOption(
            option => option
                .setName('style')
                .setDescription('The style to use for the button.')
                .setRequired(true)
                .addChoices(
                    {
                        name: 'Primary',
                        value: 'Primary',
                    },
                    {
                        name: 'Secondary',
                        value: 'Secondary',
                    },
                    {
                        name: 'Success',
                        value: 'Success',
                    },
                    {
                        name: 'Danger',
                        value: 'Danger',
                    },
                ),
        ),
    extra: {
        hidden: false,
        inHelp: true,
    },
    async execute(interaction) {
        const role = interaction.options.getRole('role');
        const emoji = interaction.options.getString('emoji');
        const label = interaction.options.getString('label');
        const style = interaction.options.getString('style');

        if (!existsSync(resolve('./assets/role-assignments.json'))) {
            writeFileSync(resolve('./assets/role-assignments.json'), JSON.stringify([]));
        }

        const roleAssignments = JSON.parse(readFileSync(resolve('./assets/role-assignments.json')));

        if (roleAssignments.find(roleAssignment => roleAssignment.role === role.id)) {
            await interaction.reply({ content: `${role} is already in the role-assignment channel.`, ephemeral: true });
            return;
        }

        await Logger.log(`${interaction.user} has **added** ${role} to the role-assignment channel.`, Level.INFO);
        await interaction.reply({ content: `Successfully **added** ${role} to the role-assignment channel.`, ephemeral: true });

        roleAssignments.push({
            role: role.id,
            emoji: emoji,
            label: label,
            style: style,
        });
        writeFileSync(resolve('./assets/role-assignments.json'), JSON.stringify(roleAssignments, null, 2));

        await Client.commands.set(role.id, RoleAssignment);
        await RoleAssignment.ReloadButtons();
    },
};