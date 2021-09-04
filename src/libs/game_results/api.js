var gameResultsDb = require("./schema.js");

module.exports = {
  findOne: function (query, projection, options, callback) {
    try {
      gameResultsDb
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
      gameResultsDb.create(dataObj, function (err, result) {
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
      gameResultsDb.findOneAndUpdate(query, updation, options, function (err, result) {
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
      gameResultsDb.remove(query, function (err, result) {
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
      gameResultsDb
        .find(query, projection, options)
        .populate('game_id')
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
