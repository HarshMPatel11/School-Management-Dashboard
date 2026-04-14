const mongoose = require("mongoose");

const subjectItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    marks: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    classRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
      unique: true,
    },
    subjects: {
      type: [subjectItemSchema],
      default: [],
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: "At least one subject is required.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
