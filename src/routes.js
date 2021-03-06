const express = require("express");
const users = require("./routes/users");
const settings = require("./routes/settings");
const wallets = require("./routes/wallets");
const transaction_history = require("./routes/transaction_history");
const games = require("./routes/games");
const game_bets = require("./routes/game_bets");
const game_results = require("./routes/game_results");
const game_results_web = require("./routes/game_results_web");
const games_web = require("./routes/games_web");
const router = express.Router();


router.use("/users", users);
router.use("/settings", settings);
router.use("/wallets", wallets);
router.use("/transaction", transaction_history);
router.use("/games", games);
router.use("/games_web", games_web);
router.use("/game_bets", game_bets);
router.use("/game_results", game_results);
router.use("/game_results_web", game_results_web);

module.exports = router;
