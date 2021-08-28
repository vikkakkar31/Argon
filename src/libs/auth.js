let passport = require("passport");
let bcrypt = require("bcrypt-nodejs");
let mongooseErrorHandler = require("mongoose-error-handler");
let User = require("./users/api");

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findOne(
    {
      _id: id,
    },
    {},
    {},
    function (err, user) {
      done(null, user);
    }
  );
});

var LocalStrategy = require("passport-local").Strategy;

passport.use(
  "user-login",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, email, password, done) {
      process.nextTick(function () {
        User.findOne(
          {
            email: email,
          },
          {},
          {},
          function (err, user) {
            if (err) {
              return done(
                {
                  status: 404,
                  message: mongooseErrorHandler.set(err, req.t),
                },
                null
              );
            }
            if (!user.data || !Object.keys(user.data).length)
              return done(
                {
                  status: 403,
                  message: "Cant't find a user with this email",
                },
                null
              );
            user.data.comparePasswordUser(password, function (err, isMatched) {
              try {
                if (err) {
                  return done(
                    {
                      status: 404,
                      message: mongooseErrorHandler.set(err, req.t),
                    },
                    null
                  );
                }
                if (isMatched) {
                  user.data = user.data.toObject();
                  delete user.data.password;
                  if (user.data.status === 'deactive') {
                    return done(
                      {
                        status: 401,
                        message: "This User is not active.",
                      },
                      null
                    );
                  }
                  return done(null, user.data);
                } else {
                  return done(
                    {
                      status: 401,
                      message: "Password not Matched.",
                    },
                    null
                  );
                }
              } catch (e) {
                console.log(e.stack);
                return done(
                  {
                    status: 500,
                    message: e,
                  },
                  null
                );
              }
            });
          }
        );
      });
    }
  )
);

passport.use(
  "user-mobile-login",
  new LocalStrategy(
    {
      usernameField: "phone_number",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, phone_number, password, done) {
      process.nextTick(function () {
        User.findOne(
          {
            phone_number: phone_number,
          },
          {},
          {},
          function (err, user) {
            if (err) {
              return done(
                {
                  status: 404,
                  message: mongooseErrorHandler.set(err, req.t),
                },
                null
              );
            }
            if (!user.data || !Object.keys(user.data).length)
              return done(
                {
                  status: 403,
                  message: "Cant't find a user with this phone_number",
                },
                null
              );
            user.data.comparePasswordUser(password, function (err, isMatched) {
              try {
                if (err) {
                  return done(
                    {
                      status: 404,
                      message: mongooseErrorHandler.set(err, req.t),
                    },
                    null
                  );
                }
                if (isMatched) {
                  user.data = user.data.toObject();
                  delete user.data.password;
                  if (user.data.status === 'deactive') {
                    return done(
                      {
                        status: 401,
                        message: "This User is not active.",
                      },
                      null
                    );
                  }
                  return done(null, user.data);
                } else {
                  return done(
                    {
                      status: 401,
                      message: "Password not Matched.",
                    },
                    null
                  );
                }
              } catch (e) {
                console.log(e.stack);
                return done(
                  {
                    status: 500,
                    message: e,
                  },
                  null
                );
              }
            });
          }
        );
      });
    }
  )
);

passport.use(
  "user-signup",
  new LocalStrategy(
    {
      usernameField: "phone_number",
      passwordField: "password",
      passReqToCallback: true,
    },
    function (req, phone_number, password, done) {
      process.nextTick(function () {
        User.findOne(
          {
            phone_number: phone_number,
          },
          {},
          {},
          function (err, user) {
            try {
              if (err)
                return done(
                  {
                    status: 404,
                    message: mongooseErrorHandler.set(err, req.t),
                  },
                  null
                );
              if (user && user.data && user.data._id) {
                return done(
                  {
                    status: 400,
                    message: 'User already exist with this phone_number.',
                  },
                  null
                );
              } else {
                var data = req.body;
                data["is_activated"] = true;
                User.add(data, function (err, user) {
                  if (err) {
                    return done(
                      {
                        status: 500,
                        message: err,
                      },
                      null
                    );
                  } else {
                    return done(null, user);
                  }
                });
              }
            } catch (e) {
              return done(e.stack);
            }
          }
        );
      });
    }
  )
);