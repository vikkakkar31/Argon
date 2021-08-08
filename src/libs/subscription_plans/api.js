var subscription_plansDb = require("./schema.js");

module.exports = {
  findOne: function (query, projection, options, callback) {
    try {
      subscription_plansDb
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
      subscription_plansDb.create(dataObj, function (err, result) {
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
      subscription_plansDb.findOneAndUpdate(query, updation, options, function (err, result) {
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
      subscription_plansDb.remove(query, function (err, result) {
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
      subscription_plansDb
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
