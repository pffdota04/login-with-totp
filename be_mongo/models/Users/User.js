const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  address: String,
  email: String,
  password: String,
  secret: String,
  scaned: Boolean,
});

module.exports = mongoose.model("User", userSchema);
