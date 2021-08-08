let mongoose = require("mongoose");

let schema = mongoose.Schema;

let transaction_historySchema = new schema({  
  wallet_id: { 
    type: schema.ObjectId, 
    ref: "wallets" 
  },  
  amount: {
    type: Number
  },
  transaction_type: {
    type: String,
    enum: ["debit", "credit"],
    default: "debit",
  },
  transaction_mode: {
    type: String,
    enum: ["gpay", "paytm", "card"],
    default: "card",
  },
  transfer_number: {
    type: Number
  },
  register_number:{
    type: Number
  }
},
  {
    collection: "transaction_history",
    timestamps: {},
  }
);

module.exports = mongoose.model("transaction_history", transaction_historySchema);