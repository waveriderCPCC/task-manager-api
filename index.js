let express = require("express");

require("./db/mongoose.js");

require("dotenv").config();

const path = require("path");

// import routers
const userRouter = require("./routers/userRouter");
const taskRouter = require("./routers/taskRouter");

let app = express();

let port = process.env.PORT || 3000;

// app.use((req, res, next) => {
//   // console.log(req.method, req.path);
//   // next();
//   // if (req.method == "GET") {
//   //   res.send("GET requests are currently disabled.");
//   // } else {
//   //   next();
//   // }
// });

// maintanance mode
// app.use((req, res, next) => {
//   res.status(503).send("Site is currently down for maintenance.");
// });

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(userRouter);
app.use(taskRouter);

//home
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log("server is live on port " + port);
});
