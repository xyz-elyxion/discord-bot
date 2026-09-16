const { Collection } = require("../LocalStore");

module.exports = new Collection("BotDatas", {
  password: null,
  cmdUsed: 0,
  count: 0,
});
