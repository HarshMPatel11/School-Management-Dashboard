const mongoose = require("mongoose");

const employeeAttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late"],
      required: true,
    },
  },
  { timestamps: true }
);

employeeAttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("EmployeeAttendance", employeeAttendanceSchema);
