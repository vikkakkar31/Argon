var userDb = require("./schema.js");

module.exports = {
  find: function (query, projection, options, callback) {
    try {
      userDb
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
  findOne: function (query, projection, options, callback) {
    try {
      userDb
        .findOne(query, projection, options)
        .exec(function (err, result) {
          if (err) {
            callback(err, null);
          } else {
            if (result) {
              callback(null, { data: result });
            } else {
              callback(null, { data: null });
            }
          }
        });
    } catch (e) {
      console.log(e);
      callback(e, null);
    }
  },
  add: function (userObj, callback) {
    try {
      userDb.create(userObj, function (err, result) {
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
      if (updation.image) {
        userDb.findOne(query, { image: 1 }, {}, function (error, res) {
          if (res) {
            userDb.findOneAndUpdate(query, { $set: updation }, options, function (err, result) {
              if (err) {
                callback(err, null);
              } else {
                callback(null, result);
              }
            });
          } else {
            callback(error, null);
          }
        });
      } else {
        let update = { $set: updation };
        if (Object.keys(updation)[0].indexOf("$") !== -1) {
          update = updation;
        }
        userDb.findOneAndUpdate(query, update, options, function (err, result) {
          if (err) {
            callback(err, null);
          } else if (!result) {
            callback('no result', null);
          } else {
            callback(null, result);
          }
        });
      }
    } catch (e) {
      console.log(e);
      callback(e, null);
    }
  },
  delete: function (query, callback) {
    try {
      userDb.remove(query, function (err, result) {
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
      userDb
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
