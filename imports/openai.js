const { GPT } = require('openai-api');
const { readFileSync } = require("fs");

const API_KEY_PATH = "./api_key.txt";

function apiKey() {
    let raw = String(readFileSync(API_KEY_PATH)).trim();
    return raw;
}

const chatGPT = new GPT({
  apiKey: apiKey(),
  engine: 'text-davinci-002',
  temperature: 0.7,
  maxTokens: 100,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
});

module.exports = {
  apiKey,
  chatGPT
};
