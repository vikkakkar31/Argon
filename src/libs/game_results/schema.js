let mongoose = require("mongoose");

let schema = mongoose.Schema;

let game_resultsSchema = new schema({  
  game_id: {
    type: schema.ObjectId,
    ref: "games"
  },
  game_bet_id: {
    type: schema.ObjectId,
    ref: "game_bets"
  },
  winning_bet_number: Number,
  winning_amount: Number,
  winner_user_id: [{
    type: schema.ObjectId,
    ref: "users"
  }],
  createdDate: Date
},
  {
    collection: "game_results",
    timestamps: {},
  }
);

module.exports = mongoose.model("game_results", game_resultsSchema);
