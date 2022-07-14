const express = require("express");
const app = express();
app.listen(5000, () => console.log("Server is running"));
app.use(express.json());
// ADD THIS
var cors = require('cors');
app.use(cors());

const mongoose = require("mongoose");
mongoose.connect(
  "mongodb+srv://tuankiet:kietkiet00@tuankiet.jjjqi.mongodb.net/example?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const userRoutes = require("./route/user/userRoute");
app.use("/", userRoutes);
// const User = require("./models/Users/User");
// (req, res) => {
//   const user = new User({
//     address: "1001",
//     name: "Madison Hyde",
//     email: "22po@gmail.com",
//     password: "123aaa",
//   });
//   user.save().then(() => console.log("One entry added"));
// });
