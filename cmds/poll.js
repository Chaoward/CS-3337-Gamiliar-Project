const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ModalBuilder } = require("discord.js");
const { compareAll } = require("../data/jsonFunctions");
const context = require("../imports/contextData");

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll to choose which game to play with other users'),

  help: {
    content: "execute the command and follow the prompted steps to create a poll. You can only choose the top 25 common games from the server."
  },

  async execute(interaction) {
    sendPollForm(interaction, this.data);
  },

  async selectMenu(interact) {
    selectMenu_sendPrompt(interact, this.data);
  },

  async button(interact) {
    switch (interact.customId.split("_")[1]) {
      case "prompt":
        button_prompt(interact, this.data);
      break;
      
      case "vote":
        button_vote(interact, this.data);
      break;

      default:
        return console.log("[ERROR]: /poll No Button Match");
    }
  }
}



async function sendPollForm(interact, cmdData) {
  const games = require("../data/games.json");
  const dropdown = new StringSelectMenuBuilder()
    .setCustomId(cmdData.name + "_form")
    .setMinValues(2)
    .setMaxValues(5)
    .setPlaceholder("Select at least Two Games to Poll");

  //all members even if offline; 
  memberIds = (await interact.guild.members.fetch()).map(member => member.id);
  const commonGames = compareAll(memberIds);

  // sort the games by count of users who play it by using array of arrays
  const topGames = Object.entries(commonGames).sort((a, b) => {
    return b[1].length - a[1].length;
  });

  //add top 25 as options
  for (let i = 0; i < topGames.length && i < 25; ++i) {
    dropdown.addOptions(
      {
        label: games[topGames[i][0]],
        value: topGames[i][0]
      }
    );
  }

  //save context data
  context.setAttribute(cmdData.name + "_" + String(interact.user.id), {
    stage: "form",
    poll: []
  });

  await interact.reply({
    embeds: [{
      title: `Choose 2 to 5 from the top ${dropdown.options.length} Games to Poll`,
      description: "Min: 2, Max: 5"
    }],
    components: [new ActionRowBuilder().addComponents(dropdown)],
    ephemeral: true
  });
}



async function selectMenu_sendPrompt(interact, cmdData) {
  const metadata = context.getAttribute(cmdData.name + "_" + interact.user.id);
  if (!metadata) return;
  if (metadata.stage != "form") return;


  const games = require("../data/games.json");
  let polledGames = interact.values;

  //update state/context
  metadata.stage = "prompt";
  metadata.poll = polledGames;  //save polledGames to context
  context.setAttribute(cmdData.name + "_" + String(interact.user.id), metadata);

  const embed = {
    title: "Confirm Games to Poll?",
    description: `${polledGames.reduce((finalStr, id) => finalStr + games[id] + "\n", "")}`,
    color: 0x77aa77
  };

  const button = new ButtonBuilder()
    .setCustomId(cmdData.name + "_prompt")
    .setLabel("Confirm?")
    .setStyle(ButtonStyle.Success);

  await interact.reply({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(button)],
    ephemeral: true
  });
}



async function button_vote(interact, cmdData) {
  const metadata = context.getAttribute(cmdData.name + "_" + String(interact.message.id));
  if (!metadata) return expire(interact);

  const choice = interact.customId.split("_")[2];
  
  //----- END ---------------------------------------------------------
  if (choice == "end" && interact.user.id == metadata.userId) {
    //remove poll from context
    context.removeAttribute(cmdData.name + "_" + String(interact.message.id));

    //count votes and update embed
    let count = [];
    for (let i = 0; i < metadata.poll.length; ++i)
      count.push(0);
    for (const i of Object.values(metadata.votes) ) {       //<gameId, intCount>
      count[i] += 1;
    }

    //field embeds
    const games = require("../data/games.json");
    const fields = [];
    for (let i in count) {
      i = Number(i);
      fields.push({
        name: games[String(metadata.poll[i])],
        value: String(count[i]),
        inline: true
      });
    }

    await interact.update({
      embeds: [{
        author: {
          name: interact.user.username,
          icon_url: interact.user.avatarURL()
        },
        color: 0x00ff00,
        title: "Poll Results",
        fields: fields
      }],
      components: []
    });
    return;
  }
  else if (choice == "end")
    return;

  //----- NUMBER VOTE ----------------------------------------------
  const games = require("../data/games.json");
  //change vote of user to new index (i-1)
  metadata.votes[String(interact.user.id)] = Number(choice);

  //save updateed metadata
  context.setAttribute(cmdData.name + "_" + String(interact.message.id), metadata);

  //hidden reply
  console.log(`User ${String(interact.user.id)} voted for ${games[ metadata.poll[Number(choice)] ]}`);
  await interact.reply({
    content: `You voted for ${games[ metadata.poll[Number(choice)] ]}`,
    ephemeral: true
  });
}



async function button_prompt(interact, cmdData) {
  const metadata = context.getAttribute(cmdData.name + "_" + interact.user.id);
  if (!metadata) return;
  if (metadata.stage != "prompt") return;

  await interact.reply("Generating Poll...");

  const polledGames = metadata.poll;

  //remove current metadata
  context.removeAttribute(cmdData.name + "_" + interact.user.id);

  //add polled games to embed
  const embed = {
    author: {
      name: interact.user.username,
      icon_url: interact.user.avatarURL()
    },
    title: "Vote on the Games Below",
    description: "",
    color: 0x997733
  };

  const games = require("../data/games.json");
  const buttons = [];

  for (let i in polledGames) {
    i = Number(i);
    embed.description += `${i + 1}.) ${games[polledGames[i]]}\n`;
    //make a button for each game
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`${cmdData.name}_vote_${i}`)
        .setStyle(ButtonStyle.Primary)
        .setLabel( String(i+1) )
    );
  }

  //send message and save msgID as a new attribute with vote list and poll list
  await interact.editReply({
    embeds: [embed],
    components: [
      new ActionRowBuilder().addComponents(buttons),
      new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`${cmdData.name}_vote_end`)
            .setStyle(ButtonStyle.Danger)
            .setLabel("End Poll")
        )
    ],
    content: "@here"
  }).then( (message) => {
    context.setAttribute(`${cmdData.name}_${String(message.id)}`, {
      poll: polledGames,
      votes: {},
      userId: interact.user.id
    });
  });
}



function expire(interact) {
  interact.update({
    embeds: [{
      title: "Poll Expired!"
    }],
    components: []
  });
}