let mongoose = require("mongoose");

let schema = mongoose.Schema;
let bcrypt = require("bcrypt-nodejs");
let uniqueValidator = require("mongoose-unique-validator");

let userSchema = new schema({
  first_name: String,
  last_name: String,
  isTemporary: Boolean,
  email: {
    type: String,
    lowercase: true,
  },
  user_name: {
    type: String,
  },
  date_of_birth: String,
  phone_number: String,
  password: String,
  image: String,
  is_activated: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin", "candidate"],
    default: "candidate",
  },
  status: {
    type: String,
    enum: ["active", "deactive"],
    default: "active",
  },
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  location: {},
  address: String,
  bank_accounts: [{
    account_no: Number,
    account_holder_name: String,
    ifsc_code: String,
    status: {
      type: String,
      enum: ["active", "deactive"],
      default: "active",
    }
  }],
  googlePayNumer: Number,
  phonePayNumer: Number,
  paytmNumer: Number,
  socket_id: String,
  refer_code: String,
  accessToken: {
    type: JSON,
  },
},
  {
    collection: "users",
    timestamps: {},
  }
);

userSchema.plugin(uniqueValidator);
userSchema.index(
  {
    domain: 1,
    user_name: 1,
    email: 1,
    type: 1,
  },
  {
    unique: true,
  }
);

userSchema.methods.comparePasswordUser = function (userPassword, cb) {
  bcrypt.compare(userPassword, this.password, function (err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

userSchema.pre("save", function validate(next) {
  var user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, function (err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function (err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

module.exports = mongoose.model("users", userSchema);
