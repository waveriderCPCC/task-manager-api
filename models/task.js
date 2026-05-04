// DEFINE TASK MODEL
let mongoose = require("mongoose");

let Task = mongoose.model("Task", {
  title: {
    type: String,
    required: true,
    trim: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

module.exports = Task;
