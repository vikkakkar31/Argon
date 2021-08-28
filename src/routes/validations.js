let settings = require("../../config/config.json");
let jwt = require("jsonwebtoken");
module.exports = {
  verfiyUserSignup: function (req, res, next) {
    if (!req.body.phone_number) {
      res.status(403).send({ error: "phone_number not present" });
    } else if (!req.body.first_name) {
      res.status(403).send({ error: "first_name not present" });
    } else if (!req.body.last_name) {
      res.status(403).send({ error: "last_name not present" });
    } else if (!req.body.password) {
      res.status(403).send({ error: "password not present" });
    } else {
      next();
    }
  },
  verfiyUserSignin: function (req, res, next) {
    if (!req.body.email) {
      res.status(403).send({ error: "Email not present" });
    } else if (!req.body.password) {
      res.status(403).send({ error: "password not present" });
    } else {
      next();
    }
  },
  verfiyUserMobileSignin: function (req, res, next) {
    if (!req.body.phone_number) {
      res.status(403).send({ error: "Mobile Number not present" });
    } else if (!req.body.password) {
      res.status(403).send({ error: "password not present" });
    } else {
      next();
    }
  },
  authenticateToken: function (req, res, next) {
    try {
      var token = req.body.token || req.headers["authorization"];
      if (token) {
        // verifies secret and checks expiry
        jwt.verify(token, settings.secret, function (err, decoded) {
          if (err) {
            if (req.user && req.user.data) {
              return res.status(403).send({
                success: false,
                message: "Failed to authenticate token.",
              });
            } else {
              res.status(403).send({ error: "notLoggedIn" });
            }
          } else {
            // save to request for use in other routes
            // req.decoded = decoded;
            next();
          }
        });
      } else {
        if (req.user && req.user.data) {
          return res.status(403).send({
            success: false,
            message: "No token provided.",
          });
        } else {
          res.status(403).send({ error: "notLoggedIn" });
        }
      }
    } catch (err) {
      res.status(500).send({ error: err });
    }
  },
  autenticateGenuinUser: function (req, res, next) {
    var decodedId = req.decoded && req.decoded._id ? req.decoded._id : req.decoded._doc._id;
    if (decodedId != req.params.id) {
      res.status(403).send({ error: "Forbidden" });
    } else {
      next();
    }
  },
  autenticateGenuinUserForUpdate: function (req, res, next) {
    if (req.body.role == 'admin') {
      next();
    } else {
      res.status(403).send({ error: "Forbidden" });

    }
  },
  userLoggedIn: function (req, res, next) {
    if (req.user) {
      next();
    } else {
      res.status(403).send({ error: "notLoggedIn" });
    }
  },
};
