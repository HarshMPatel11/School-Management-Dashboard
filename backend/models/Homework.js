const mongoose = require("mongoose");

const homeworkSchema = new mongoose.Schema(
  {
    homeworkDate: {
      type: Date,
      required: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    assignment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Homework", homeworkSchema);
