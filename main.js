const Discord = require("discord.js");
const fs = require("fs");

const CMD_FILE_PATH = "./cmds/";
const DEV_GUILD_ID = "326923077625839626";
const BOT_ID = "";
const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers
    ]
});


//===== loadCommands =========================
/** Where the command files will be loaded to
 * a Collection(hash-map) on the bot Client.
 * Will Register to discord servers when told by
 * the arguments pass through the terminal.
 * 
 * Collection entry : <commandName, commandObj>
 * Terminal args
 *      '1' : registers globally to all servers
 *      '2' : registers on to one local server
 *            with DEV_GUILD_ID. (RECOMMENDED)
 */
//============================================
async function loadCommands() {
    client.commands = new Discord.Collection();     //declares a new Collection, hash map, to client
    const { REST, Routes } = require("discord.js");
    const cmdJSONList = [];

    //loads the command files to a Collection on the Client
    console.log("Loading Commands to the Bot");
    for (const file of fs.readdirSync(CMD_FILE_PATH).filter(file => file.endsWith(".js"))) {
        const command = require(CMD_FILE_PATH + `${file}`);

        client.commands.set(command.data.name, command);
        cmdJSONList.push(command.data.toJSON());
    }

    //Register as slash commands on Discord
    //NOTE: It looks like we just need to do it once so I have it check for an argument when running the program on terminal.
    //      Any new commands added/updated in SlashCommandBuilder will need to be registered,
    //      so add '1'(global) or '2'(local server) with space after 'node .' when running in terminal
    try {
        //checking for terminal args
        const { argv } = require("process");
        if ( argv[2] == null ) return;
        console.log("Registering Commands to the Server");

        //register
        const rest = new REST({version: "10"}).setToken( String(fs.readFileSync("./token.txt")) );
        if ( argv[2] == "1" ) {         //Global
            await rest.put(
                Routes.applicationCommands(BOT_ID),     
                { body: cmdJSONList }
            );
        }
        else if ( argv[2] == "2" ) {    //local server
            await rest.put(
                Routes.applicationGuildCommands(BOT_ID, DEV_GUILD_ID),
                { body: cmdJSONList }
            );
        }
        
        //TODO: options for deleting slash commands

    } catch (error) {
        console.error(error);
    }
}


//===== Interaction Create ================================================
/** This is where the slash commands gets read, it is considered an "intereaction"
 *  so we have to identify if it is a command. Buttons and form submitions goes here
 *  as well so we will need a way to identify each.
*/
client.on("interactionCreate", (interact) => {
    //command execution
    try {
        const command = client.commands.get(interact.commandName);

        if (command == null) throw "Command Error Message Here!";
        command.execute(interact);

        console.log("Executed: \"" + command.data.name + "\"");
    } catch (error) {
        if (typeof (error) == String)
            interact.reply(error);
        else
            console.error(error);
    }
});
//===== *END* Interaction Create *END* ===================================


//runs when the bot logs in
client.on("ready", () => {
    console.log("Bot Logged In!");
});


loadCommands();
client.login( String(fs.readFileSync("./token.txt")) );