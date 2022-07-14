const express = require("express");
const {
  createUser,
  getAllUser,
  login,
  postEnable2FA,
  removeAllUser,
  postVerify2FA,
} = require("./userControl");

const userRoute = express.Router();

userRoute.route("/").get(getAllUser);
userRoute.route("/createUser").post(createUser);
userRoute.route("/login").post(login);
userRoute.route("/createqrcode").post(postEnable2FA);
userRoute.route("/checkcode").post(postVerify2FA);

userRoute.route("/rmall").get(removeAllUser);

module.exports = userRoute;
