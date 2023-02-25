const { SlashCommandBuilder } = require("discord.js");

//USE THIS AS A TEMPLATE
module.exports = {
    //NOTE: any changes in 'data' must be registered again. View main.js/loadCommands() for detail
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Say Hello to the bot!")
        .addStringOption(option => 
            option
                .setName("extra")
                .setDescription("extra")
        ),
        
    //main function of the command
    async execute(interact) {
        //reading the args of a command
        const arg = interact.options.getString("extra");
        if ( (arg == null ? "" : arg.toLowerCase()) === "there") {
            interact.reply({
                embeds: [{
                    color: 0xFFD700,
                    image: {
                        url: "https://c.tenor.com/smu7cmwm4rYAAAAC/general-kenobi-kenobi.gif"
                    }
                }]
            });
            return;
        }

        await interact.reply("Hello, I'm Mr. Bot. This is my code. I eat the bug.");
    }
};