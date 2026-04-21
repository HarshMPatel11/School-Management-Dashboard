const ClassModel = require("../models/Class");
const Exam = require("../models/Exam");
const ExamMark = require("../models/ExamMark");
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

const getClassSubjectConfig = async (className) => {
  const classDoc = await ClassModel.findOne({ name: className.trim() });
  if (!classDoc) {
    const error = new Error("Class not found");
    error.statusCode = 404;
    throw error;
  }

  const subjectDoc = await Subject.findOne({ classRef: classDoc._id });
  if (!subjectDoc || !subjectDoc.subjects.length) {
    const error = new Error("Assign subjects to this class before adding marks");
    error.statusCode = 400;
    throw error;
  }

  return subjectDoc.subjects.map((item) => ({
    name: item.name,
    marks: Number(item.marks || 0),
  }));
};

const buildExamEntry = (studentId, incomingMarks, subjectConfig) => {
  const marksBySubject = new Map(
    (incomingMarks || []).map((item) => [String(item.subjectName || "").trim(), Number(item.obtainedMarks)])
  );

  return {
    student: studentId,
    marks: subjectConfig.map((subject) => {
      const obtained = Number(marksBySubject.get(subject.name) || 0);
      if (!Number.isFinite(obtained) || obtained < 0 || obtained > subject.marks) {
        const error = new Error(`Invalid marks for ${subject.name}`);
        error.statusCode = 400;
        throw error;
      }

      return {
        subjectName: subject.name,
        totalMarks: subject.marks,
        obtainedMarks: obtained,
      };
    }),
  };
};

const computeEntrySummary = (entry) => {
  const totalMarks = entry.marks.reduce((sum, item) => sum + Number(item.totalMarks || 0), 0);
  const obtainedMarks = entry.marks.reduce((sum, item) => sum + Number(item.obtainedMarks || 0), 0);
  const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;

  return {
    totalMarks,
    obtainedMarks,
    percentage,
    status: percentage >= 33 ? "PASS" : "FAIL",
  };
};

