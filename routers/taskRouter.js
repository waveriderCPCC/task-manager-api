// User Router

let express = require("express");

require("dotenv").config();

let Task = require("../models/task.js");

let router = new express.Router();

//task routes
// POST   : /tasks
// GET    : /tasks
// GET    : /tasks/:id
// POST   : /tasks/:id
// DELETE : /tasks/:id

// POST -> /tasks : create task
router.post("/tasks", async (req, res) => {
  console.log(req.body);
  let task = new Task(req.body);

  try {
    await task.save();
    res.status(201).send(task);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// GET -> /tasks : get all tasks
router.get("/tasks", async (req, res) => {
  try {
    let tasks = await Task.find({});
    res.send(tasks);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// GET -> /tasks/:id : get task by id
router.get("/tasks/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let task = await Task.findById(id);
    if (!task) {
      res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// PATCH -> /tasks/:id : edit task by id
router.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["title", "completed"];
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
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!task) {
      return res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

// DELETE -> /tasks/:id : delete task by id
router.delete("/tasks/:id", async (req, res) => {
  let id = req.params.id;
  try {
    let task = await Task.findByIdAndDelete(id);
    if (!task) {
      res.status(404).send("Task not found");
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
