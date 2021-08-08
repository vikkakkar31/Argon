let mongoose = require("mongoose");
let schema = mongoose.Schema;

let subscription_transactionsSchema = new schema(
  {
    user_id: { 
      type: schema.ObjectId, 
      ref: "users" 
    },
    planId: { 
      type: schema.ObjectId, 
      ref: "subscription_plans" 
    },
    amount: {
      type: Number
    },
    plan_billing_period: {
      type: String
    },
    paymentId: {
      type: String
    },
    status: {
      type: String
    },
    description: {
      type: String
    },
    rawResponse: {
      type: JSON
    },
    cycle_start: {
      type: Date
    },
    cycle_end: {
      type: Date
    }
  },
  {
    collection: "subscription_transactions",
    timestamps: {},
  }
);

module.exports = mongoose.model("subscription_transactions", subscription_transactionsSchema);

// {
//   id: 'pi_1Ig5unLcRVQ8nmyLDWwLiECt',
//   object: 'payment_intent',
//   amount: 5000,
//   amount_capturable: 0,
//   amount_received: 5000,
//   application: null,
//   application_fee_amount: null,
//   canceled_at: null,
//   cancellation_reason: null,
//   capture_method: 'automatic',
//   charges: {
//     object: 'list',
//     data: [ [Object] ],
//     has_more: false,
//     total_count: 1,
//     url: '/v1/charges?payment_intent=pi_1Ig5unLcRVQ8nmyLDWwLiECt'
//   },
//   client_secret: 'pi_1Ig5unLcRVQ8nmyLDWwLiECt_secret_lG4Z5pQCaSPbtx5AUa0HJLtYM',
//   confirmation_method: 'manual',
//   created: 1618395945,
//   currency: 'usd',
//   customer: null,
//   description: '3 Months Plan-plan Payment',
//   invoice: null,
//   last_payment_error: null,
//   livemode: false,
//   metadata: {},
//   next_action: null,
//   on_behalf_of: null,
//   payment_method: 'pm_1Ig5umLcRVQ8nmyL12d78Rpk',
//   payment_method_options: {
//     card: {
//       installments: null,
//       network: null,
//       request_three_d_secure: 'automatic'
//     }
//   },
//   payment_method_types: [ 'card' ],
//   receipt_email: null,
//   review: null,
//   setup_future_usage: null,
//   shipping: null,
//   source: null,
//   statement_descriptor: null,
//   statement_descriptor_suffix: null,
//   status: 'succeeded',
//   transfer_data: null,
//   transfer_group: null
// }