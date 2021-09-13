let mongoose = require("mongoose");
const { required } = require("nconf");

let schema = mongoose.Schema;

let game_results_webSchema = new schema({

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
    collection: "game_results_web",
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model("game_results_web", game_results_webSchema);