exports.createExam = async (req, res) => {
  try {
    const { name = "", startDate, endDate, published = true } = req.body;
    const normalizedName = String(name).trim();
    const start = normalizeDateOnly(startDate);
    const end = normalizeDateOnly(endDate);

    if (!normalizedName || !start || !end) {
      return res.status(400).json({ message: "Name, start date and end date are required" });
    }

    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const exam = await Exam.create({
      name: normalizedName,
      startDate: start,
      endDate: end,
      published: Boolean(published),
    });

    res.status(201).json(exam);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "An exam with this name already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ startDate: -1, createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const { name = "", startDate, endDate, published } = req.body;
    const updates = {};

    if (name !== undefined) {
      updates.name = String(name).trim();
    }
    if (startDate !== undefined) {
      updates.startDate = normalizeDateOnly(startDate);
    }
    if (endDate !== undefined) {
      updates.endDate = normalizeDateOnly(endDate);
    }
    if (published !== undefined) {
      updates.published = Boolean(published);
    }

    if ((startDate !== undefined && !updates.startDate) || (endDate !== undefined && !updates.endDate)) {
      return res.status(400).json({ message: "Invalid exam date provided" });
    }

    const existing = await Exam.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const effectiveStart = updates.startDate || existing.startDate;
    const effectiveEnd = updates.endDate || existing.endDate;
    if (effectiveEnd < effectiveStart) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    Object.assign(existing, updates);
    await existing.save();

    res.json(existing);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "An exam with this name already exists." });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const deleted = await Exam.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Exam not found" });
    }

    await ExamMark.deleteMany({ exam: req.params.id });
    res.json({ message: "Exam deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExamMarksSheet = async (req, res) => {
  try {
    const { examId = "", className = "" } = req.query;
    if (!examId || !className) {
      return res.status(400).json({ message: "Exam and class are required" });
    }

    const [exam, subjectConfig, students, markDoc] = await Promise.all([
      Exam.findById(examId),
      getClassSubjectConfig(className),
      Student.find({ className }).sort({ rollNumber: 1 }),
      ExamMark.findOne({ exam: examId, className }),
    ]);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const entryMap = new Map(
      (markDoc?.entries || []).map((entry) => [
        String(entry.student),
        Object.fromEntries((entry.marks || []).map((mark) => [mark.subjectName, Number(mark.obtainedMarks || 0)])),
      ])
    );

    const rows = students.map((student) => ({
      studentId: student._id,
      rollNumber: student.rollNumber,
      fullName: student.fullName,
      marks: subjectConfig.map((subject) => ({
        subjectName: subject.name,
        totalMarks: subject.marks,
        obtainedMarks: entryMap.get(String(student._id))?.[subject.name] ?? "",
      })),
    }));

    res.json({
      exam,
      className,
      subjects: subjectConfig,
      rows,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.saveExamMarks = async (req, res) => {
  try {
    const { examId = "", className = "", entries = [] } = req.body;
    if (!examId || !className) {
      return res.status(400).json({ message: "Exam and class are required" });
    }

    const [exam, subjectConfig, students] = await Promise.all([
      Exam.findById(examId),
      getClassSubjectConfig(className),
      Student.find({ className }, { _id: 1 }),
    ]);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const validStudentIds = new Set(students.map((student) => String(student._id)));
    const normalizedEntries = (entries || []).map((entry) => {
      const studentId = String(entry.studentId || "").trim();
      if (!validStudentIds.has(studentId)) {
        const error = new Error("One or more students do not belong to the selected class");
        error.statusCode = 400;
        throw error;
      }

      return buildExamEntry(studentId, entry.marks, subjectConfig);
    });

    const doc = await ExamMark.findOneAndUpdate(
      { exam: examId, className },
      { exam: examId, className, entries: normalizedEntries },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "Exam marks saved successfully", doc });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getExamStudentResult = async (req, res) => {
  try {
    const { examId = "", studentId = "" } = req.query;
    if (!examId || !studentId) {
      return res.status(400).json({ message: "Exam and student are required" });
    }

    const [exam, student] = await Promise.all([
      Exam.findById(examId),
      Student.findById(studentId),
    ]);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const markDoc = await ExamMark.findOne({ exam: examId, className: student.className }).populate("entries.student", "fullName rollNumber className section");
    const entry = (markDoc?.entries || []).find((item) => String(item.student?._id || item.student) === String(studentId));

    if (!entry) {
      return res.status(404).json({ message: "Marks not found for this student and exam" });
    }

    const summary = computeEntrySummary(entry);
    res.json({
      exam,
      student,
      marks: entry.marks,
      summary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getExamClassResults = async (req, res) => {
  try {
    const { examId = "", className = "" } = req.query;
    if (!examId || !className) {
      return res.status(400).json({ message: "Exam and class are required" });
    }

    const [exam, markDoc] = await Promise.all([
      Exam.findById(examId),
      ExamMark.findOne({ exam: examId, className }).populate("entries.student", "fullName rollNumber className section"),
    ]);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }
    if (!markDoc) {
      return res.status(404).json({ message: "No marks found for this exam and class" });
    }

    const results = markDoc.entries
      .filter((entry) => entry.student)
      .map((entry) => {
        const summary = computeEntrySummary(entry);
        return {
          studentId: entry.student._id,
          rollNumber: entry.student.rollNumber,
          fullName: entry.student.fullName,
          className: entry.student.className,
          section: entry.student.section,
          marks: entry.marks,
          ...summary,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);

    const subjectAverages = markDoc.entries.length
      ? markDoc.entries[0].marks.map((subject) => {
          const subjectName = subject.subjectName;
          const total = markDoc.entries.reduce((sum, entry) => {
            const matched = entry.marks.find((item) => item.subjectName === subjectName);
            return sum + Number(matched?.obtainedMarks || 0);
          }, 0);

          return {
            subjectName,
            averageMarks: total / markDoc.entries.length,
          };
        })
      : [];

    res.json({
      exam,
      className,
      results,
      subjectAverages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
