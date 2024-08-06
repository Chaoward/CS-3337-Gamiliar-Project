const { SlashCommandBuilder } = require("discord.js");
const { exit } = require("process");


//shut down the bot ---- DEVELOPER ONLY
module.exports = {
    data: new SlashCommandBuilder()
        .setName("sd")
        .setDescription("Shutdowns the Bot"),
    async execute(interact) {
        const devIds = require("../config.json").dev_id;
        if (!devIds.includes(String(interact.user.id)))
            return interact.reply("Developers Only :)");

        console.log("Shutting Down...");
        await interact.reply("Goodbye :')");
        interact.client.destroy();
        exit();
    }
};