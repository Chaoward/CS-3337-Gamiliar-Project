const fs = require('fs');


const path = require('path');
const { isDataView } = require('util/types');


const dataPath = path.join(__dirname, 'userDatabase');
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
}

//---------------------------------------------------

function getSteamID(userID) {
  const filePath = path.join(__dirname, 'userDatabase', `${userID}.json`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`User with ID ${userID} not found.`);
    return;
  }

  // Read the user file
  const user = JSON.parse(fs.readFileSync(filePath));

  //get steamID
  const steamID = user.steamID;
  return steamID;
}

//---------------------------------------------------

function setSteamID(userID, steamID) {
  const filePath = path.join(__dirname, 'userDatabase', `${userID}.json`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`User with ID ${userID} not found.`);
    return;
  }

  // Read the user file
  const user = JSON.parse(fs.readFileSync(filePath));

  //setting steamID
  user.steamID = steamID;
  fs.writeFileSync(filePath, JSON.stringify(user));
  console.log(`SteamID for user ${userID} updated to ${steamID}`);
}

//---------------------------------------------------

function getGameList(userID) {
  const filePath = path.join(__dirname, 'userDatabase', `${userID}.json`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`User with ID ${userID} not found.`);
    return;
  }

  // Read the user file
  const user = JSON.parse(fs.readFileSync(filePath));

  //getting the game list
  const gameList = user.gameList;
  return gameList;
}

//---------------------------------------------------

function readJsonDB(callback) {
  fs.readFile('testDB.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      if (typeof callback === 'function') {
        callback(err);
      }
      return;
    }
    const jsonData = JSON.parse(data);
    if (typeof callback === 'function') {
      callback(null, jsonData);
    }
  });
}

//---------------------------------------------------

function addUser(userID) {
  const userFilePath = path.join(dataPath, `${userID}.json`);

  if (fs.existsSync(userFilePath))
    return console.log(`User ${userID} already has a file.`);

  // User file doesn't exist yet, so create a new one
  const userData = {
    steamID: "",
    gameList: []
  };

  fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));

  console.log(`User '${userID}' created!`);

  /*
  try {
    // Read the user's JSON file
    const userFilePath = path.join(dataPath, `${userID}.json`);
    const data = fs.readFileSync(userFilePath, 'utf8');
    const userData = JSON.parse(data);

    // Update the user's game list if the game isn't already in it
    const gameIndex = userData.gameList.indexOf(gameID);
    if (gameIndex === -1) {
      userData.gameList.push(gameID);
    }

    // Write the updated user data back to the JSON file
    fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));

    console.log(`Game '${gameID}' added to user '${userID}'`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // User file doesn't exist yet, so create a new one
      const userData = {
        steamID: "",
        gameList: [gameID]
      };
      const userFilePath = path.join(dataPath, `${userID}.json`);
      fs.writeFileSync(userFilePath, JSON.stringify(userData, null, 2));

      console.log(`User '${userID}' created with game '${gameID}'`);
    } else {
      console.log(err);
    }
  }
  */
}

//---------------------------------------------------

function removeGame(userID, gameName) {
  const filePath = path.join(__dirname, 'userDatabase', `${userID}.json`);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.log(`User with ID ${userID} not found.`);
    return;
  }

  // Read the user file
  const user = JSON.parse(fs.readFileSync(filePath));

  // Remove the game from the gameList
  const gameIndex = user.gameList.indexOf(gameName);
  if (gameIndex > -1) {
    user.gameList.splice(gameIndex, 1);
    console.log(`Game ${gameName} removed from user ${userID}.`);
  } else {
    console.log(`User ${userID} does not have game ${gameName}.`);
    return;
  }

  // Write the updated user file
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
}

//---------------------------------------------------

function addGame(userID, gameID) {
  const filePath = path.join(__dirname, 'userDatabase', `${userID}.json`);

  // Checkd if file exists
  if (!fs.existsSync(filePath)) {
    addUser(userID);
  }

  // Reads the user file
  const user = JSON.parse(fs.readFileSync(filePath));

  // Checkd if the game is already in the gameList
  if (user.gameList.includes(gameID)) {
    console.log(`User ${userID} already has game ${gameID}.`);
    return;
  }

  // Add the game to the gameList
  user.gameList.push(gameID);
  console.log(`Game ${gameID} added to user ${userID}.`);

  // Write the updated user file
  fs.writeFileSync(filePath, JSON.stringify(user, null, 2));
}

//---------------------------------------------------

function compareWith(selfID, otherID) {
  // file path for each user
  const selfFilePath = path.join(__dirname, 'userDatabase', `${selfID}.json`);
  const otherFilePath = path.join(__dirname, 'userDatabase', `${otherID}.json`);
  //check if file exists 
  if (!fs.existsSync(selfFilePath)) {
    return console.log(`Self User with ID ${selfID} not found.`);
  }
  if (!fs.existsSync(otherFilePath)) {
    return console.log(`Other User with ID ${otherID} not found.`);
  }

  // Read gameList for both users
  const selfGames = JSON.parse(fs.readFileSync(selfFilePath)).gameList;
  const otherGames = JSON.parse(fs.readFileSync(otherFilePath)).gameList;

  // compare the game lists and return common games
  const commonGames = selfGames.filter(game => otherGames.includes(game));
  console.log("Compare Run Successfully!!!")

  //common game is empty
  if (Object.keys(commonGames).length == 0) {

    console.log("There is no common game!!!")
  }
  return commonGames; //return a json list of common games

}

//---------------------------------------------------

const filePath = path.join(__dirname, 'testDB.json');
// list all unique games in users Library. // 
function allUserGames(callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      return;
    }

    const json = JSON.parse(data);
    const gameIDs = [];

    for (const user of json.listOfUser) {
      const gameIDArr = Object.values(user)[0].gameID;
      for (const gameID of gameIDArr) {
        if (!gameIDs.includes(gameID)) {
          gameIDs.push(gameID);
        }
      }
    }
    callback(gameIDs);

  });

}





// function that takes discordIdList and compares and buckets the list of discordIDS with games.
function compareAll(discordIdList) {
  const buckets = {};


  discordIdList.forEach(id => {
    try {
      //define path for id
      const selfPath = path.join(__dirname, 'userDatabase', `${id}.json`);
      const userData = JSON.parse(fs.readFileSync(selfPath));


      // bucket gameID with userIDs
      const gameIdList = userData.gameList;
      gameIdList.forEach(gameId => {
        if (!buckets[gameId]) {
          buckets[gameId] = [];
        }
        buckets[gameId].push(id);
      });
    } catch (error) {
      console.error(`Error ${id} does not exist ${error}`);
    }
  });

  //filter out less then 2
  for (const key in buckets) {
    if (buckets[key].length < 2)
      delete buckets[key];
  }

  return buckets;
}


module.exports = {
  readJsonDB,
  addUser,
  allUserGames,
  removeGame,
  addGame,
  compareWith,
  compareAll,
  getSteamID,
  setSteamID,
  getGameList
}