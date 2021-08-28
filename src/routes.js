const express = require("express");
const users = require("./routes/users");
const settings = require("./routes/settings");
const subscription_plans = require("./routes/subscription_plans");
const subscription_transactions = require("./routes/subscription_transactions");
const wallets = require("./routes/wallets");
const transaction_history = require("./routes/transaction_history");
const games = require("./routes/games");
const game_bets = require("./routes/game_bets");
const game_results = require("./routes/game_results");
const router = express.Router();

router.use("/users", users);
router.use("/settings", settings);
router.use("/subscription_plans", subscription_plans);
router.use("/subscription_transactions", subscription_transactions);
router.use("/wallets", wallets);
router.use("/transaction_history", transaction_history);
router.use("/games", games);
router.use("/game_bets", game_bets);
router.use("/game_results", game_results);

module.exports = router;
