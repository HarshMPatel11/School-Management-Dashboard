const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    month: {
      type: String,
      required: true,
      trim: true,
    },
    totalSalary: {
      type: Number,
      required: true,
      min: 0,
    },
    bonus: {
      type: Number,
      default: 0,
      min: 0,
    },
    deduction: {
      type: Number,
      default: 0,
      min: 0,
    },
    netPaid: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Salary", salarySchema);
