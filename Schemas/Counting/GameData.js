const { Collection } = require("../LocalStore");

module.exports = new Collection("GameData", {
  guildId: null,
  name: "undefined",
  lastCounter: "none",
  count: 0,
  totalCount: { right: 0, rong: 0 },
  highestCount: 0,
  saves: 2,
  saveSlot: 2,
  reaction: { success: "✅", fail: "❌", save: "⛑️", warn: "⚠️" },
});
