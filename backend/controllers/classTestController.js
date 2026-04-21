const ClassModel = require("../models/Class");
const ClassTest = require("../models/ClassTest");
const Student = require("../models/Student");
const Subject = require("../models/Subject");

const normalizeDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const validateSubjectForClass = async (className, subjectName) => {
  const classDoc = await ClassModel.findOne({ name: className.trim() });
  if (!classDoc) {
    const error = new Error("Class not found");
    error.statusCode = 404;
    throw error;
  }

  const subjectDoc = await Subject.findOne({ classRef: classDoc._id });
  const isValid = (subjectDoc?.subjects || []).some((item) => item.name === subjectName);

  if (!isValid) {
    const error = new Error("Subject is not assigned to the selected class");
    error.statusCode = 400;
    throw error;
  }
};

exports.listClassTests = async (req, res) => {
  try {
    const { className = "", subjectName = "" } = req.query;
    const query = {};

    if (className) {
      query.className = className;
    }
    if (subjectName) {
      query.subjectName = subjectName;
    }

    const tests = await ClassTest.find(query).sort({ testDate: -1, createdAt: -1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClassTestMarksSheet = async (req, res) => {
  try {
    const { className = "", subjectName = "", testDate = "" } = req.query;
    if (!className || !subjectName || !testDate) {
      return res.status(400).json({ message: "Class, subject and test date are required" });
    }

    const normalizedDate = normalizeDateOnly(testDate);
    if (!normalizedDate) {
      return res.status(400).json({ message: "Invalid test date" });
    }

    await validateSubjectForClass(className, subjectName);

    const [students, testDoc] = await Promise.all([
      Student.find({ className }).sort({ rollNumber: 1 }),
      ClassTest.findOne({ className, subjectName, testDate: normalizedDate }),
    ]);

    const entryMap = new Map(
      (testDoc?.entries || []).map((entry) => [String(entry.student), Number(entry.obtainedMarks || 0)])
    );

    res.json({
      className,
      subjectName,
      testDate: normalizedDate,
      totalMarks: testDoc?.totalMarks || "",
      rows: students.map((student) => ({
        studentId: student._id,
        rollNumber: student.rollNumber,
        fullName: student.fullName,
        obtainedMarks: entryMap.has(String(student._id)) ? entryMap.get(String(student._id)) : "",
      })),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.saveClassTestMarks = async (req, res) => {
  try {
    const { className = "", subjectName = "", testDate = "", totalMarks, entries = [] } = req.body;
    const normalizedDate = normalizeDateOnly(testDate);
    const normalizedTotal = Number(totalMarks);

    if (!className || !subjectName || !normalizedDate || !Number.isFinite(normalizedTotal) || normalizedTotal <= 0) {
      return res.status(400).json({ message: "Class, subject, date and total marks are required" });
    }

    await validateSubjectForClass(className, subjectName);

    const students = await Student.find({ className }, { _id: 1 });
    const validStudentIds = new Set(students.map((student) => String(student._id)));

    const normalizedEntries = (entries || []).map((entry) => {
      const studentId = String(entry.studentId || "").trim();
      const obtainedMarks = Number(entry.obtainedMarks);

      if (!validStudentIds.has(studentId)) {
        const error = new Error("One or more students do not belong to the selected class");
        error.statusCode = 400;
        throw error;
      }

      if (!Number.isFinite(obtainedMarks) || obtainedMarks < 0 || obtainedMarks > normalizedTotal) {
        const error = new Error("Obtained marks must be between 0 and total marks");
        error.statusCode = 400;
        throw error;
      }

      return {
        student: studentId,
        obtainedMarks,
      };
    });

    const doc = await ClassTest.findOneAndUpdate(
      { className, subjectName, testDate: normalizedDate },
      { className, subjectName, testDate: normalizedDate, totalMarks: normalizedTotal, entries: normalizedEntries },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Class test marks saved successfully", doc });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getClassTestResults = async (req, res) => {
  try {
    const { className = "", subjectName = "", testDate = "" } = req.query;
    const normalizedDate = normalizeDateOnly(testDate);

    if (!className || !subjectName || !normalizedDate) {
      return res.status(400).json({ message: "Class, subject and date are required" });
    }

    const testDoc = await ClassTest.findOne({ className, subjectName, testDate: normalizedDate }).populate(
      "entries.student",
      "fullName rollNumber className section"
    );

    if (!testDoc) {
      return res.status(404).json({ message: "No class test record found" });
    }

    const results = (testDoc.entries || [])
      .filter((entry) => entry.student)
      .map((entry) => {
        const percentage = testDoc.totalMarks > 0 ? (Number(entry.obtainedMarks || 0) / testDoc.totalMarks) * 100 : 0;
        return {
          studentId: entry.student._id,
          rollNumber: entry.student.rollNumber,
          fullName: entry.student.fullName,
          className: entry.student.className,
          section: entry.student.section,
          totalMarks: testDoc.totalMarks,
          obtainedMarks: Number(entry.obtainedMarks || 0),
          percentage,
          status: percentage >= 33 ? "PASS" : "FAIL",
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const averagePercentage = results.length
      ? results.reduce((sum, item) => sum + item.percentage, 0) / results.length
      : 0;

    res.json({
      className,
      subjectName,
      testDate: normalizedDate,
      totalMarks: testDoc.totalMarks,
      averagePercentage,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
