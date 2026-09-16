const { LocalCache } = require("./LocalStore");
const { Logger } = require("../Structures/Functions/index");
const logger = new Logger();

const botDatas = require("./Bot/BotDatas");
const setupDatas = require("./Counting/SetupData");
const gameDatas = require("./Counting/GameData");
const languageDatas = require("./Server/LanguageData");
const userDatas = require("./User/UserData");

function ConnectLocal(client) {
  logger.success("Local data storage is ready (data/localdb.json).");
}

module.exports = {
  ConnectLocal,
  ConnectMongo: ConnectLocal, // kept for compatibility
  botDatas,
  setupDatas,
  gameDatas,
  userDatas,
  languageDatas,
};
