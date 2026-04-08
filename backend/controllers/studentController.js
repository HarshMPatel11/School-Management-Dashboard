const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { search = "", className = "", section = "" } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
        { parentName: { $regex: search, $options: "i" } },
      ];
    }

    if (className) query.className = className;
    if (section) query.section = section;

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Attendance.deleteMany({ student: req.params.id });
    await Fee.deleteMany({ student: req.params.id });

    res.json({ message: "Student and related records deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const totalAttendance = await Attendance.countDocuments({
      date: new Date().toISOString().slice(0, 10),
    });
    const totalFees = await Fee.aggregate([
      {
        $group: {
          _id: null,
          paid: { $sum: "$paidFee" },
          due: { $sum: "$dueFee" },
        },
      },
    ]);

    res.json({
      totalStudents,
      todayAttendanceMarked: totalAttendance,
      totalCollected: totalFees[0]?.paid || 0,
      totalDue: totalFees[0]?.due || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
