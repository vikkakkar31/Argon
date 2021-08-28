let express = require("express");
let router = express.Router();
let api = require("../libs/transaction_history/api");
let walletsApi = require("../libs/wallets/api");
let transaction_historyDb = require("../libs/transaction_history/schema");
let Walllets = require("../libs/wallets/schema");

let validations = require("./validations");

router.get(
  "/getPendingRequest",
  function (req, res, next) {
    try {
      var queryString = req;
      var projection = queryString.projection || {};
      projection.password = 0;
      var query = {
        transaction_status: 'pending'
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
router.post("/requestMoney",
  validations.authenticateToken,
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
  "/approveRequest",
  validations.autenticateGenuinUserForUpdate,
  validations.authenticateToken,
  function (req, res, next) {
    try {
      var data = req.body;
      if (Object.keys(data).length) {
        let query = {
          _id: data.transaction_id
        };
        api.update(query || {}, data, data.options || {}, function (err, transResponse) {
          if (err) {
            res.status(500).send({
              error: err,
            });
          } else {
            walletsApi.findOne({ _id: transResponse.wallet_id }, {}, {}, (err, result) => {
              let walletData = {};
              if (transResponse.transaction_type === 'debit') {
                walletData = {
                  total_amount: result.total_amount - transResponse.amount,
                }
              } else {
                walletData = {
                  total_amount: result.total_amount ? result.total_amount + transResponse.amount : transResponse.amount,
                }
              }
              walletsApi.update({ _id: transResponse.wallet_id } || {}, walletData, data.options || {}, function (err, response) {
                let resp = JSON.parse(JSON.stringify(transResponse));
                res.status(200).send(resp);
              })
            })
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
router.post(
  "/walletTransactionHistory",
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
  }
);

router.get(
  "/getTransactionsHistory",
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

      // let sortOrder = req.query.sortOrder;
      // let mySort = { ['plan_billing_period']: 'asc' };
      // if(req.query.sortField) {
      //     mySort = { [req.query.sortField]: sortOrder };
      // }

      let query = {};
      // if (queryString.query && queryString.query.plan_status) {
      //     query = { ...query, plan_status: queryString.query.plan_status };
      // }
      var queryString = req.query;
      transaction_historyDb.count(query, (err, result) => {
        transaction_historyDb.find(
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
        //).populate("wallet_id").sort();
      });

    } catch (err) {
      console.log(err.stack);
      res.status(500).send(err);
    }
  }
);

router.get(
  "/getTransactionHistory/:id",
  validations.authenticateToken,
  function (req, res, next) {
    try {
      var queryString = req;
      var projection = queryString.projection || {};
      projection.password = 0;
      var query = {
        wallet_id: req.params.id,
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
  "/getTransactionHistory/:walletId",
  validations.authenticateToken,
  function (req, res, next) {
    try {
      var queryString = req;
      var projection = queryString.projection || {};
      projection.password = 0;
      var query = {
        _id: req.params.walletId,
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

router.delete("/removeTransactionHistory", validations.authenticateToken,
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