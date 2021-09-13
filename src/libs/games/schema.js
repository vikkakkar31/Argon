let mongoose = require("mongoose");

let schema = mongoose.Schema;

let gamesSchema = new schema({
  game_name: String,
  start_date: String,
  end_date: String,
  status: {
    type: String,
    enum: ["active", "deactive"],
    default: "active",
  },
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
    collection: "games",
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

module.exports = mongoose.model("games", gamesSchema);
