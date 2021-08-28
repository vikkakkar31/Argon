let express = require("express");
let router = express.Router();
let api = require("../libs/games/api");
let gamesDb = require("../libs/games/schema");
let validations = require("./validations");
router.post("/createGame",
    // validations.authenticateToken,
    function (req, res, next) {
        try {
            var data = req.body;
            if (data && Object.keys(data).length) {
                delete (data._id);
                console.log(data);
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
                ).sort();
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
    "/getTodaysGame",
    function (req, res, next) {
        try {
            var queryString = req;
            var projection = queryString.projection || {};
            projection.password = 0;
            var start = new Date(); //Start Date
            start.setHours(0,0,0,0);
            var end = new Date(); //End Date
            end.setHours(23,59,59,999);
            var query = {
                start_date: {$gte: start, $lt: end}
            };
            console.log(query, "QUERYYYY");
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