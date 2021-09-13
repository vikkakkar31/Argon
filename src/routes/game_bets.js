let express = require("express");
let router = express.Router();
let api = require("../libs/game_bets/api");
let walletsApi = require("../libs/wallets/api");
let transactionApi = require("../libs/transaction_history/api");
let gameBetsDb = require("../libs/game_bets/schema");
let validations = require("./validations");

router.post("/createGameBets",
    validations.authenticateToken,
    function (req, res, next) {
        try {
            var data = req.body;
            if (data && Object.keys(data).length) {
                walletsApi.findOne({ _id: data.wallet_id }, {}, {}, (err, result) => {
                    let walletData = {};
                    if (result.total_amount >= data.total_ammount_spend) {
                        walletData = {
                            total_amount: result.total_amount - data.total_ammount_spend,
                        }
                        walletsApi.update({ _id: data.wallet_id } || {}, walletData, data.options || {}, function (walletRrr, walletResponse) {
                            if (walletRrr) {
                                res.status(500).send({ error: err });
                            } else {
                                api.add(data, function (err, response) {
                                    if (err) {
                                        res.status(500).send({ error: err });
                                    } else {
                                        let transData = {
                                            "wallet_id": data.wallet_id,
                                            "amount": data.total_ammount_spend,
                                            "transaction_type": "debit",
                                            "transaction_mode": "bets",
                                            "transaction_status": "approved"
                                        }
                                        transactionApi.add(transData, function (err, tranResponse) {
                                            if (err) {
                                                res.status(500).send({ error: err });
                                            } else {
                                                res.status(200).send(response);
                                            }
                                        });
                                    }
                                });
                            }
                        })
                    } else {
                        res.status(200).send({ message: 'User Dont have sufficient funds for this bets' });
                    }
                })
                // api.findOne(
                //     { game_id: data.game_id },
                //     {},
                //     {},
                //     (err, result) => {
                //         if (result) {
                //             let bets, inside_bets, outside_bets;
                //             bets = data.bets || [];
                //             inside_bets = data.inside_bets || [];
                //             outside_bets = data.outside_bets || [];
                //             let update = result;
                //             if (bets.length) {
                //                 bets.forEach((bet) => {
                //                     let oldIndex = result.bets.findIndex((el) => el.bet_number === bet.bet_number);
                //                     let oldBets = result.bets.find((el) => el.bet_number === bet.bet_number);
                //                     let newAmount = [];
                //                     if (oldBets && oldBets.id) {
                //                         bet.user_bet.forEach((userBet) => {
                //                             newAmount = oldBets.user_bet.find((user) => user.bet_amount != userBet.bet_amount);
                //                             let oldUserIndex = oldBets.user_bet.findIndex((el) => el.bet_amount === userBet.bet_amount);
                //                             if (oldUserIndex === -1) {
                //                                 oldBets.user_bet[0].bet_amount = userBet.bet_amount;
                //                                 update.bets[oldIndex] = oldBets;
                //                             }
                //                         })
                //                     } else {
                //                         update.bets.push(bet)
                //                     }
                //                 })
                //             }
                //             if (inside_bets.length) {
                //                 inside_bets.forEach((bet) => {
                //                     let oldIndex = result.inside_bets.findIndex((el) => el.bet_number === bet.bet_number);
                //                     let oldBets = result.inside_bets.find((el) => el.bet_number === bet.bet_number);
                //                     let newAmount = [];
                //                     if (oldBets && oldBets.id) {
                //                         bet.user_bet.forEach((userBet) => {
                //                             newAmount = oldBets.user_bet.find((user) => user.bet_amount != userBet.bet_amount);
                //                             let oldUserIndex = oldBets.user_bet.findIndex((el) => el.bet_amount === userBet.bet_amount);
                //                             if (oldUserIndex === -1) {
                //                                 oldBets.user_bet[0].bet_amount = userBet.bet_amount;
                //                                 update.inside_bets[oldIndex] = oldBets;
                //                             }
                //                         })
                //                     } else {
                //                         update.inside_bets.push(bet)
                //                     }
                //                 })
                //             }
                //             if (outside_bets.length) {
                //                 outside_bets.forEach((bet) => {
                //                     let oldIndex = result.outside_bets.findIndex((el) => el.bet_number === bet.bet_number);
                //                     let oldBets = result.outside_bets.find((el) => el.bet_number === bet.bet_number);
                //                     let newAmount = [];
                //                     if (oldBets && oldBets.id) {
                //                         bet.user_bet.forEach((userBet) => {
                //                             newAmount = oldBets.user_bet.find((user) => user.bet_amount != userBet.bet_amount);
                //                             let oldUserIndex = oldBets.user_bet.findIndex((el) => el.bet_amount === userBet.bet_amount);
                //                             if (oldUserIndex === -1) {
                //                                 oldBets.user_bet[0].bet_amount = userBet.bet_amount;
                //                                 update.outside_bets[oldIndex] = oldBets;
                //                             }
                //                         })
                //                     } else {
                //                         update.outside_bets.push(bet)
                //                     }
                //                 })
                //             }

                //             update.user_id.push(data.user_id);
                //             api.update({ game_id: data.game_id }, update, {}, (err, response) => {
                //                 if (err) {
                //                     res.status(500).send({ error: err });
                //                 } else {
                //                     res.status(200).send(response);
                //                 }
                //             });
                //         } else {

                //         }
                //     })

            } else {
                res.status(422).send({
                    message: "Required fields are missing.",
                });
            }
        } catch (err) {
            console.log(err.stack);
            res.status(500).send({ error: err });
        }
    });

