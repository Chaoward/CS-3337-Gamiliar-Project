const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getSteamGames } = require("../imports/steamAPI")
const DB = require("../data/jsonFunctions");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("removesteam")
        .setDescription("Remove Steam ID and Steam game out of the database!!!"),

    async execute(interact) {
        interact.reply({
            content: "Click Yes if you want to remove your Steam ID and Steam game out of the database!!!",
            components: [

                //creating the button for the users to confirm their choice
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(this.data.name)
                            .setLabel("YES")
                            .setStyle(ButtonStyle.Primary)
                    )
            ],
            ephemeral: true
        });
    },

    //intialize the button and call the function if the button is pressed
    async button(interact) {
        await interact.reply("Removing Steam!");
        removeSteam(interact.user.id, interact);
    }
};

//removeSteam function definition
function removeSteam(discordId, interact) {
    let steamID = DB.getSteamID(discordId);
    if (steamID == "") {
        console.log("steam ID is not available!!");
        return;
    }


    const userGamesList = DB.getGameList(discordId);
    //const userSteamGames = getSteamGames(steamID);

    getSteamGames(steamID, (userSteamGames) => {
        //get the list of gameID as individual string
        const userAppIDs = userSteamGames.map(appid => String(appid));

        //get a list of similar game 
        const gameToRemove = userGamesList.filter(appID => userAppIDs.includes(appID));


        for (id of gameToRemove) {
            DB.removeGame(discordId, id);
        }
        if (gameToRemove.length != 0) {
            DB.setSteamID(discordId, "");
        }

        interact.editReply({
            content: "",
            embeds: [{
                title: "Steam Account Removed!",
                description: "Your account is no longer linked and all games tied to that account have been removed!",
                color: 0xffaa99
            }],
            ephemeral: true
        });
    });
}