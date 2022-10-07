import fetch from 'node-fetch';

export class Minecraft {
    static async getUUID(username) {
        const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

        if (res.status !== 200) {
            return undefined;
        }

        const json = await res.json();
        return json.id;
    }

    static async getUsername(uuid) {
        const res = await fetch(`https://api.mojang.com/user/profile/${uuid}`);

        if (res.status !== 200) {
            return undefined;
        }

        const json = await res.json();
        return json.name;
    }

    static async getAvatar(uuid) {
        const res = await fetch(`https://crafatar.com/renders/body/${uuid}?scale=10&default=MHF_Steve&overlay`);

        if (res.status !== 200) {
            return undefined;
        }

        return res.url;
    }
}