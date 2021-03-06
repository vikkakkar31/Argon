let express = require("express");
let router = express.Router();
let passport = require("passport");
let bcrypt = require("bcrypt-nodejs");
let jwt = require("jsonwebtoken");
let settings = require("../../config/config.json");
require("../libs/auth");
let settingsApi = require("../libs/settings/api");
let api = require("../libs/users/api");
let userDb = require("../libs/users/schema");
let validations = require("./validations");
let CryptoJS = require("crypto-js");
let mailService = require("../libs/mailService.js");

let secretKey = '';
if (settings.stripeKeys.mode == 'live') {
  secretKey = settings.stripeKeys.secretKey_live;
} else {
  secretKey = settings.stripeKeys.secretKey_test;
}
const stripe = require('stripe')(secretKey);


router.post("/signin", validations.verfiyUserSignin, (req, res, next) => {
  try {
    if ((req.body.email && req.body.password)) {
      req.body.verifiedUser = false;
      passport.authenticate("user-login", (error, user) => {
        if (error) {
          return res.status(500).send(error);
        } else {
          req.logIn(user, (err) => {
            if (err) {
              return res.status(500).send({
                error: err,
              });
            }
            return;
          });
          let userData = {
            email: user.email,
            _id: user._id,
          };
          var token = jwt.sign(userData, settings.secret, {
            expiresIn: "10 days",
          });
          user.token = token;
          res.status(200).send(user);
        }
      })(req, res, next);
    } else {
      return res.status(422).send({
        message: "Please provide Email and Password for Login",
      });
    }
  } catch (err) {
    console.log(err.stack);
    res.status(500).send(err);
  }
});
router.post("/mobileSignin", validations.verfiyUserMobileSignin, (req, res, next) => {
  try {
    if ((req.body.phone_number && req.body.password)) {
      req.body.verifiedUser = false;
      passport.authenticate("user-mobile-login", (error, user) => {
        if (error) {
          return res.status(500).send(error);
        } else {
          req.logIn(user, (err) => {
            if (err) {
              return res.status(500).send({
                error: err,
              });
            }
            return;
          });
          let userData = {
            phone_number: user.phone_number,
            _id: user._id,
          };
          var token = jwt.sign(userData, settings.secret, {
            expiresIn: "10 days",
          });
          user.token = token;
          res.status(200).send(user);
        }
      })(req, res, next);
    } else {
      return res.status(422).send({
        message: "Please provide Email and Password for Login",
      });
    }
  } catch (err) {
    console.log(err.stack);
    res.status(500).send(err);
  }
});

