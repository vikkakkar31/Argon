let express = require("express");
let router = express.Router();
let api = require("../libs/subscription_transactions/api");
let subscription_transactionsDb = require("../libs/subscription_transactions/schema");
let validations = require("./validations");

router.post(
    "/usersTransactionsList",
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

            let sortOrder = req.query.sortOrder;
            let mySort = { ['createdAt']: 'desc' };
            if(req.query.sortField) {
                mySort = { [req.query.sortField]: sortOrder };
            }

            let query = {};
            if (queryString.body && queryString.body.user_id) {
                query = { ...query, user_id: queryString.body.user_id };
            }
            console.log(query);
            var queryString = req.query;
                subscription_transactionsDb.find(
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
                ).populate("user_id").sort(mySort);
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);

router.get(
    "/getTransactions",
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

            let sortOrder = req.query.sortOrder;
            let mySort = { ['plan_billing_period']: 'asc' };
            if(req.query.sortField) {
                mySort = { [req.query.sortField]: sortOrder };
            }

            let query = {};
            if (queryString.query && queryString.query.plan_status) {
                query = { ...query, plan_status: queryString.query.plan_status };
            }
            var queryString = req.query;
            subscription_transactionsDb.count(query, (err, result) => {
                subscription_transactionsDb.find(
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
                ).populate("user_id").sort(mySort);
            });

        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err);
        }
    }
);

router.get(
    "/getTransaction/:id",
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

router.delete("/removeTransaction", validations.authenticateToken,
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