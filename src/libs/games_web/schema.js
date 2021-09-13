let mongoose = require("mongoose");

let schema = mongoose.Schema;

let games_webSchema = new schema({
  game_name: String,
  start_time: String,
  end_time: String,
  today_game_result: [{
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
    today_date: {
      type: Date,
      default: Date.now
    }
  }]
},
  {
    collection: "games_web",
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model("games_web", games_webSchema);
