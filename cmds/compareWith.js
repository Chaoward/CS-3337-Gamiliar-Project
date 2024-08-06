const { EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require('discord.js');
const games = require("../data/games.json");
const { compareWith } = require("../data/jsonFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("comparewith")
        .setDescription("Comparing the game libraries of two users. After the command type in two usernames.")
        .addStringOption(option =>
            option
                .setName("extra")
                .setDescription("Mention a user to compare with")
        ),

    async execute(interact) {
        const arg = interact.options.getString("extra");
        if (arg == null)
            return await interact.reply("You are now trying to use the compare with command in order to do so you must add two parameters.");

        const dummyArray = compareWith(interact.user.id,  getMentionId(arg));
        if (!dummyArray)
            return await interact.reply("Nothing to Compare");

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Compare With ' + interact.guild.members.cache.get(getMentionId(arg)).displayName )
            .setDescription('These are the games that you two have in common.\n\n');

        for (i = 0; i < dummyArray.length; i++) {
            embed.data.description += games[String(dummyArray[i])] + "\n";
        }

        await interact.reply({embeds: [embed]});

    }
}

function getMentionId(msg) {
    msg = msg.split(">")[0];
    while ( isNaN(msg.charAt(0)) )
        msg = msg.substring(1);
    return msg;
}