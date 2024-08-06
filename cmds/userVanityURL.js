const fetch = require("node-fetch");
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { setSteamID, addUser } = require("../data/jsonFunctions");
const { fetchUserGames } = require("../imports/steamAPI");      //import fetchUserGames function

module.exports = {
    data: new SlashCommandBuilder()
        .setName("linksteam")
        .setDescription("Adds user to the database"),

    async execute(interaction) {
        const modal = new ModalBuilder()
            //gets the cmd's name from data
            .setCustomId(`${this.data.name}_vanityUrlModal`)
            .setTitle('Enter your Vanity URL');
        const userVanityName = new TextInputBuilder()
            //no need for cmd name, just for the modal customID
            .setCustomId(`vanityName`)
            .setLabel('Make sure your Steam profile is public...')

            //required field
            .setStyle(TextInputStyle.Short);

        //adds an actionRow then we add the textInput to it
        modal.addComponents(new ActionRowBuilder().addComponents(userVanityName));
        await interaction.showModal(modal);
    },

    //To get data from a model make this function that calls when they submit the model
    async modelSubmit(interact) {
        this.userSteamID(interact);
    },

    async userSteamID(interact) {
        const token = require("../config.json").steam_key;
        const parse = parseURL(interact.fields.getTextInputValue('vanityName'));

        if (parse == null)
            return interact.reply("Invalid URL");

        if (parse.isVanity)
            var url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${token}&vanityurl=${parse.id}`;
        else {
            sendPrompt(interact, parse.id, this.data.name);
            return;
        }

        //resolve vanity and get steamID
        fetch(url).then(res => res.json()).then(async body => {
            if (body.response == null || body.response.success !== 1)
                return interact.reply("Steam Profile Not Found");

            sendPrompt(interact, body.response.steamid, this.data.name);
        })
    },

    async button(interact) {
        if (interact.customId == this.data.name + '_1')
            return interact.message.delete();
        else {
            const id = interact.customId.split('_')[1];


            //body.response.steamid is not in scope so we carry the steamid through the customId

            //adduser if not exist
            addUser(interact.user.id);

            setSteamID(interact.user.id, id);

            fetchUserGames(interact.user.id);

            await interact.reply({
                content: "Steam libray is linked with user DB.",
                embeds: [],
                components: []
            });
        }
    }
}



//===== parseURL =====================================
/** function that returns parsing data from the passed in
 *  Steam profile URL.
 * 
 * returns obj
 * { isVanity: bool, id: numberStr | vanityName }
 */
//====================================================
function parseURL(profileURL) {
    var parseData = {};
    const heading = "https://steamcommunity.com";

    if (!profileURL.startsWith(heading))
        return parseData = {isVanity: true, id: profileURL};

    var urlList = profileURL.split("/");
    try {
        //check vanityURL
        if (profileURL.includes("id/")) {
            let potentialId = "";
            while (true) {
                if (urlList[urlList.length-1] == "id")
                    break;
                potentialId = urlList.pop();
            }

            if (potentialId == "" || potentialId == null)
                return null;
            
            parseData.id = potentialId;
            parseData.isVanity = true;    
        }
        else if (profileURL.includes("profiles/")) {
            let potentialId = "";
            while (true) {
                if (urlList[urlList.length-1] == "profiles")
                    break;
                potentialId = urlList.pop();
            }

            if (potentialId == "" || potentialId == null)
                return null;

            parseData.id = potentialId;
            parseData.isVanity = false;
        }
        else
            return null;

        return parseData;
    }
    catch (e) {
        console.log(e);
        return null;
    }
}




function sendPrompt(interact, steamId, cmdName) {
    interact.reply(
        {
            content: 'Is this your profile? ' + interact.fields.getTextInputValue('vanityName'),
            components: [
                new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(cmdName + '_' + String(steamId)) //true
                            .setLabel("Yes")
                            .setStyle(ButtonStyle.Primary)
                    )
            ],
            ephemeral: true
        }
    );
}