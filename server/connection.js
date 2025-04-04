const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(
  //`mongodb+srv://mern-chat:PTz56Ur2vddulm7a@cluster0.a5kzaf9.mongodb.net/test`,
  `mongodb://localhost:27017/chatApp`,
  () => {
    console.log("connected to mongodb");
  }
);
