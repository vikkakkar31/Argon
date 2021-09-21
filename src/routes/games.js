let express = require("express");
let router = express.Router();
let api = require("../libs/games/api");
let gameResultApi = require("../libs/game_results/api");
let transactionApi = require("../libs/transaction_history/api");
let gameBetsapi = require("../libs/game_bets/api");
let gamesDb = require("../libs/games/schema");
let validations = require("./validations");
router.post("/createGame",
    // validations.authenticateToken,
    function (req, res, next) {
        try {
            var data = req.body;
            if (data && Object.keys(data).length) {
                delete (data._id);
                api.add(data, function (err, response) {
                    if (err) {
                        res.status(500).send({ error: err });
                    } else {
                        res.status(200).send(response);
                    }
                });
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
    "/updateGame/:id",
    // validations.autenticateGenuinUserForUpdate,
    validations.authenticateToken,
    function (req, res, next) {
        try {
            let query = req.query;
            query._id = req.params.id;
            var data = req.body;
            if (Object.keys(data).length) {
                api.findOne(
                    { _id: query._id },
                    {},
                    {},
                    (err, result) => {
                        let update = result;
                        update.today_game_result.push(data.today_game_result)
                        api.update(query || {}, update, data.options || {}, function (err, gamesResponse) {
                            if (err) {
                                res.status(500).send({
                                    error: err,
                                });
                            } else {
                                var start = new Date();
                                start.setHours(0, 0, 0, 0);
                                var end = new Date();
                                end.setHours(23, 59, 59, 999);
                                gameBetsapi.findAll({ createdDate: { $gte: start, $lt: end }, game_id: req.params.id },
                                    {},
                                    {},
                                    (err, result) => {
                                        if (result.length) {
                                            result.forEach((userBets) => {
                                                let totalWInAmount = 0
                                                if (userBets.bets.length) {
                                                    let userCurrentBets = userBets.bets.filter((bet) => {
                                                        return bet.bet_number === Number(data.today_game_result.winning_bet_number)
                                                    });
                                                    if (userCurrentBets.length) {
                                                        userCurrentBets.forEach((userCurrentBet) => {
                                                            totalWInAmount = (userCurrentBet.bet_amount * 90) + totalWInAmount;
                                                        })
                                                    }
                                                }

                                                if (userBets.inside_bets.length) {
                                                    let userCurrentInBets = userBets.inside_bets.filter((bet) => {
                                                        return bet.bet_number === Number(data.today_game_result.winning_bet_number)
                                                    });
                                                    if (userCurrentInBets.length) {
                                                        userCurrentInBets.forEach((userCurrentBet) => {
                                                            totalWInAmount = (userCurrentBet.bet_amount * 9) + totalWInAmount;
                                                        })
                                                    }
                                                }
                                                if (userBets.outside_bets.length) {
                                                    let userCurrentOutBets = userBets.outside_bets.filter((bet) => {
                                                        return bet.bet_number === Number(data.today_game_result.winning_bet_number)
                                                    });
                                                    if (userCurrentOutBets.length) {
                                                        userCurrentOutBets.forEach((userCurrentBet) => {
                                                            totalWInAmount = (userCurrentBet.bet_amount * 9) + totalWInAmount;
                                                        })
                                                    }
                                                }
                                                if (totalWInAmount) {
                                                    let requestWinAmountData = {
                                                        "wallet_id": userBets.wallet_id,
                                                        "amount": totalWInAmount,
                                                        "transaction_type": "credit",
                                                        "transaction_mode": "win"
                                                    }
                                                    transactionApi.add(requestWinAmountData, function (err, response) {
                                                        if (err) {
                                                            res.status(500).send({ error: err });
                                                        } else {
                                                            let addData = {
                                                                game_id: req.params.id,
                                                                ...data.today_game_result,
                                                                winning_amount: totalWInAmount,
                                                            }
                                                            gameResultApi.add(addData, function (err, resultRes) {
                                                                if (err) {
                                                                    res.status(500).send({ error: err });
                                                                } else {
                                                                    console.log(resultRes, "resultRes");
                                                                }
                                                            })
                                                        }
                                                    });
                                                }

                                            })
                                            response = JSON.parse(JSON.stringify(gamesResponse));
                                            res.status(200).send(response);
                                        } else {
                                            response = JSON.parse(JSON.stringify(gamesResponse));
                                            res.status(200).send(response);
                                        }
                                    })
                            }
                        });
                    })
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
    "/getGames",
    function (req, res, next) {
        try {
            var queryString = req;
            var projection = queryString.projection || {};
            projection.password = 0;
            var pageNo = parseInt(req.query.pageNumber);
            var size = parseInt(req.query.pageSize);
            var option = {};
            if (pageNo < 0 || pageNo === 0) {
                response = { "error": true, "message": "invalid page number, should start with 1" };
                return res.json(response);
            }
            option.skip = size * (pageNo - 1);
            option.limit = size;
            queryString.options = option;

            //let sortOrder = req.query.sortOrder;
            // let mySort = { ['plan_billing_period']: 'asc' };
            // if(req.query.sortField) {
            //     mySort = { [req.query.sortField]: sortOrder };
            // }

            let query = {};
            // if (queryString.query && queryString.query.plan_status) {
            //     query = { ...query, plan_status: queryString.query.plan_status };
            // }
            var queryString = req.query;
            gamesDb.count(query, (err, result) => {
                gamesDb.find(
                    query,
                    projection,
                    queryString.options || {},
                    function (err, response) {
                        if (err) {
                            res.status(500).send({
                                error: err,
                            });
                        } else {
                            res.status(200).send({ totalCount: result, response });
                        }
                    }
                ).sort({ _id: 1 });
            });

        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);

router.get(
    "/getGame/:id",
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

router.get(
    "/getLatestResult",
    function (req, res, next) {
        try {
            var queryString = req;
            var projection = queryString.projection || {};
            projection.password = 0;
            var start = new Date(); //Start Date
            start.setHours(0, 0, 0, 0);
            var end = new Date(); //End Date
            end.setHours(23, 59, 59, 999);
            var query = {
                start_date: { $gte: start, $lt: end }
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

router.delete("/removeGame", validations.authenticateToken,
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