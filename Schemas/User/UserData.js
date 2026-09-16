const { Collection } = require("../LocalStore");

module.exports = new Collection("UserData", {
  userId: null,
  name: "undefined",
  score: 0,
  count: { right: 0, rong: 0 },
  saves: 2,
  saveSlot: 4,
  vote: { count: 0, time: new Date(0) },
});
