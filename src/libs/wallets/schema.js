let mongoose = require("mongoose");

let schema = mongoose.Schema;

let walletsSchema = new schema({
  user_id: { 
    type: schema.ObjectId, 
    ref: "users" 
  },
  transactionId: [{ 
    type: schema.ObjectId, 
    ref: "transaction_history" 
  }],
  phone_number: String,
  total_amount: String,
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  }
},
  {
    collection: "wallets",
    timestamps: {},
  }
);

module.exports = mongoose.model("wallets", walletsSchema);
