const User = require("../models/User");
const Student = require("../models/Student");
const Attendance = require("../models/Attendance");
const Fee = require("../models/Fee");
const Exam = require("../models/Exam");
const ExamMark = require("../models/ExamMark");
const ClassTest = require("../models/ClassTest");

const resolveStudentForUser = async (user) => {
  if (!user || user.role !== "student") {
    return null;
  }

  const username = String(user.username || "").trim().toLowerCase();
  if (!username) return null;

  return Student.findOne({
    $or: [
      { loginUsername: username },
      { rollNumber: username },
    ],
  });
};

const computeAttendanceSummary = (records) => {
  const total = records.length;
  const present = records.filter((item) => item.status === "Present").length;
  const absent = records.filter((item) => item.status === "Absent").length;
  const late = records.filter((item) => item.status === "Late").length;
  const percentage = total ? ((present + late) / total) * 100 : 0;

  return { total, present, absent, late, percentage };
};

const gradeFromPercentage = (percentage) => {
  if (percentage >= 80) return "A+";
  if (percentage >= 70) return "A";
  if (percentage >= 60) return "B+";
  if (percentage >= 50) return "B";
  if (percentage >= 40) return "C";
  if (percentage >= 33) return "D";
  return "F";
};

exports.getPortalMe = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    res.json({ student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const [attendanceRecords, feeRecords, examMarks, classTests] = await Promise.all([
      Attendance.find({ student: student._id }).sort({ date: -1 }),
      Fee.find({ student: student._id }).sort({ createdAt: -1 }).limit(6),
      ExamMark.find({ className: student.className, "entries.student": student._id })
        .populate("exam")
        .sort({ createdAt: -1 }),
      ClassTest.find({ className: student.className, "entries.student": student._id }).sort({ testDate: -1 }),
    ]);

    const attendance = computeAttendanceSummary(attendanceRecords);

    const examResults = examMarks
      .filter((markDoc) => markDoc.exam)
      .map((markDoc) => {
        const entry = markDoc.entries.find((item) => String(item.student) === String(student._id));
        if (!entry) return null;
        const totalMarks = entry.marks.reduce((sum, item) => sum + Number(item.totalMarks || 0), 0);
        const obtainedMarks = entry.marks.reduce((sum, item) => sum + Number(item.obtainedMarks || 0), 0);
        const percentage = totalMarks ? (obtainedMarks / totalMarks) * 100 : 0;
        return {
          examId: markDoc.exam._id,
          examName: markDoc.exam.name,
          obtainedMarks,
          totalMarks,
          percentage,
        };
      })
      .filter(Boolean);

    const latestExam = examResults[0] || null;

    const classTestSummary = Object.values(
      classTests.reduce((acc, item) => {
        const entry = item.entries.find((row) => String(row.student) === String(student._id));
        if (!entry) return acc;
        if (!acc[item.subjectName]) {
          acc[item.subjectName] = {
            subjectName: item.subjectName,
            totalMarks: 0,
            obtainedMarks: 0,
            totalTests: 0,
          };
        }
        acc[item.subjectName].totalMarks += Number(item.totalMarks || 0);
        acc[item.subjectName].obtainedMarks += Number(entry.obtainedMarks || 0);
        acc[item.subjectName].totalTests += 1;
        return acc;
      }, {})
    ).map((item) => ({
      ...item,
      percentage: item.totalMarks ? (item.obtainedMarks / item.totalMarks) * 100 : 0,
    }));

    res.json({
      student,
      attendance,
      fees: feeRecords,
      latestExam,
      examResults,
      classTestSummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentFees = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const fees = await Fee.find({ student: student._id }).sort({ createdAt: -1 }).populate("student");
    res.json({ student, fees });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentExamResults = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const examMarks = await ExamMark.find({ className: student.className, "entries.student": student._id })
      .populate("exam")
      .sort({ createdAt: -1 });

    const results = examMarks
      .filter((markDoc) => markDoc.exam)
      .map((markDoc) => {
        const entry = markDoc.entries.find((item) => String(item.student) === String(student._id));
        if (!entry) return null;
        const totalMarks = entry.marks.reduce((sum, item) => sum + Number(item.totalMarks || 0), 0);
        const obtainedMarks = entry.marks.reduce((sum, item) => sum + Number(item.obtainedMarks || 0), 0);
        const percentage = totalMarks ? (obtainedMarks / totalMarks) * 100 : 0;
        return {
          examId: markDoc.exam._id,
          examName: markDoc.exam.name,
          marks: entry.marks,
          totalMarks,
          obtainedMarks,
          percentage,
          grade: gradeFromPercentage(percentage),
          status: percentage >= 33 ? "PASS" : "FAIL",
        };
      })
      .filter(Boolean);

    res.json({ student, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentReportCard = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    const { examId = "" } = req.query;

    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (!examId) {
      return res.status(400).json({ message: "Exam is required" });
    }

    const [exam, examDoc, attendanceRecords, classResultsDoc, classTests] = await Promise.all([
      Exam.findById(examId),
      ExamMark.findOne({ exam: examId, className: student.className, "entries.student": student._id }),
      Attendance.find({ student: student._id }),
      ExamMark.findOne({ exam: examId, className: student.className }).populate("entries.student", "fullName rollNumber"),
      ClassTest.find({ className: student.className, "entries.student": student._id }).sort({ testDate: -1 }),
    ]);

    if (!exam || !examDoc) {
      return res.status(404).json({ message: "Report card data not found for this exam" });
    }

    const entry = examDoc.entries.find((item) => String(item.student) === String(student._id));
    if (!entry) {
      return res.status(404).json({ message: "Report card data not found for this exam" });
    }

    const totalMarks = entry.marks.reduce((sum, item) => sum + Number(item.totalMarks || 0), 0);
    const obtainedMarks = entry.marks.reduce((sum, item) => sum + Number(item.obtainedMarks || 0), 0);
    const percentage = totalMarks ? (obtainedMarks / totalMarks) * 100 : 0;
    const attendance = computeAttendanceSummary(attendanceRecords);

    const classResults = (classResultsDoc?.entries || [])
      .filter((item) => item.student)
      .map((item) => {
        const marksTotal = item.marks.reduce((sum, row) => sum + Number(row.totalMarks || 0), 0);
        const marksObtained = item.marks.reduce((sum, row) => sum + Number(row.obtainedMarks || 0), 0);
        return {
          studentId: item.student._id,
          percentage: marksTotal ? (marksObtained / marksTotal) * 100 : 0,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const position = classResults.findIndex((item) => String(item.studentId) === String(student._id)) + 1;

    const classTestSummary = Object.values(
      classTests.reduce((acc, item) => {
        const row = item.entries.find((entryItem) => String(entryItem.student) === String(student._id));
        if (!row) return acc;
        if (!acc[item.subjectName]) {
          acc[item.subjectName] = { subjectName: item.subjectName, totalMarks: 0, obtainedMarks: 0 };
        }
        acc[item.subjectName].totalMarks += Number(item.totalMarks || 0);
        acc[item.subjectName].obtainedMarks += Number(row.obtainedMarks || 0);
        return acc;
      }, {})
    ).map((item) => ({
      ...item,
      percentage: item.totalMarks ? (item.obtainedMarks / item.totalMarks) * 100 : 0,
    }));

    res.json({
      student,
      exam,
      marks: entry.marks,
      summary: {
        totalMarks,
        obtainedMarks,
        percentage,
        grade: gradeFromPercentage(percentage),
        status: percentage >= 33 ? "PASS" : "FAIL",
      },
      attendance,
      comparison: {
        classStrength: classResults.length,
        classAverage: classResults.length
          ? classResults.reduce((sum, item) => sum + item.percentage, 0) / classResults.length
          : 0,
        classMax: classResults.length ? Math.max(...classResults.map((item) => item.percentage)) : 0,
        classMin: classResults.length ? Math.min(...classResults.map((item) => item.percentage)) : 0,
        position,
      },
      classTestSummary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentClassTestResults = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const tests = await ClassTest.find({ className: student.className, "entries.student": student._id }).sort({ testDate: -1 });

    const results = tests.map((test) => {
      const entry = test.entries.find((item) => String(item.student) === String(student._id));
      const obtainedMarks = Number(entry?.obtainedMarks || 0);
      const percentage = test.totalMarks ? (obtainedMarks / test.totalMarks) * 100 : 0;

      return {
        _id: test._id,
        subjectName: test.subjectName,
        testDate: test.testDate,
        totalMarks: test.totalMarks,
        obtainedMarks,
        percentage,
        status: percentage >= 33 ? "PASS" : "FAIL",
      };
    });

    res.json({ student, results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStudentAccount = async (req, res) => {
  try {
    const student = await resolveStudentForUser(req.user);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const { username = "", currentPassword = "", newPassword = "" } = req.body;
    const nextUsername = String(username || "").trim().toLowerCase();
    const nextPassword = String(newPassword || "").trim();

    if (!nextUsername || !currentPassword || !nextPassword) {
      return res.status(400).json({ message: "Username, current password and new password are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passwordMatches = await user.matchPassword(currentPassword);
    if (!passwordMatches) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const existingUser = await User.findOne({
      _id: { $ne: user._id },
      username: nextUsername,
    });
    if (existingUser) {
      return res.status(409).json({ message: "Username is already in use" });
    }

    user.username = nextUsername;
    user.email = `${nextUsername}@student.local`;
    user.password = nextPassword;
    await user.save();

    student.loginUsername = nextUsername;
    student.loginPassword = nextPassword;
    await student.save();

    res.json({
      message: "Account updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      student,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
