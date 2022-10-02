import { ChannelType, PermissionFlagsBits } from 'discord-api-types/v10';
import { createTranscript } from 'discord-html-transcripts';
import { EmbedBuilder } from 'discord.js';
import { existsSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../index.js';
import review from '../commands/slash-commands/review.js';
import { Extra } from './Extra.js';
import { File } from './GetFileFromGitlab.js';

export class TicketManager {
    static async createNewTicket(interaction, username, problem, author, uuid, shortDescription) {
        const newTicketNumber = this.getNewTicketNumber();
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        const newChannel = await interaction.guild.channels.create({
            parent: JSON.parse(readFileSync(resolve('./src/config/channels.json')))['ticketCategory'],
            name: shortDescription ? shortDescription + '-' + newTicketNumber : newTicketNumber,
            type: ChannelType.GuildText,
            reason: shortDescription,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: roles['staff'],
                    allow: [PermissionFlagsBits.ViewChannel],
                },
                {
                    id: author.id,
                    allow: [PermissionFlagsBits.ViewChannel],
                },
            ],
        });

        await this.sendTicketCreationEmbed(newChannel, username, problem, author, uuid, newTicketNumber);
        return newChannel;
    }

    static getNewTicketNumber() {
        const path = resolve('./tickets/#####.json');

        if (!existsSync(path)) {
            const tracker = {
                lastTicketNumber: 1,
            };
            writeFileSync(path, JSON.stringify(tracker, null, 2));
            return 1;
        }

        const newTicketNumber = JSON.parse(readFileSync(path)).lastTicketNumber + 1;

        const tracker = {
            lastTicketNumber: newTicketNumber,
        };

        writeFileSync(path, JSON.stringify(tracker, null, 2));
        return newTicketNumber;
    }

    static async logTicketCreation(newChannel, problem, author, newTicketNumber) {
        const extra = await Extra.get();

        const fields = [
            {
                name: '__**Ticket Event | Created**__',
                value: problem,
                inline: false,
            },
            {
                name: '__**Ticket Information:**__',
                value: `**Ticket ID:** ${newTicketNumber}\n` +
                    `**Ticket Channel:** ${newChannel}\n` +
                    `**Action completed by:** ${author}`,
                inline: false,
            },
        ];

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Ticket System ${extra['bulletpoint']}`)
            .addFields(fields)
            .setTimestamp();

        await this.logTicketEmbed(embed);
    }

    static async logTicketEmbed(embed) {
        const ticketLogId = JSON.parse(readFileSync(resolve('./src/config/channels.json')))['ticketLogChannel'];
        const logChannel = Client.channels.cache.get(ticketLogId);
        await logChannel.send({ embeds: [embed] });
    }

    static async sendTicketCreationEmbed(newChannel, username, problem, author, uuid, newTicketNumber) {
        const extra = await Extra.get();
        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Ticket System ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: '__**Ticket Message:**__',
                    value: problem,
                    inline: false,
                },
                {
                    name: '__**Ticket Information:**__',
                    value: `**User:** <@${author.id}>\n` +
                        `**Username:** [${username}](https://namemc.com/profile/${uuid})`,
                    inline: false,
                },
                {
                    name: '__**Assigned To:**__',
                    value: `<@&${roles['staff']}>`,
                    inline: false,
                },
            ])
            .setFooter({ text: 'Thank you for using our ticket system!', iconURL: extra['footer-icon'] })
            .setTimestamp();

        const embedId = await newChannel.send({ embeds: [embed] }).then((message) => message.pin());

        const data = {
            embedId: embedId.id,
            ticketUuid: uuidv4(),
            ticketId: newTicketNumber,
            ticketName: newChannel.name,
            channelId: newChannel.id,
            users: [author.id],
            username: username,
            uuid: uuid,
            problem: problem,
            level: roles['staff'],
            author: author.id,
            server: '',
            opened: new Date().toISOString(),
            closed: '',
            closedBy: '',
            closedReason: '',
        };
        writeFileSync(resolve(`./tickets/${newChannel.id}.json`), JSON.stringify(data, null, 2));
        await this.logTicketCreation(newChannel, problem, author, newTicketNumber);
    }

    static async changeEmbed(channel, ticket, key, value) {
        const extra = await Extra.get();
        const ticketUsers = ticket.users.map((u) => `<@${u}>`);
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        const embedInfo = {
            users: ticketUsers.join(', '),
            username: ticket.username,
            uuid: ticket.uuid,
            server: ticket.server ? `<:${ticketNotifications.find((server) => server.short === ticket.server).emoji.name}:${ticketNotifications.find((server) => server.short === ticket.server).emoji.id}> ${ticketNotifications.find((server) => server.short === ticket.server).name}` : '',
            level: ticket.level,
        };
        switch (key) {
            case 'server':
                embedInfo.server = value;
                break;
            case 'username':
                embedInfo.username = value.username;
                embedInfo.uuid = value.uuid;
                break;
            case 'add':
                embedInfo.users = ticketUsers.concat(`<@${value}>`).join(', ');
                break;
            case 'remove':
                embedInfo.users = ticketUsers.filter((u) => u !== `<@${value}>`).join(', ');
                break;
            case 'level':
                embedInfo.level = value;
                break;
        }

        const embed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Ticket System ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: '__**Ticket Message:**__',
                    value: ticket.problem,
                    inline: false,
                },
                {
                    name: '__**Ticket Information:**__',
                    value: `**User:** ${embedInfo.users}\n` +
                        `**Username:** [${embedInfo.username}](https://namemc.com/profile/${embedInfo.uuid})\n` +
                        `**Server:** ${embedInfo.server}`,
                    inline: false,
                },
                {
                    name: '__**Assigned To:**__',
                    value: `<@&${embedInfo.level}>`,
                    inline: false,
                },
            ])
            .setFooter({ text: 'Thank you for using our ticket system!', iconURL: extra['footer-icon'] })
            .setTimestamp(new Date(ticket.opened));

        const embedId = await channel.messages.fetch(ticket.embedId);
        await embedId.edit({ embeds: [embed] });
    }

    static async logTicketChange(key, value, user, channel, ticketId) {
        const extra = await Extra.get();
        const embedInfo = {
            name: undefined,
            value: undefined,
        };

        switch (key) {
            case 'server':
                embedInfo.name = '__**Ticket Event | Server Change**__';
                embedInfo.value = `Old: ${value['old']}\nNew: ${value['new']}`;
                break;
            case 'rename':
                embedInfo.name = '__**Ticket Event | Rename Ticket**__';
                embedInfo.value = `Old: ${value['old']}\nNew: ${value['new']}`;
                break;
            case 'username':
                embedInfo.name = '__**Ticket Event | Username Change**__';
                embedInfo.value = `Old: ${value['old']}\nNew: ${value['new']}`;
                break;
            case 'add':
                embedInfo.name = '__**Ticket Event | Add User**__';
                embedInfo.value = `Added: ${value}`;
                break;
            case 'remove':
                embedInfo.name = '__**Ticket Event | Remove User**__';
                embedInfo.value = `Removed: ${value}`;
                break;
            case 'level':
                embedInfo.name = '__**Ticket Event | Change Level**__';
                embedInfo.value = `Old: ${value['old']}\nNew: ${value['new']}`;
                break;
            case 'close':
                embedInfo.name = '__**Ticket Event | Close Ticket**__';
                embedInfo.value = `Closed with reason: \`\`\`${value}\`\`\``;
                break;
            case 'cancel-close':
                embedInfo.name = '__**Ticket Event | Cancel Close**__';
                embedInfo.value = '\u200b';
                break;
            case 'silentclose':
                embedInfo.name = '__**Ticket Event | Silent Close**__';
                embedInfo.value = '\u200b';
        }

        const serverChangeEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${extra['bulletpoint']} DirtCraft Ticket System ${extra['bulletpoint']}`)
            .addFields([
                {
                    name: embedInfo.name,
                    value: embedInfo.value,
                    inline: false,
                },
                {
                    name: '__**Ticket Information:**__',
                    value: `**Ticket ID:** ${ticketId}\n` +
                        `**Ticket Channel:** ${channel}\n` +
                        `**Action completed by:** ${user}`,
                    inline: false,
                },
            ])
            .setTimestamp();

        await this.logTicketEmbed(serverChangeEmbed);
    }

    static async changeServer(newServer, channel, user) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        const updatedTicket = JSON.parse(JSON.stringify(ticket));
        updatedTicket.server = newServer;

        writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(updatedTicket, null, 2));

        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        const newServerLabel = ticketNotifications.find((server) => server.short === newServer).name;

        await this.changeEmbed(channel, ticket, 'server', `<:${ticketNotifications.find((server) => server.short === newServer).emoji.name}:${ticketNotifications.find((server) => server.short === newServer).emoji.id}> ${newServerLabel}`);
        await this.logTicketChange('server', { old: ticket.server, new: newServer }, user, channel, ticket.ticketId);

        if (ticket.server !== newServer) {
            let category = await Client.channels.cache.find(c => c.name === newServerLabel);

            if (!category) {
                await channel.guild.channels.create({
                    type: ChannelType.GuildCategory,
                    name: newServerLabel,
                    permissionOverwrites: [{
                        id: channel.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }],
                });
            }

            category = await Client.channels.cache.find(c => c.name === newServerLabel);
            await channel.setParent(category.id, { lockPermissions: false });
        }
    }

    static async renameTicket(newName, channel, user) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        await this.logTicketChange('rename', { old: channel.name, new: newName }, user, channel, ticket.ticketId);

        if (channel.name !== newName) {
            await channel.setName(newName);
            ticket.ticketName = newName;
            writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(ticket, null, 2));
        }
    }

    static async changeUsername(username, uuid, channel, user) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        const updatedTicket = JSON.parse(JSON.stringify(ticket));
        updatedTicket.username = username;
        updatedTicket.uuid = uuid;

        writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(updatedTicket, null, 2));

        await this.changeEmbed(channel, ticket, 'username', { username, uuid });
        await this.logTicketChange('username', {
            old: `[${ticket.username}](https://namemc.com/profile/${ticket.uuid})`,
            new: `[${username}](https://namemc.com/profile/${uuid})`,
        }, user, channel, ticket.ticketId);
    }

    static async hasPermsAndIsTicket(interaction, defered) {
        const openTickets = readdirSync(resolve('./tickets'));
        if (!openTickets.includes(interaction.channel.id + '.json')) {
            if (defered) {
                await interaction.editReply({
                    content: 'This command can only be run in a ticket channel.',
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: 'This command can only be run in a ticket channel.',
                    ephemeral: true,
                });
            }
            return false;
        }

        const roles = JSON.parse(readFileSync(resolve('./src/config/roles.json')));
        if (!interaction.member.roles.cache.has(roles['staff'])) {
            if (defered) {
                await interaction.editReply({
                    content: 'You do not have permission to run this command.',
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: 'You do not have permission to run this command.',
                    ephemeral: true,
                });
            }

            return false;
        }

        return true;
    }

    static async populateTicket(newServer, newTicketName, newUsername, uuid, channel, user) {
        await this.changeServer(newServer, channel, user);
        await this.changeUsername(newUsername, uuid, channel, user);

        if (newTicketName) {
            await this.renameTicket(newTicketName, channel, user);
        }
    }

    static async addPlayer(playerToAdd, channel, user) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        const updatedTicket = JSON.parse(JSON.stringify(ticket));
        updatedTicket.users.push(playerToAdd.id);

        writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(updatedTicket, null, 2));

        await this.changeEmbed(channel, ticket, 'add', playerToAdd.id);
        await this.logTicketChange('add', playerToAdd, user, channel, ticket.ticketId);

        await channel.permissionOverwrites.create(playerToAdd, { ViewChannel: true });
    }

    static async removePlayer(playerToRemove, channel, user) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        const updatedTicket = JSON.parse(JSON.stringify(ticket));
        updatedTicket.users = updatedTicket.users.filter((u) => u !== playerToRemove.id);

        writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(updatedTicket, null, 2));

        await this.changeEmbed(channel, ticket, 'remove', playerToRemove.id);
        await this.logTicketChange('remove', playerToRemove, user, channel, ticket.ticketId);

        channel.permissionOverwrites.delete(playerToRemove);
    }

    static async prepareCloseTicket(channel, user, reason) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));

        await this.logTicketChange('close', reason, user, channel, ticket.ticketId);

        const updatedTicket = JSON.parse(JSON.stringify(ticket));
        updatedTicket.closed = new Date().toISOString();
        updatedTicket.closedBy = user.id;
        updatedTicket.closedReason = reason;
        writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(updatedTicket, null, 2));

        let category = await Client.channels.cache.find(c => c.name === '🎫 Pending Review');

        if (!category) {
            await channel.guild.channels.create({
                type: ChannelType.GuildCategory,
                name: '🎫 Pending Review',
                permissionOverwrites: [{
                    id: channel.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                }],
            });
        }

        category = await Client.channels.cache.find(c => c.name === '🎫 Pending Review');
        await channel.setParent(category.id, { lockPermissions: false });
    }

    static async closeTicket(channel) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        const author = channel.guild.members.cache.get(ticket.author);
        const closedBy = channel.guild.members.cache.get(ticket.closedBy);
        const transcriptChannel = channel.guild.channels.cache.get(JSON.parse(readFileSync(resolve('./src/config/channels.json'))).closedTicketTranscriptsChannel);

        const transcript = await createTranscript(channel, {
            limit: -1,
            returnType: 'string',
            minify: true,
            saveImages: true,
            useCDN: true,
        });

        await channel.delete();

        const closeEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setTitle(`${(await Extra.get())['bulletpoint']} DirtCraft Ticket System ${(await Extra.get())['bulletpoint']}`)
            .addFields([
                {
                    name: '__**Ticket Closed**__',
                    value: `${closedBy} has **closed** this ticket.`,
                    inline: false,
                },
                {
                    name: '__**Reason**__',
                    value: '```' + ticket.closedReason + '```',
                    inline: false,
                },
                {
                    name: '\u200b',
                    value: `[Click Here](${process.env.FRONTEND_URL}/?ticket=${ticket.ticketUuid}) to view the transcript.\n `,
                    inline: false,
                },
            ]).setFooter({
                text: 'Thank you for using our ticket system!',
                iconURL: (await Extra.get())['footer-icon'],
            }).setTimestamp();

        const transcriptEmbed = new EmbedBuilder()
            .setColor('#df0000')
            .setDescription(`[**#${ticket.ticketId}**](${process.env.FRONTEND_URL}/?ticket=${ticket.ticketUuid}) closed by ${closedBy}`)
            .setTimestamp();

        await transcriptChannel.send({ embeds: [transcriptEmbed] });

        await author.send({
            embeds: [closeEmbed, await review.getEmbed()],
        });

        writeFileSync(resolve(`./tickets/${ticket.ticketUuid}.html`), transcript);
        unlinkSync(resolve(`./tickets/${channel.id}.json`));
    }

    static async cancelTicketClosure(channel, user) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));

        await this.logTicketChange('cancel-close', null, user, channel, ticket.ticketId);

        if (channel.name !== ticket.ticketName) {
            await channel.setName(ticket.ticketName);
        }

        const updatedTicket = JSON.parse(JSON.stringify(ticket));
        updatedTicket.closed = '';
        updatedTicket.closedBy = '';
        updatedTicket.closedReason = '';
        writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(updatedTicket, null, 2));

        const standardCategory = channel.guild.channels.cache.get(JSON.parse(readFileSync(resolve('./src/config/channels.json')))['ticketCategory']).name;
        const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
        const serverLabel = ticketNotifications.find((server) => server.short === ticket.server) ?
            ticketNotifications.find((server) => server.short === ticket.server).name :
            standardCategory;
        let category = await Client.channels.cache.find(c => c.name === serverLabel);

        if (!category) {
            await channel.guild.channels.create({
                type: ChannelType.GuildCategory,
                name: serverLabel,
                permissionOverwrites: [{
                    id: channel.guild.roles.everyone,
                    deny: [PermissionFlagsBits.ViewChannel],
                }],
            });
        }

        category = await Client.channels.cache.find(c => c.name === serverLabel);
        await channel.setParent(category.id, { lockPermissions: false });
    }

    static async changeLevel(channel, user, levelId, level, interaction, ping) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));
        const currentServer = ticket.server;

        if (level === 'admin') {
            if (!currentServer) {
                await interaction.reply({
                    content: 'You must set a server before you can change the level to admin.',
                    ephemeral: true,
                });
                return;
            }

            const serverNotifications = JSON.parse(readFileSync(resolve(`./ticket-notifications/${currentServer}.json`)));

            const adminUsers = await channel.guild.roles.cache
                .get(levelId).members
                .map(m => m.user.id)
                .filter(userId => serverNotifications.includes(userId));

            const adminPing = adminUsers.length > 0 ? adminUsers.map(u => `<@${u}>`).join(' ') : '```No admins are subscribed to this server.```';
            if (ping) {
                await interaction.reply(adminPing);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#df0000')
                    .setDescription('Ticket level changed to `Staff`!');
                await interaction.reply({ embeds: [embed] });
            }

            const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
            const serverLabel = ticketNotifications.find((server) => server.short === ticket.server).name;
            let category = await Client.channels.cache.find(c => c.name === serverLabel);

            if (!category) {
                await channel.guild.channels.create({
                    type: ChannelType.GuildCategory,
                    name: serverLabel,
                    permissionOverwrites: [{
                        id: channel.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }],
                });
            }

            category = await Client.channels.cache.find(c => c.name === serverLabel);
            await channel.setParent(category.id, { lockPermissions: false });
        } else if (level === 'networkadmin') {
            const networkAdminUsers = await channel.guild.roles.cache
                .get(levelId).members
                .map(m => m.user.id);

            const networkAdminPing = networkAdminUsers.length > 0 ? networkAdminUsers.map(u => `<@${u}>`).join(' ') : '```There are no users with the Network Admin role!```';
            if (ping) {
                await interaction.reply(networkAdminPing);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#df0000')
                    .setDescription('Ticket level changed to `Staff`!');
                await interaction.reply({ embeds: [embed] });
            }

            let category = await interaction.guild.channels.cache.find(c => c.name === '🔴 Network Admin Tickets');

            if (!category) {
                await channel.guild.channels.create({
                    type: ChannelType.GuildCategory,
                    name: '🔴 Network Admin Tickets',
                    permissionOverwrites: [{
                        id: channel.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }],
                });
            }

            category = await Client.channels.cache.find(c => c.name === '🔴 Network Admin Tickets');
            await channel.setParent(category.id, { lockPermissions: false });
        } else if (level === 'manager') {
            const managerUsers = await channel.guild.roles.cache
                .get(levelId).members
                .map(m => m.user.id);

            const managerPing = managerUsers.length > 0 ? managerUsers.map((u) => `<@${u}>`).join(' ') : '```There are no users with the Manager role!```';
            if (ping) {
                await interaction.reply(managerPing);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#df0000')
                    .setDescription('Ticket level changed to `Staff`!');
                await interaction.editReply({ embeds: [embed] });
            }

            let category = await interaction.guild.channels.cache.find(c => c.name === '🟡 Manager Tickets');

            if (!category) {
                await channel.guild.channels.create({
                    type: ChannelType.GuildCategory,
                    name: '🟡 Manager Tickets',
                    permissionOverwrites: [{
                        id: channel.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }],
                });
            }

            category = await Client.channels.cache.find(c => c.name === '🟡 Manager Tickets');
            await channel.setParent(category.id, { lockPermissions: false });
        } else if (level === 'owner') {
            const ownerUsers = await channel.guild.roles.cache
                .get(levelId).members
                .map((m) => m.id);

            const ownerPing = ownerUsers.length > 0 ? ownerUsers.map((u) => `<@${u}>`).join(' ') : '```There are no users with the Owner role!```';
            if (ping) {
                await interaction.reply(ownerPing);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#df0000')
                    .setDescription('Ticket level changed to `Staff`!');
                await interaction.reply({ embeds: [embed] });
            }

            let category = await interaction.guild.channels.cache.find(c => c.name === '⚪ Owner Tickets');

            if (!category) {
                await channel.guild.channels.create({
                    type: ChannelType.GuildCategory,
                    name: '⚪ Owner Tickets',
                    permissionOverwrites: [{
                        id: channel.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }],
                });
            }

            category = await Client.channels.cache.find(c => c.name === '⚪ Owner Tickets');
            await channel.setParent(category.id, { lockPermissions: false });
        } else if (level === 'staff') {
            const serverNotifications = JSON.parse(readFileSync(resolve(`./ticket-notifications/${currentServer}.json`)));

            const staff = await channel.guild.roles.cache
                .get(levelId).members
                .map(m => m.user.id)
                .filter(userId => serverNotifications.includes(userId));

            const staffPing = staff.length > 0 ? staff.map(u => `<@${u}>`).join(' ') : '```There is no staff this server :(```';
            if (ping) {
                await interaction.reply(staffPing);
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#df0000')
                    .setDescription('Ticket level changed to `Staff`!');
                await interaction.reply({ embeds: [embed] });
            }

            const ticketNotifications = JSON.parse(await File.get('ticket-notifications.json'));
            const serverLabel = ticketNotifications.find((server) => server.short === ticket.server).name;
            let category = await Client.channels.cache.find(c => c.name === serverLabel);

            if (!category) {
                await channel.guild.channels.create({
                    type: ChannelType.GuildCategory,
                    name: serverLabel,
                    permissionOverwrites: [{
                        id: channel.guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel],
                    }],
                });
            }

            category = await Client.channels.cache.find(c => c.name === serverLabel);
            await channel.setParent(category.id, { lockPermissions: false });
        } else {
            return;
        }

        await this.logTicketChange('level', {
            old: `<@&${ticket.level}>`,
            new: `<@&${levelId}>`,
        }, user, channel, ticket.ticketId);
        await this.changeEmbed(channel, ticket, 'level', levelId);

        const updatedTicket = JSON.parse(JSON.stringify(ticket));
        updatedTicket.level = levelId;

        writeFileSync(resolve(`./tickets/${channel.id}.json`), JSON.stringify(updatedTicket, null, 2));
    }

    static async silentClose(channel, user) {
        const ticket = JSON.parse(readFileSync(resolve(`./tickets/${channel.id}.json`)));

        await channel.delete();

        await this.logTicketChange('silentclose', undefined, user, channel, ticket.ticketId);

        unlinkSync(resolve(`./tickets/${channel.id}.json`));
    }
}