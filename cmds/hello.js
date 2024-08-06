const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hello")
        .setDescription("Say Hello to the bot!")
        .addStringOption(option =>
            option
                .setName("extra")
                .setDescription("extra")
        ),

    help: {
        content: "With the H consonant sound and go into the AY as in SAY diphthong. Make sure you drop your jaw enough for the first half of that diphthong. He-e, hey, hey. We also heard 'hi' a few times. Again, it's stressed, so we have that shape of a stressed syllable, hi. Hi. It begins with the H consonant sound, and we have the AI as in BUY diphthong. Again, make sure you drop your jaw enough for the first half of that diphthong. Hi, hi. Look at that jaw drop we have on the AI as in BUY diphthong. We also heard 'hello'. This is a two-syllable word with stress on the second syllable. da-DA, hello. So, it's that second syllable with the up-down shape of the voice. The first syllable will be pretty flat: he- he-, he-. It begins with the H consonant and has the EH as in BED vowel. But this is very quick, he- he-, hello. The second syllable begins with the L consonant, so the tongue will come up here, ll, ll, and touch the roof of the mouth just behind the teeth. Hello. Then we have the OH as in NO diphthong. Drop your jaw for the first half of the sound, and make sure you round your lips for the second half. Hello. Hello."
    },


    async execute(interact) {
        const arg = interact.options.getString("extra");

        //bot response if user type "there" in the extra textbox
        if (arg === "there") {
            await interact.reply({
                embeds: [{
                    color: 0xFFD700,
                    image: {
                        url: "https://c.tenor.com/smu7cmwm4rYAAAAC/general-kenobi-kenobi.gif"
                    }
                }]
            });
            return;
        }
        await interact.reply("Hello, I'm Mr. Bot. This is my code. I eat the bug.");
    }
};
