// User Router

let express = require("express");

require("dotenv").config();

let User = require("../models/user.js");

let authenticate = require("../middleware/auth.js");

let router = new express.Router();

// user routes
// POST   : /users
// POST   : /user/login
// GET    : /users/me
// GET    : /users/:id
// POST   : /users/:id
// DELETE : /users/:id

// POST -> /users : create account / sign up
router.post("/users", async (req, res) => {
  console.log(req.body);
  let user = new User(req.body);

  try {
    await user.save();
    // generate token
    let token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (error) {
    if (error.code == 11000) {
      return res.status(400).send("Email already exists");
    }
    res.status(400).send(error.message);
  }
});

// POST -> /users/login : login to account
router.post("/users/login", async (req, res) => {
  try {
    let user = await User.findByCredentials(req.body.email, req.body.password);
    let token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET -> /users/me : display the user that is logged in
router.get("/users/me", authenticate, async (req, res) => {
  res.send(req.user);
});

// POST -> /users/logout : log out
router.post("/users/logout", authenticate, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.send("Logged out");
  } catch (error) {
    res.status(500).send();
  }
});

// POST -> /users/logoutAll : log out all devices
router.post("/users/logoutAll", authenticate, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send("Logged out all devices");
  } catch (error) {
    res.status(500).send();
  }
});

// // GET -> /users : get all users
// router.get("/users", authenticate, async (req, res) => {
//   try {
//     let users = await User.find({});
//     res.send(users);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// GET -> /users/:id : get user by id
router.get("/users/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let user = await User.findById(id);
    if (!user) {
      res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PATCH -> /users/:id : edit user by id
router.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "age", "email", "password"];
  const isValidOperation = updates.every((field) =>
    allowedUpdates.includes(field),
  );
  if (!isValidOperation) {
    let text = "";
    if (updates.includes("_id") || updates.includes("__v")) {
      text = " You cannot update _id or __v.";
    }
    return res.status(400).send("Invalid updates!" + text);
  }
  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });
    let user = await User.findById(req.params.id);

    updates.forEach((u) => {
      user[u] = req.body[u];
    });

    user.save();

    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// DELETE -> /users/:id : delete user by id
router.delete("/users/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).send("User not found");
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
