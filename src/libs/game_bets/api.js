var gameBetsDb = require("./schema.js");

module.exports = {
  findOne: function (query, projection, options, callback) {
    try {
      gameBetsDb
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
      gameBetsDb.create(dataObj, function (err, result) {
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
      gameBetsDb.findOneAndUpdate(query, updation, options, function (err, result) {
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
      gameBetsDb.remove(query, function (err, result) {
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
      gameBetsDb
        .find(query, projection, options)
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
