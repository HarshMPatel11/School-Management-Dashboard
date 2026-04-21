const mongoose = require("mongoose");

const classTestEntrySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const classTestSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    testDate: {
      type: Date,
      required: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    entries: {
      type: [classTestEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

classTestSchema.index({ className: 1, subjectName: 1, testDate: 1 }, { unique: true });

module.exports = mongoose.model("ClassTest", classTestSchema);
