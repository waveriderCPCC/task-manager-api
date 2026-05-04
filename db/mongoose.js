// connect to mongodb atlas with mongoose

let mongoose = require("mongoose");

require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.error("connection error", error.message);
  });
