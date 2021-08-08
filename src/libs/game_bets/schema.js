let mongoose = require("mongoose");

let schema = mongoose.Schema;

let game_betsSchema = new schema({
  bet: [
    {
      bet_number: Number,
      user_bet:[{
        bet_amount: Number,
        user_id: { 
          type: schema.ObjectId, 
          ref: "users"
        }
      }]
    }
  ],
  inside_bet: [
    {
      bet_number: Number,
      user_bet:[{
        bet_amount: Number,
        user_id: { 
          type: schema.ObjectId, 
          ref: "users"
        }
      }]
    }
  ],
  outside_bet: [
    {
      bet_number: Number,
      user_bet:[{
        bet_amount: Number,
        user_id: { 
          type: schema.ObjectId, 
          ref: "users"
        }
      }]
    }
  ],
  game_id: { 
    type: schema.ObjectId, 
    ref: "games" 
  }
},
  {
    collection: "games",
    timestamps: {},
  }
);

module.exports = mongoose.model("game_bets", game_betsSchema);
