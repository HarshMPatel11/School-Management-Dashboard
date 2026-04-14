const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      enum: ["Teacher", "Principal", "Accountant", "Admin", "Staff"],
    },
    dateOfJoining: {
      type: Date,
      required: true,
    },
    monthlySalary: {
      type: Number,
      required: true,
      min: 0,
    },
    fatherOrHusbandName: {
      type: String,
      default: "",
      trim: true,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other", ""],
      default: "",
    },
    experience: {
      type: String,
      default: "",
      trim: true,
    },
    nationalId: {
      type: String,
      default: "",
      trim: true,
    },
    religion: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    education: {
      type: String,
      default: "",
      trim: true,
    },
    bloodGroup: {
      type: String,
      default: "",
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    homeAddress: {
      type: String,
      default: "",
      trim: true,
    },
    photoUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
