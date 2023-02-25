const { SlashCommandBuilder } = require("discord.js");
const { exit } = require("process");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("sd")
        .setDescription("Shutdowns the Bot"),
    async execute(interact) {
        console.log("Shutting Down...");
        await interact.reply("Goodbye :')");
        interact.client.destroy();
        exit();
    }
};