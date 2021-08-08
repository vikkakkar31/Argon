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
  designation: String,
  date_of_birth: String,
  phone_number: String,
  skype_id: String,
  password: String,
  customEncryptPassword: String,
  image: String,
  is_activated: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["admin", "candidate", "employer"],
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
  about_me: String,
  summery: String,
  work_experience: [{
    joining_date: String,
    leaving_date: String,
    company_info: String,
  }],
  socket_id: String,
  user_image_path: String,
  user_video_path: String,
  resume_path: String,
  videoThumbnail: String,
  isSurveyDone: {
    type: Boolean,
    default: false,
  },
  isQuestionDone: {
    type: Boolean,
    default: false,
  },
  is_deactivated: {
    type: Boolean,
    default: false,
  },
  company_name: String,
  company_website: String,
  instagram_link: String,
  twitter_link: String,
  facebook_link: String,
  accessToken: {
    type: JSON,
  },
  company_jobs: [{
    job_title: String,
    hourly_rate: String,
    benefits: String,
    description: String
  }],
  lookingForSurvey: String,
  interViewVideoLink: String,
  resumeLink: String,
  aptitudeQuestion: [{
    assessmentAttributes: String,
    assessmentQuestions: String,
    assessmentResponseAnswer: String,
  }],
  selectedAnswers: [{
    _id: false,
    question_id: { type: schema.ObjectId, ref: "jobSeekersQuestionsSchema" },
    values: schema.Types.Mixed,
  }],
  subscription: {
    sub_type: String,
    sub_plan: { type: schema.ObjectId, ref: "subscription_plans" },
    sub_start: Date,
    sub_end: Date
  }
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
