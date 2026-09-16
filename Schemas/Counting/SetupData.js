const { Collection } = require("../LocalStore");

module.exports = new Collection("SetupData", {
  guildId: null,
  setupChannel: null,
  math: true,
  numOnly: false,
});
