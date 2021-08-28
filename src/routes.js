const express = require("express");
const users = require("./routes/users");
const settings = require("./routes/settings");
const wallets = require("./routes/wallets");
const transaction_history = require("./routes/transaction_history");
const games = require("./routes/games");
const game_bets = require("./routes/game_bets");
const router = express.Router();

router.use("/users", users);
router.use("/settings", settings);
router.use("/wallets", wallets);
router.use("/transaction", transaction_history);
router.use("/games", games);
router.use("/game_bets", game_bets);
module.exports = router;
