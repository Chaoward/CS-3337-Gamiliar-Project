
const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const { addGame } = require("../data/jsonFunctions");
const { basicSearch } = require("../data/gamesJsonFunctions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addgame')
    .setDescription('Add multiple games to the database'),
  async execute(interaction) {

    const modal = new ModalBuilder()
      .setCustomId(`${this.data.name}_gameNameInput`)
      .setTitle('Add games to the database');

    const nameInput = new TextInputBuilder()
      .setCustomId(`${this.data.name}_gameNameInput`)
      .setLabel('Enter the name of the game')
      .setStyle(TextInputStyle.Short);

    const firstActionRow = new ActionRowBuilder().addComponents(nameInput);


    modal.addComponents(firstActionRow);
    await interaction.showModal(modal);
  },


  //generate a list of game that are added
  async selectMenu(interaction) {
    const games = require("../data/games.json");
    addGame(interaction.user.id, String(interaction.values[0]));
    await interaction.reply({
      content: "Added " + games[interaction.values[0]],
      ephemeral: true
    });
  },

  //search the game with similar name from the textbox and generate a dropdown list of the game to add
  async modelSubmit(interaction) {
    //if (!interaction.isModalSubmit()) return;
    const dropdown = new StringSelectMenuBuilder()
      .setCustomId("addgames");
    const games = require("../data/games.json");
    const name = interaction.fields.getTextInputValue('addgames_gameNameInput');

    //name of game passed into basic search
    for (const gameId of basicSearch(name)) {
      dropdown.addOptions({
        label: games[gameId],
        value: gameId
      });
    }

    if (dropdown.options.length < 1)
      return await interaction.reply({
        content: "No Games Found From Search!",
        ephemeral: true
      }); 

    await interaction.reply({
      content: "Choose a Game",
      components: [new ActionRowBuilder().addComponents(dropdown)],
      ephemeral: true
    });
  }
};

