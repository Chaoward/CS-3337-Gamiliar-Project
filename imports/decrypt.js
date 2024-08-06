module.exports = {
    token: function() {
        let raw = require("../config.json").discord_token.split(',');
        let token = "";

        for (const charNum of raw) {
            token += String.fromCharCode( Number(charNum) );
        }

        return token;
    }
}