router.post("/signup", validations.verfiyUserSignup, async (req, res, next) => {
  try {
    passport.authenticate("user-signup", async (error, data) => {
      try {
        if (error) {
          return res.status(error.status).send(error);
        } else {
          var dataReturn = { ...data._doc };
          await req.logIn(data, (err) => {
            if (err) {
              return res.status(500).send({
                error: err,
              });
            }
            let userData = {
              phone_number: data.phone_number,
              _id: data._id,
            };
            var token = jwt.sign(userData, settings.secret, {
              expiresIn: "10 days",
            });
            //data.token = token;
            return res.status(200).send({ ...dataReturn, token: token });
          });

        }
      } catch (err) {
        return next(err);
      }
    })(req, res, next);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

router.put(
  "/updateUser",
  validations.authenticateToken,
  function (req, res, next) {
    try {
      var data = req.body;
      if (Object.keys(data).length) {
        if (data.password) {
          api.findOne(
            { _id: data._id },
            {},
            {},
            function (err, user) {
              if (err) {
                return res.status(500).send({
                  error: err,
                });
              } else {
                user.data.comparePasswordUser(data.currentPassword, function (err, isMatched) {
                  try {
                    if (err) {
                      return res.status(404).send({
                        error: mongooseErrorHandler.set(err, req.t),
                      });
                    }
                    if (isMatched) {
                      bcrypt.genSalt(10, function (err, salt) {
                        if (err) return next(err);
                        bcrypt.hash(data.password, salt, null, function (err, hash) {
                          if (err) return next(err);
                          if (res.passport != hash) {
                            data.password = hash;
                            api.update(
                              { _id: data._id },
                              data,
                              {},
                              function (err, response) {
                                if (err) {
                                  return res.status(500).send({
                                    error: err,
                                  });
                                } else {
                                  response = JSON.parse(JSON.stringify(response));
                                  return res.status(200).send(response);
                                }
                              }
                            );
                          } else {
                            return res.status(500).send({
                              message: "Your current password is not matched.",
                            });
                          }
                        });
                      });
                    } else {
                      return res.status(401).send({
                        error: "Password not Matched.",
                      });
                    }
                  } catch (e) {
                    console.log(e.stack);
                    return res.status(500).send({
                      error: e,
                    });
                  }
                });
              }
            }
          );

        } else {
          let query = {
            _id: data._id,
            role: data.role
          };
          api.update(query || {}, data, { new: true }, function (err, response) {
            if (err) {
              return res.status(500).send({
                error: err,
              });
            } else {
              response = JSON.parse(JSON.stringify(response));
              console.log(response, "response");

              delete response.password;
              return res.status(200).send(response);
            }
          });
        }
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
  "/usersFilteredList",
  //validations.authenticateToken,
  function (req, res, next) {
    try {
      var queryString = req;
      var projection = queryString.projection || {};
      projection.password = 0;

      let query = {};
      let $or_condition = [];
      let $and_condition = [];
      if (queryString.body && queryString.body.name) {
        let name = queryString.body.name.replace(/\s/g, '');
        $or_condition.push(
          { first_name: { $regex: name, $options: "i" } },
          { last_name: { $regex: name, $options: "i" } },
          { $expr: { $eq: [name, { $concat: ["$first_name", "$last_name"] }] } },
          { email: { $regex: name, $options: "i" } },
        );
      }
      if (queryString.body && queryString.body.role) {
        query = { ...query, role: queryString.body.role };
      }


      if (queryString.body && queryString.body.selectedAnswers) {
        let questions = queryString.body.selectedAnswers;
        for (var i = 0; i < questions.length; i++) {
          console.log('keyo', questions[i].question_id);
          console.log('values', questions[i].values);

          var query_value = '';
          if (questions[i].questionCode == 'hourlyRate') {
            query_value = { '$gte': questions[i].values };
          }

          let query_r = [];
          if (Array.isArray(questions[i].values)) {
            for (var v = 0; v < questions[i].values.length; v++) {
              query_r.push(
                questions[i].values[v].value
              );
            }
          }
          if (query_r.length > 0 || query_value != '') {
            $and_condition.push({
              selectedAnswers: {
                $elemMatch: {
                  question_id: questions[i].question_id,
                  values:
                    (query_value != '')
                      ? query_value :
                      {
                        $elemMatch: {
                          value: { "$in": query_r }
                        }
                      }
                }
              }
            });
          }
        }
      }


      // only get those users who has done the prefrences
      query = { ...query, isQuestionDone: true };
      //query = { ...query };

      if ($or_condition.length > 0) {
        query = {
          ...query,
          $or: $or_condition
        };
      }
      if ($and_condition.length > 0) {
        query = {
          ...query,
          $and: $and_condition
        };
      }
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
  "/userslist",
  validations.authenticateToken,
  function (req, res, next) {
    try {
      var queryString = req;
      var projection = queryString.projection || {};
      projection.password = 0;

      let query = {};
      let $or_condition = [];
      let $and_condition = [];
      if (queryString.query && queryString.query.name) {
        let name = queryString.query.name.replace(/\s/g, '');
        $or_condition.push(
          { first_name: { $regex: name, $options: "i" } },
          { last_name: { $regex: name, $options: "i" } },
          { $expr: { $eq: [name, { $concat: ["$first_name", "$last_name"] }] } },
          { email: { $regex: name, $options: "i" } },
        );
      }
      if (queryString.query && queryString.query.role) {
        query = { ...query, role: queryString.query.role };
      }
      if (queryString.query && queryString.query.hourlyRate) {
        query = { ...query, miniMumSalary: { '$gt': queryString.query.hourlyRate } };
      }
      if (queryString.query && queryString.query.require_sponsorship) {
        if (Array.isArray(queryString.query.require_sponsorship)) {
          let query_r = [];
          for (var i = 0; i < queryString.query.require_sponsorship.length; i++) {
            query_r.push(
              queryString.query.require_sponsorship[i]
            );
          }
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code: 'require_sponsorship',
                selectedAnswer: { "$in": query_r }
              }
            }
          });
        } else {
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code: 'require_sponsorship',
                selectedAnswer: queryString.query.require_sponsorship
              }
            }
          });
        }
      }


      if (queryString.query && queryString.query.looking_position) {
        if (Array.isArray(queryString.query.looking_position)) {
          let query_r = [];
          for (var i = 0; i < queryString.query.looking_position.length; i++) {
            query_r.push(
              queryString.query.looking_position[i]
            );
          }
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code: 'looking_position',
                selectedAnswer: { "$in": query_r }
              }
            }
          });
        } else {
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code: 'looking_position',
                selectedAnswer: queryString.query.looking_position
              }
            }
          });
        }
      }

      if (queryString.query && queryString.query.work_remote) {
        if (Array.isArray(queryString.query.work_remote)) {
          let query_r = [];
          for (var i = 0; i < queryString.query.work_remote.length; i++) {
            query_r.push(
              queryString.query.work_remote[i]
            );
          }
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code: 'work_remote',
                selectedAnswer: { "$in": query_r }
              }
            }
          });
        } else {
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code: 'work_remote',
                selectedAnswer: queryString.query.work_remote
              }
            }
          });
        }
      }


      // only get those users who has done the prefrences
      query = { ...query, isQuestionDone: true };

      if ($or_condition.length > 0) {
        query = {
          ...query,
          $or: $or_condition
        };
      }
      if ($and_condition.length > 0) {
        query = {
          ...query,
          $and: $and_condition
        };
      }
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
  "/findUser",
  validations.authenticateToken,
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
      let mySort = { [req.query.sortField]: sortOrder };
      let query = {};
      if (queryString.query && queryString.query.searchText) {
        query = {
          $or: [
            { first_name: { $regex: queryString.query.searchText, $options: "i" } },
            { last_name: { $regex: queryString.query.searchText, $options: "i" } },
            { email: { $regex: queryString.query.searchText, $options: "i" } },
          ],
        };
      }
      if (queryString.query && queryString.query.phone_number) {
        query = { ...query, phone_number: queryString.query.phone_number };
      }
      userDb.count({}, (err, result) => {
        userDb.find(
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
        ).sort(mySort);
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send(err);
    }
  }
);
router.get(
  "/userslist/:id",
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

router.get("/logout/user", (req, res, next) => {
  if (req.user) {
    req.logout();
    return res.status(200).send({
      message: "User logout successfully",
    });
  } else {
    return res.status(400).send({
      message: "User not logged-in",
    });
  }
});
router.get("/getUserCount",
  validations.authenticateToken,
  (req, res, next) => {
    try {
      userDb.count({ role: 'employer' }, (err, empResult) => {
        userDb.count({ role: 'candidate' }, (err, canResult) => {
          res.status(200).send({ employerCount: empResult, candidateCount: canResult });
        });
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send(err);
    }
  });


router.post("/forgotpassword", function (req, res, next) {
  var mailData = {};
  mailData["to"] = req.body.email;
  mailData["emailType"] = "reset_mail";
  var query = {
    email: req.body.email,
  };
  api.find(
    query,
    {
      password: 0,
    },
    {},
    function (err, result) {
      if (err) {
        res.status(500).send({
          error: err,
        });
      } else if (result.length == 0) {
        res.status(500).send({
          error: "User does not exist in Domain.",
        });
      } else {
        let accessToken = Math.random()
          .toString(36)
          .substring(2, 12);
        let currentTime = new Date();
        let updation = {
          accessToken: {
            value: accessToken,
            time: currentTime,
          },
        };
        api.update(
          query,
          updation,
          {
            new: true,
          },
          function (err, response) {
            if (err) {
              res.status(500).send(err);
            } else {
              var accessToken = response.accessToken.value;
              var encryptionObject = {
                accessToken: accessToken,
                to: response.email,
              };
              var ciphertext = CryptoJS.AES.encrypt(
                JSON.stringify(encryptionObject),
                settings.secret
              );
              mailData["link"] = req.body.origin + "/app/reset/" + ciphertext;
              mailData.email = response.email;
              mailService.resetPasswordMail(mailData, (error, response) => {
                if (error) {
                  res.status(500).send(error);
                } else {
                  res.status(200).send(response);
                }
              });
            }
          }
        );
      }
    }
  );
});
router.put(
  "/deleteuser/:id",
  validations.authenticateToken,
  function (req, res, next) {
    try {
      var queryString = req;
      var projection = queryString.projection || {};
      projection.password = 0;
      var query = {
        _id: req.params.id,
      };
      let data = {
        status: req.query.status === 'deactive' ? 'active' : 'deactive'
      };
      api.update(query || {}, data, { new: true }, function (err, response) {
        if (err) {
          res.status(500).send({
            error: err,
          });
        } else {
          response = JSON.parse(JSON.stringify(response));
          delete response.password;
          res.status(200).send(response);
        }
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send(err);
    }
  }
);
router.delete(
  "/deleteuser_p/:id",
  validations.authenticateToken,
  function (req, res, next) {
    try {
      var query = {
        _id: req.params.id,
      };
      api.delete(query || {}, function (err, response) {
        if (err) {
          res.status(500).send({
            error: err,
          });
        } else {
          response = JSON.parse(JSON.stringify(response));
          res.status(200).send(response);
        }
      });
    } catch (err) {
      console.log(err.stack);
      res.status(500).send(err);
    }
  }
);

module.exports = router;