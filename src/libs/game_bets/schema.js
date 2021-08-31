let mongoose = require("mongoose");

let schema = mongoose.Schema;

let game_betsSchema = new schema({
  bets: [
    {
      bet_number: Number,
      bet_amount: Number,
      createdDate: { type: Date, default: Date.now }
    }
  ],
  inside_bets: [
    {
      bet_number: Number,
      bet_amount: Number,
      createdDate: { type: Date, default: Date.now }
    }
  ],
  outside_bets: [
    {
      bet_number: Number,
      bet_amount: Number,
      createdDate: { type: Date, default: Date.now }
    }
  ],
  game_id: {
    type: schema.ObjectId,
    ref: "games"
  },
  user_id: {
    type: schema.ObjectId,
    ref: "users"
  },
  wallet_id: {
    type: schema.ObjectId,
    ref: "wallets"
  },
  total_ammount_spend: Number,
  createdDate: { type: Date, default: Date.now }
},
  {
    collection: "game_bets",
    timestamps: {},
  }
);

module.exports = mongoose.model("game_bets", game_betsSchema);
