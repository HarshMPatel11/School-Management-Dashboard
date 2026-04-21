const mongoose = require("mongoose");

const examSubjectMarkSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    obtainedMarks: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const examStudentEntrySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    marks: {
      type: [examSubjectMarkSchema],
      default: [],
    },
  },
  { _id: false }
);

const examMarkSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    entries: {
      type: [examStudentEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

examMarkSchema.index({ exam: 1, className: 1 }, { unique: true });

module.exports = mongoose.model("ExamMark", examMarkSchema);
