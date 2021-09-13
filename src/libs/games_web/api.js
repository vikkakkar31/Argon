var games_webDb = require("./schema.js");

module.exports = {
  findOne: function (query, projection, options, callback) {
    try {
      games_webDb
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
      games_webDb.create(dataObj, function (err, result) {
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
      games_webDb.findOneAndUpdate(query, updation, options, function (err, result) {
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
      games_webDb.remove(query, function (err, result) {
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
      games_webDb
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
