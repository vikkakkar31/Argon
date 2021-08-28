let mongoose = require("mongoose");

let schema = mongoose.Schema;

let gamesSchema = new schema({
  game_name: String,
  start_date: Date,
  end_date: Date,
},
  {
    collection: "games",
    timestamps: {},
  }
);

module.exports = mongoose.model("games", gamesSchema);
