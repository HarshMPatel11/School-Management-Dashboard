const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    sections: {
      type: [String],
      default: ["A"],
    },
    capacity: {
      type: Number,
      default: 40,
      min: 1,
    },
    classTeacher: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Class", classSchema);
