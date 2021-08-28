let mongoose = require("mongoose");

let schema = mongoose.Schema;

let game_betsSchema = new schema({
  bets: [
    {
      bet_number: Number,
      user_bet: [{
        bet_amount: Number,
        user_id: {
          type: schema.ObjectId,
          ref: "users"
        },
        createdDate: Date
      }]
    }
  ],
  inside_bets: [
    {
      bet_number: Number,
      user_bet: [{
        bet_amount: Number,
        user_id: {
          type: schema.ObjectId,
          ref: "users"
        },
        createdDate: Date
      }]
    }
  ],
  outside_bets: [
    {
      bet_number: Number,
      user_bet: [{
        bet_amount: Number,
        user_id: {
          type: schema.ObjectId,
          ref: "users"
        },
        createdDate: Date
      }]
    }
  ],
  game_id: {
    type: schema.ObjectId,
    ref: "games"
  },
  user_id: [{
    type: schema.ObjectId,
    ref: "users"
  }],
  createdDate: Date
},
  {
    collection: "game_bets",
    timestamps: {},
  }
);

module.exports = mongoose.model("game_bets", game_betsSchema);
