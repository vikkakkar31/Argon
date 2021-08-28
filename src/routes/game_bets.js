let express = require("express");
let router = express.Router();
let api = require("../libs/game_bets/api");
let gameBetsDb = require("../libs/game_bets/schema");
let validations = require("./validations");

router.post("/createGameBets",
    // validations.authenticateToken,
    function (req, res, next) {
        try {
            var data = req.body;
            if (data && Object.keys(data).length) {
                api.findOne(
                    { game_id: data.game_id },
                    {},
                    {},
                    (err, result) => {
                        if (result) {
                            let bet, user_bet;
                            bet = data.bets || [];
                            user_bet = bet[0].user_bet || [];
                            let update = result;
                            if (data.type === 'bets') {
                                let oldIndex = result.bets.findIndex((el) => el.bet_number === bet[0].bet_number);
                                let oldBets = result.bets.find((el) => el.bet_number === bet[0].bet_number);
                                let newAmount = [];
                                if (oldBets && oldBets.id) {
                                    newAmount = oldBets.user_bet.find((user) => user.bet_amount != bet[0].user_bet[0].bet_amount);
                                    let oldUserIndex = oldBets.user_bet.findIndex((el) => el.bet_amount === bet[0].user_bet[0].bet_amount);
                                    if (oldUserIndex === -1) {
                                        oldBets.user_bet[0].bet_amount = bet[0].user_bet[0].bet_amount;
                                        update.bets[oldIndex] = oldBets;
                                    }
                                } else {
                                    update.bets.push(...bet)
                                }
                            } else if (data.type === 'inside_bets') {
                                let oldIndex = result.inside_bets.findIndex((el) => el.bet_number === bet[0].bet_number);
                                let oldBets = result.inside_bets.find((el) => el.bet_number === bet[0].bet_number);
                                let newAmount = [];
                                if (oldBets && oldBets.id) {
                                    newAmount = oldBets.user_bet.find((user) => user.bet_amount != bet[0].user_bet[0].bet_amount);
                                    let oldUserIndex = oldBets.user_bet.findIndex((el) => el.bet_amount === bet[0].user_bet[0].bet_amount);
                                    if (oldUserIndex === -1) {
                                        oldBets.user_bet[0].bet_amount = bet[0].user_bet[0].bet_amount;
                                        update.bets[oldIndex] = oldBets;
                                    }
                                } else {
                                    update.inside_bets.push(...bet)
                                }
                            } else if (data.type === 'outside_bets') {
                                let oldIndex = result.outside_bets.findIndex((el) => el.bet_number === bet[0].bet_number);
                                let oldBets = result.outside_bets.find((el) => el.bet_number === bet[0].bet_number);
                                let newAmount = [];
                                if (oldBets && oldBets.id) {
                                    newAmount = oldBets.user_bet.find((user) => user.bet_amount != bet[0].user_bet[0].bet_amount);
                                    let oldUserIndex = oldBets.user_bet.findIndex((el) => el.bet_amount === bet[0].user_bet[0].bet_amount);
                                    if (oldUserIndex === -1) {
                                        oldBets.user_bet[0].bet_amount = bet[0].user_bet[0].bet_amount;
                                        update.bets[oldIndex] = oldBets;
                                    }
                                } else {
                                    update.outside_bets.push(...bet)
                                }
                            }
                            api.update({ game_id: data.game_id }, update, {}, (err, response) => {
                                if (err) {
                                    res.status(500).send({ error: err });
                                } else {
                                    res.status(200).send(response);
                                }
                            });
                        } else {
                            api.add(data, function (err, response) {
                                if (err) {
                                    res.status(500).send({ error: err });
                                } else {
                                    res.status(200).send(response);
                                }
                            });
                        }
                    })

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
            var query = {};
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