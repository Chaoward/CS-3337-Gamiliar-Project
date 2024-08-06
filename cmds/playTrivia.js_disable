const { SlashCommandBuilder, MessageActionRow, MessageSelectMenu } = require('discord.js');
const { OpenAIApi, Configuration } = require('openai');
const dotenv = require('dotenv');
const stringSimilarity = require('string-similarity');

dotenv.config({ path: '.env' });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play-trivia')
    .setDescription('Play a game with the bot!'),

  async execute(interaction) {
    const question = await generateQuestion();
    console.log(`Question: ${question}`);
    const options = await generateOptions();
    console.log(`Options: ${options}`);

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('answer')
          .setPlaceholder('Select an option')
          .addOptions(options)
      );

    setTimeout(async () => {
      await interaction.reply({
        content: `Playing: ${question}`,
        components: [row]
      });
    }, 1000); // Delay the response by 1 second
  },
};

// Rest of the code...



async function generateQuestion() {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: 'Generate a multiple-choice trivia question:',
      max_tokens: 100,
      temperature: 0.8,
    });

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    return {
      status: 500,
      message: 'An error occurred during your request',
    };
  }
}

async function generateOptions() {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: 'Generate multiple-choice options:',
      max_tokens: 100,
      temperature: 0.8,
    });

    const optionsText = response.data.choices[0].text.trim();
    const options = optionsText.split('\n').map((option, index) => ({
      label: option.trim(),
      value: `option_${index}`,
    }));

    return options;
  } catch (error) {
    console.error(`Error with OpenAI API request: ${error.message}`);
    return [];
  }
}
