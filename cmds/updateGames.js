const { SlashCommandBuilder } = require('discord.js');
const { fetchUserGames } = require("../imports/steamAPI");
const GAMES = require("../data/games.json");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("updatelib")
        .setDescription("fetches and saves your multiplayer games"),

    help: {
        content: "Refeshes your library with Steam if linked"
    },

    async execute(interact) {

        //retrieve the steam id from the database to update the steam game list from steam server
        await interact.reply("Updating...");
        fetchUserGames(interact.user.id, (newGames) => {
            if (newGames == null) {
                interact.editReply({
                    content: "",
                    embeds: [{
                        title: "Somthing Went Wrong when Fetching Games",
                        description: "Make sure your steam account is **public**"
                    }]
                });
                return;
            }

            //make a string of the list of games
            let list_str = [];
            for (const gameId of newGames) {
                list_str.push(GAMES[String(gameId)] + "\n");
            }

            interact.editReply({
                content: "",
                embeds: [{
                    title: list_str.length ? "Update Library" : "No Games to Add",
                    description: list_str.length ? "ADD:\n" + list_str : "You're up to date"
                }]
            });
        });
    }
}
