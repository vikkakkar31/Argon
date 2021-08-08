let express = require("express");
let router = express.Router();
let passport = require("passport");
let bcrypt = require("bcrypt-nodejs");
let jwt = require("jsonwebtoken");
let settings = require("../../config/config.json");
require("../libs/auth");
let transactionApi = require("../libs/subscription_transactions/api");
let settingsApi = require("../libs/settings/api");
let api = require("../libs/users/api");
let userDb = require("../libs/users/schema");
let validations = require("./validations");
let CryptoJS = require("crypto-js");
let mailService = require("../libs/mailService.js");

let secretKey = '';
if(settings.stripeKeys.mode == 'live') {
  secretKey = settings.stripeKeys.secretKey_live;
}else{
  secretKey = settings.stripeKeys.secretKey_test;
}
const stripe = require('stripe')(secretKey);


router.post("/signin", validations.verfiyUserSignin, (req, res, next) => {
  try {
    if (req.body.email && req.body.password) {
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
          // calculate and update trial end date if not exist the subscription details yet
          settingsApi.findOne(
            { s_id: 0 },
            {},
            {},
            function (err, settings) {
              if (err) {
                res.status(500).send({
                     error: err,
                });
              } else {
                let trial_days = 0, trial_on = 'off';
                if(settings) {
                   trial_days = settings.trial_days;
                   trial_on = settings.trial_on;
                }
                
                  var startDate = new Date(Date.now() + 0 * 24*60*60*1000);
                  var expiresDate = new Date(Date.now() + trial_days * 24*60*60*1000);
                  var upData = {
                    subscription : {
                      sub_type: 'free',
                      sub_start: startDate,
                      sub_end: expiresDate
                    }
                  }
                  api.update(
                      { _id: user._id },
                      upData,
                      {},
                      function (err, response) {
                        if (err) {
                          res.status(500).send({
                            error: err,
                          });
                        } else {
                          // response = JSON.parse(JSON.stringify(response));
                          // res.status(200).send(response);
                        }
                      }
                  );
              }
            }
          )
          // end calculate trial end date

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

router.post("/signup", validations.verfiyUserSignup, async (req, res, next) => {
  try {
    console.log('req====', req);
    passport.authenticate("user-signup", async (error, data) => {
      try {
        if (error) {
          return res.status(error.status).send(error);
        } else {
          var dataReturn = { ...data._doc};
          await req.logIn(data, (err) => {
              if (err) {
                return res.status(500).send({
                  error: err,
                });
              } 
            let promise = new Promise(function (resolve, reject) {
              // calculate and update trial end date
              settingsApi.findOne(
                { s_id: 0 },
                {},
                {},
                function (err, settings) {
                  if (err) {
                    return res.status(500).send({
                        error: err,
                    });
                  } else {
                    let trial_days = 0, trial_on = 'off';
                    if(settings) {
                      trial_days = settings.trial_days;
                      trial_on = settings.trial_on;
                    }
                    
                      var startDate = new Date(Date.now() + 0 * 24*60*60*1000);
                      var expiresDate = new Date(Date.now() + trial_days * 24*60*60*1000);
                      var subscription = {
                          sub_type: 'free',
                          sub_start: startDate,
                          sub_end: expiresDate
                      }
                      // add subscription data to data variable
                      dataReturn = { ...dataReturn,  subscription};
                      console.log(dataReturn,'data');
                      //end
                      api.update(
                          { _id: data._id },
                          {subscription},
                          {},
                          function (err, response) {
                            if (err) {
                              return res.status(500).send({
                                error: err,
                              });
                            } else {
                              resolve(dataReturn);
                            }
                          }
                      );
                  }
                }
              )
              // end calculate trial end date
            });
            // When the promise is complete, show the results
            promise.then((dataReturn) =>{
                let userData = {
                  email: data.email,
                  _id: data._id,
                };
                var token = jwt.sign(userData, settings.secret, {
                  expiresIn: "10 days",
                });
                //data.token = token;
                console.log(dataReturn, 'dataReturn');
                return res.status(200).send({ ...dataReturn, token: token });
              }).catch(err => { console.log(err) });
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
  "/updateprofile",
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
           { $expr : { $eq: [name, { $concat:["$first_name", "$last_name"] } ] } },
           { email: { $regex: name, $options: "i" } },
       );
     }
     if (queryString.body && queryString.body.role) {
       query = { ...query, role: queryString.body.role };
     }


    if(queryString.body && queryString.body.selectedAnswers){
      let questions = queryString.body.selectedAnswers;
      for(var i=0; i<questions.length; i++){
        console.log('keyo',questions[i].question_id);
        console.log('values',questions[i].values);

        var query_value = '';
        if (questions[i].questionCode == 'hourlyRate') {
          query_value = { '$gte': questions[i].values};
        }

        let query_r = [];
        if(Array.isArray(questions[i].values)){
            for(var v=0; v<questions[i].values.length; v++){
              query_r.push(
                questions[i].values[v].value
              );
            }
        } 
          if(query_r.length > 0 || query_value != ''){
              $and_condition.push({
                selectedAnswers: {
                  $elemMatch: {
                    question_id: questions[i].question_id, 
                    values: 
                    (query_value != '') 
                      ? query_value :
                      { 
                        $elemMatch: {
                        value:  {"$in": query_r }
                        }
                      }
                  }
                }
              });
          }
      }
    }


    // only get those users who has done the prefrences
    query = { ...query, isQuestionDone : true };
    //query = { ...query };

    if($or_condition.length > 0){
        query = {
          ...query,  
          $or: $or_condition };
    }
    if($and_condition.length > 0){
      query = {
        ...query,  
        $and: $and_condition };
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
           { $expr : { $eq: [name, { $concat:["$first_name", "$last_name"] } ] } },
           { email: { $regex: name, $options: "i" } },
       );
     }
     if (queryString.query && queryString.query.role) {
       query = { ...query, role: queryString.query.role };
     }
     if (queryString.query && queryString.query.hourlyRate) {
      query = { ...query, miniMumSalary: { '$gt': queryString.query.hourlyRate} };
    }
    if(queryString.query && queryString.query.require_sponsorship){
      if(Array.isArray(queryString.query.require_sponsorship)){
        let query_r = [];
          for(var i=0; i<queryString.query.require_sponsorship.length; i++){
            query_r.push(
               queryString.query.require_sponsorship[i]
            );
          }    
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code:'require_sponsorship', 
                selectedAnswer:{ "$in": query_r }
              }
            }
          });
      }else{
        $and_condition.push({
          userQuestions: {
            $elemMatch: {
              short_code:'require_sponsorship', 
              selectedAnswer:queryString.query.require_sponsorship
            }
          }
        });
      }  
    }


    if(queryString.query && queryString.query.looking_position){
      if(Array.isArray(queryString.query.looking_position)){
        let query_r = [];
          for(var i=0; i<queryString.query.looking_position.length; i++){
            query_r.push(
               queryString.query.looking_position[i]
            );
          }
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code:'looking_position', 
                selectedAnswer:{ "$in": query_r }
              }
            }
          });
      }else{
        $and_condition.push({
          userQuestions: {
            $elemMatch: {
              short_code:'looking_position', 
              selectedAnswer:queryString.query.looking_position
            }
          }
        });
      }   
    }

    if(queryString.query && queryString.query.work_remote){
      if(Array.isArray(queryString.query.work_remote)){
        let query_r = [];
          for(var i=0; i<queryString.query.work_remote.length; i++){
            query_r.push(
               queryString.query.work_remote[i]
            );
          }
          $and_condition.push({
            userQuestions: {
              $elemMatch: {
                short_code:'work_remote', 
                selectedAnswer:{ "$in": query_r }
              }
            }
          });
      }else{
        $and_condition.push({
          userQuestions: {
            $elemMatch: {
              short_code:'work_remote', 
              selectedAnswer: queryString.query.work_remote
            }
          }
        });
      }   
    }
    

    // only get those users who has done the prefrences
    query = { ...query, isQuestionDone : true };

    if($or_condition.length > 0){
        query = {
          ...query,  
          $or: $or_condition };
    }
    if($and_condition.length > 0){
      query = {
        ...query,  
        $and: $and_condition };
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
      if (queryString.query && queryString.query.role) {
        query = { ...query, role: queryString.query.role };
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

// pay stripe
router.post(
  "/pay",
  //validations.authenticateToken,
  async function (req, res, next) {
    try {
      // Create the PaymentIntent
      let intent = await stripe.paymentIntents.create({
        payment_method: req.body.payment_method_id,
        description: req.body.description,
        amount: req.body.amount * 100,
        currency: 'usd',
        confirmation_method: 'manual',
        confirm: true
      });
      console.log(intent);
      // calculate cycle start and end date
      api.findOne(
        { _id: req.body.user._id },
        {},
        {},
        function (err, result) {
          if (err) {
              return res.send({error: err });
          } else {
            if(result) {
              console.log(result.data,'user');
               const user = result.data;
               console.log(user.subscription,'user');
                var one_day=1000*60*60*24;
                let currentSubEnd = user.subscription.sub_end;
                var nowDate = new Date(Date.now() + 0 * 24*60*60*1000);
                var remainingDays = Math.ceil((currentSubEnd.getTime()-nowDate.getTime())/(one_day));
                              
                var today = new Date(Date.now() + 0 * 24*60*60*1000);
                let package_Days = today.setMonth( today.getMonth() + +req.body.planMonths );
          
                var startDate = new Date(Date.now() + 0 * 24*60*60*1000);
                var expiresDate = new Date(package_Days + remainingDays * 24*60*60*1000);

                // update transactions table
                const transaction = {
                  user_id : req.body.user._id,
                  planId: req.body.planId,
                  amount: req.body.amount,
                  plan_billing_period: req.body.planMonths,
                  paymentId: intent.id,
                  status: intent.status,
                  description: intent.description,
                  rawResponse: intent,
                  cycle_start: startDate,
                  cycle_end: expiresDate
               }
               
               let query = {
                 paymentId: transaction.paymentId
               };
               //transactionApi.update(query || {}, transaction, transaction.options || {}, function (err, response) {
                transactionApi.add( transaction, function (err, response) {
                  if (err) {
                     return res.status(500).send({
                         error: err,
                     });
                 } else {
                     //now update user table if success
                    if (intent.status === 'succeeded') {
                      var upData = {
                            subscription : {
                              sub_type: 'paid',
                              sub_plan: req.body.planId,
                              sub_start: startDate,
                              sub_end: expiresDate
                            }
                      }
                        //console.log(upData);
                        api.update(
                          { _id: req.body.user._id },
                          upData,
                          {},
                          function (err, response) {
                              if (err) {
                                return res.status(500).send({error: err });
                              } else {
                                const data = JSON.parse(JSON.stringify(response));
                              // console.log(response);
                                return res.status(200).send({success:true, data});
                              }
                          }
                        );
                    } else {
                      // Invalid status
                      return res.status(500).send({ error: 'Invalid PaymentIntent status'});
                    }
                 }
               });
               //end transaction up code
            }else{
                return res.status(500).send({error : "User not found!"});
            }
          }
      });
 
    } catch (e) {
      // Display error on client
      return res.status(500).send({ error: e.message });
    }
  }
);

module.exports = router;