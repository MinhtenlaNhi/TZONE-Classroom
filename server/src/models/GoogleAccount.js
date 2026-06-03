const mongoose = require("mongoose");

const googleAccountSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, default: "" },
    picture: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("GoogleAccount", googleAccountSchema);