router.put(
    "/updateGameBets/:id",
    validations.autenticateGenuinUserForUpdate,
    validations.authenticateToken,
    function (req, res, next) {
        try {
            var data = req.body;
            if (Object.keys(data).length) {
                let query = req.query;
                query._id = req.params.id;
                delete (data._id);
                delete (data.__v);
                api.update(query || {}, data, data.options || {}, function (err, response) {
                    if (err) {
                        res.status(500).send({
                            error: err,
                        });
                    } else {
                        response = JSON.parse(JSON.stringify(response));
                        res.status(200).send(response);
                    }
                });
            } else {
                res.status(404).send({
                    message: "Error in data updation.",
                });
            }
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);
router.get(
    "/getGameBets",
    function (req, res, next) {
        try {
            var queryString = req;
            var projection = queryString.projection || {};
            projection.password = 0;
            var query = req.query;
            api.findAll(
                query,
                projection,
                queryString.options || {},
                function (err, response) {
                    if (err) {
                        res.status(500).send({
                            error: err,
                        });
                    } else {
                        res.status(200).send(response);
                    }
                }
            );
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);

router.get(
    "/getGameBets/:id",
    validations.authenticateToken,
    function (req, res, next) {
        try {
            var queryString = req;
            var projection = queryString.projection || {};
            projection.password = 0;
            var query = {
                _id: req.params.id,
            };
            api.findAll(
                query,
                projection,
                queryString.options || {},
                function (err, response) {
                    if (err) {
                        res.status(500).send({
                            error: err,
                        });
                    } else {
                        res.status(200).send(response);
                    }
                }
            );
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);

router.post(
    "/userGameBets",
    validations.authenticateToken,
    function (req, res, next) {
        try {
            var queryString = req;
            var projection = queryString.projection || {};
            projection.password = 0;
            let query = {};
            if (queryString.body && queryString.body.user_id && queryString.body.game_id) {
                query = { ...query, user_id: queryString.body.user_id, game_id: queryString.body.game_id };
            }
            api.findAll(
                query,
                projection,
                queryString.options || {},
                function (err, response) {
                    if (err) {
                        res.status(500).send({
                            error: err,
                        });
                    } else {
                        res.status(200).send(response);
                    }
                }
            );
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);

router.delete("/removeGameBets", validations.authenticateToken,
    function (req, res, next) {
        try {
            var data = req.body;
            let query = {
                _id: data._id
            };
            api.delete(
                query,
                function (err, removeRes) {
                    if (err) {
                        res.status(500).send({
                            error: err,
                        });
                    } else {
                        console.log(removeRes, "removeRes");
                        let query = {
                        };
                        api.findAll(
                            query,
                            {},
                            {},
                            function (err, response) {
                                if (err) {
                                    res.status(500).send({
                                        error: err,
                                    });
                                } else {
                                    res.status(200).send(response);
                                }
                            }
                        );
                    }
                }
            );
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    });
module.exports = router;