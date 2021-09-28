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
  last_user_bid: Number,
  winner_user_id: [{
    type: schema.ObjectId,
    ref: "users"
  }],
  createdDate: Date
},
  {
    collection: "game_results",
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model("game_results", game_resultsSchema);
