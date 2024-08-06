const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const fs = require("fs");
const path = require('path');

const CMD_FILE_PATH = path.join(__dirname, '/');
const commandFiles = fs.readdirSync(CMD_FILE_PATH).filter(file => file.endsWith('.js'));
module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Get a list of commands available and how they work.")
        .addStringOption(option => 
            option
                .setName("command")
                .setDescription("Name of the command to get help on.")
            ),
    
    help: {
        content: "Hmmm... How would you need help with `/help` if you're already using it?",
        embeds: [{
            color: 0xffaa33,
            image: {
                url: "https://media.tenor.com/XG3xX1YRHmwAAAAC/think-emoji.gif"
            }
        }]
    },
        
    //main function of the command
    async execute(interaction) {
        const { options } = interaction;
        const args = options.getString("command");
        const commands = [];
    
        // iterate over command files and add each command's data object to the commands array
        for (const file of commandFiles) {
            const command = require(path.join(CMD_FILE_PATH, file));
            commands.push(command);
        }
    
        if (args) {
            // check if the argument matches the name of a command in the commands array
            const matchingCommand = commands.find(command => command.data.name === args);
    
            if (matchingCommand && matchingCommand.help) {
                // if the matching command has a help obj, get it
                return await interaction.reply( matchingCommand.help );
            } else {
                // if the matching command doesn't have a help function, send a "help not found" reply
                return await interaction.reply("Help not found for that command.");
            }
        } else {
            // if there are no arguments, display the list of commands
            let embeds = [{
                color: 0x936733,
                title: "Commands Available",
                description: "To see help for a specific command, use `/help [command]`.", 
                fields: []
            }];
            
            for (let j = 0, i = 0; i < commands.length; ++i) {
                const command = commands[i];
                
                //add new field
                if (embeds[j].fields.length < 25) {
                    embeds[j].fields.push({
                        name: `**/${command.data.name}:**`,
                        value: `${command.data.description}`,
                        inline: true
                    });
                }
                //add new embed
                else {
                    embeds.push({color: embeds[0].color, fields: []});
                    j++;
                }
            }

            return await interaction.reply({embeds: embeds});
        }
    }
};
