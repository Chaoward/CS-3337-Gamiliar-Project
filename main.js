const Discord = require("discord.js");
const fs = require("fs");
const { token } = require("./imports/decrypt");


const CMD_FILE_PATH = "./cmds/";
const DEV_GUILD_ID = require("./config.json").dev_server_id;
const BOT_ID = require("./config.json").bot_id;

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.MessageContent
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
 * to delete a command from the registry, after args '1' or '2'
 *      'del' : deletes all commands with the commandId passed after 'del' arg
 *      'del-all' : deletes all commands from the server or globally
 * 
 * NOTE: when deleting, the command ID is needed which it can be found by
 *      right-clicking the slash cmd on discord and clicking 'copy ID'.
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
        if (argv[2] == null) return;
        console.log("Registering Commands to the Server");

        //register
        const rest = new REST({ version: "10" }).setToken(token());
        if (argv[2] == "1") {         //Global
            if (argv[3] == "del") {
                for (let i = 4; i < argv.length; i++)
                    await rest.delete(Routes.applicationCommand(BOT_ID, Routes.applicationGuildCommand().argv[i]));
            }
            else if (argv[3] == "del-all") {
                await rest.put(Routes.applicationCommands(BOT_ID), { body: [] })
                    .then(console.log("Unregistered all commands Globally"));
                return;
            }
            else
                await rest.put(
                    Routes.applicationCommands(BOT_ID),
                    { body: cmdJSONList }
                );
        }
        else if (argv[2] == "2") {    //local server
            if (argv[3] == "del") {
                for (let i = 4; i < argv.length; i++)
                    await rest.delete(Routes.applicationGuildCommand(BOT_ID, DEV_GUILD_ID, argv[i]));
            }
            else if (argv[3] == "del-all") {
                await rest.put(Routes.applicationGuildCommands(BOT_ID, DEV_GUILD_ID), { body: [] })
                    .then(console.log("Unregistered all commands in Guild!"));
                return;
            }
            else
                await rest.put(
                    Routes.applicationGuildCommands(BOT_ID, DEV_GUILD_ID),
                    { body: cmdJSONList }
                );
        }
    } catch (error) {
        console.error(error);
    }
}


//===== Interaction Create ================================================
/** This is where the slash commands gets read, it is considered an "intereaction"
 *  so we have to identify if it is a command. Buttons and form submitions gets
 * sent to here as well (see Non-command interaction line).
*/
//----- command execution --------------------------
client.on("interactionCreate", (interact) => {
    if (!interact.isCommand()) return;
    try {
        const command = client.commands.get(interact.commandName);

        if (command == null) throw "Command Not Found!";
        command.execute(interact);

        console.log("Executed: \"" + command.data.name + "\"");

    } catch (error) {
        if (typeof (error) == String)
            interact.reply(error);
        else
            console.error(error);
    }
});

//----- Non-command Interactions --------------------------
/** To identity specific interactions from certain commands the customId
 * should follow the format
 * 
 * customId = commandName_someIdName
 * EXAMPLE: customID for a button from the command 'test' should be
 *      "test_btn"      Note that it oes not need to say 'btn' after '_'
 *                      it is just a unique id you give to help your
 *                      own custom cmds.
*/
client.on("interactionCreate", (interact) => {
    if (BOT_ID !== interact.client.user.id || interact.isCommand()) return;     //ensures that the bot reads interactions specfically generated by it
    try {
        //gets the command the interaction is tied to
        const cmd = client.commands.get(interact.customId.split("_")[0]);

        //call appropriate func if tied to that command
        if (cmd == null) throw "Interaction not tied to any Command";

        if (interact.isButton())
            cmd.button(interact);
        else if (interact.isModalSubmit())
            cmd.modelSubmit(interact);
        else if (interact.isAnySelectMenu())
            cmd.selectMenu(interact);
        else
            throw "No Matching Interaction!";
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
client.login(token());
