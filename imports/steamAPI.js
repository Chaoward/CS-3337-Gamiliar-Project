const fetch = require("node-fetch");
const fs = require("fs");
const { steam_key } = require("../config.json");
const { getGameList, getSteamID, addGame, addUser } = require("../data/jsonFunctions");

module.exports = {
    getGameDetails,
    fetchGames,
    fetchUserGames,
    getSteamGames
};


async function fetchGames() {
    const URL = `https://steamspy.com/api.php?request=tag&tag=Multiplayer`;

    saveObj = Object();

    try {
        fetch(URL).then(res => res.json()).then(body => {
            for (const keyId in body)
                saveObj[keyId] = body[keyId].name;

            fs.writeFileSync("./games.json", JSON.stringify(saveObj));
            return true;
        });
    }
    catch (e) {
        console.error(e);
        return false;
    }
}



async function getGameDetails(appid, callback) {
    const URL = `https://store.steampowered.com/api/appdetails?appids=${String(appid)}&filters=basic,genres,categories`;

    fetch(URL).then(res => res.json()).then(body => {
        const response = body[String(appid)];
        if (response.success && callback)
            callback(response.data);
        else if (callback)
            callback(null);

        return response.data;
    });
}



async function fetchUserGames(discordId, callback) {
    const steamID = getSteamID(discordId);
    const userGames = getGameList(discordId);
    //check if user has SteamID
    if (steamID == "" || steamID == null) {
        if (callback == undefined)
            return null;
        else
            return callback(null);
    }

    const URL = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steam_key}&steamid=${steamID}&include_played_free_games=true&format=json`;
    const games = require("../data/games.json");
    try {
        fetch(URL).then(res => res.json()).then(body => {
            const steamList = body.response.games;
            const newAdded = [];

            //filter MultiPlayer
            for (const entry of steamList) {
                //compare to games.json
                if (games[entry.appid] == null)
                    continue;

                //compare to user
                for (var i = 0; i < userGames.length && i > -1; i++) {
                    if (userGames[i] == entry.appid) {
                        i = -10;
                    }
                }
                //add if not found
                if (i > -1)
                    newAdded.push(String(entry.appid));
            }

            //save updated user data
            for (const ele of newAdded)
                addGame(discordId, ele);

            //call callback func if not null
            if (callback != null)
                callback(newAdded);

            return newAdded;
        });
    }
    catch (e) {
        console.log(e);
        if (callback == undefined)
            return null;
        else
            callback(null);
    }
}



async function getSteamGames(steamId, callback) {
    const games = require("../data/games.json");
    const url = `http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steam_key}&steamid=${steamId}&include_played_free_games=true&format=json`;
    try {
        fetch(url).then(res => res.json()).then((body) => {
            let steamList = body.response.games;

            //failed to get steam games
            if (!steamList) {
                if (callback)
                    callback(null);
                return null;
            }

            for (const i in steamList) {
                //removes non multiplayer tagged games
                if (games[steamList[i].appid] == null)
                    delete steamList[i];
            }

            //filter into a list of appids
            steamList = steamList.map(entry => entry.appid);

            if (callback)
                callback(steamList);
            return steamList;
        });
    }
    catch (e) {
        console.log(e);
        if (callback)
            return callback(null);
        return null;
    }
}