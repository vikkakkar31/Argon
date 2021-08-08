let mongoose = require("mongoose");
let schema = mongoose.Schema;

let settingsSchema = new schema(
  {
    s_id: {
        type: Number, 
        default: 0
    },
    project_title: {
        type: String
    },
    trial_on: {
      type: String,
      default: "on",
      enum: ["on", "off"],
    },
    trial_days: {
        type: Number,
        default: 30
    }
  },
  {
    collection: "settings",
    timestamps: {},
  }
);

module.exports = mongoose.model("settings", settingsSchema);
