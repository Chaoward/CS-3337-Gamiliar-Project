const { readFileSync } = require("fs");
const TOKEN_PATH = "./token.txt";

module.exports = {
    token: function() {
        let raw = String(readFileSync(TOKEN_PATH)).split(",");
        let token = "";

        for (const charNum of raw) {
            token += String.fromCharCode( Number(charNum) );
        }

        return token;
    }
}