var transaction_historyDb = require("./schema.js");

module.exports = {
  findOne: function (query, projection, options, callback) {
    try {
      transaction_historyDb
        .findOne(query, projection, options)
        .exec(function (err, result) {
          if (err) {
            callback(err, null);
          } else {
            if (result) {
              callback(null, result);
            } else {
              callback(null, null);
            }
          }
        });
    } catch (e) {
      console.log(e);
      callback(e, null);
    }
  },
  add: function (dataObj, callback) {
    try {
      transaction_historyDb.create(dataObj, function (err, result) {
        if (err) {
          callback(err, null);
        } else {
          delete result.password;
          callback(null, result);
        }
      });
    } catch (e) {
      console.log(e);
      callback(e, null);
    }
  },
  update: function (query, updation, options, callback) {
    try {
      transaction_historyDb.findOneAndUpdate(query, updation, options, function (err, result) {
        if (err) {
          callback(err, null);
        } else if (!result) {
          callback('no result', null);
        } else {
          callback(null, result);
        }
      });
    } catch (e) {
      console.log(e);
      callback(e, null);
    }
  },
  delete: function (query, callback) {
    try {
      transaction_historyDb.remove(query, function (err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, result);
        }
      });
    } catch (e) {
      console.log(e);
      callback(e, null);
    }
  },
  findAll: function (query, projection, options, callback) {
    try {
      transaction_historyDb
        .find(query, projection, options)
        .populate('wallet_id')
        .sort({ _id: -1 })
        .exec(function (err, result) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, result);
          }
        });
    } catch (e) {
      console.log(e);
      callback(e, null);
    }
  },
};
