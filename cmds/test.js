const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");



//TEST COMMAND  --- WILL BE REMOVED WHEN DEPLOYED
module.exports = {
    //NOTE: any changes in 'data' must be registered again. View main.js/loadCommands() for detail
    data: new SlashCommandBuilder()
        .setName("test")
        .setDescription("testing other function"),

    async execute(interact) {
        interact.reply({
            content: "Ping",
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(this.data.name + "_btn")
                            .setLabel("Click!")
                            .setStyle(ButtonStyle.Primary)
                    )
            ]
        });
    },

    async button(interact) {
        if (interact.customId == this.data.name + "_btn")
            interact.reply("Pong!");
    }
};