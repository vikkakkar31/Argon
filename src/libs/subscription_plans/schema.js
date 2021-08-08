let mongoose = require("mongoose");
let schema = mongoose.Schema;

let subscription_plansSchema = new schema(
  {
    plan_name: {
        type: String
    },
    plan_description: {
      type: String
    },
    plan_price: {
      type: Number
    },
    plan_billing_period: {
      type: String
    },
    plan_status: {
      type: String,
      default: "on",
      enum: ["on", "off"],
    },
  },
  {
    collection: "subscription_plans",
    timestamps: {},
  }
);

module.exports = mongoose.model("subscription_plans", subscription_plansSchema);
