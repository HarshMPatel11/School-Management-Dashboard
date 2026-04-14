const express = require("express");
const router = express.Router();

const {
  assignSubjects,
  getClassesWithSubjects,
  getSubjectsByClass,
  deleteSubjectAssignment,
} = require("../controllers/subjectController");

router.post("/assign", assignSubjects);
router.get("/classes-with-subjects", getClassesWithSubjects);
router.get("/class/:classId", getSubjectsByClass);
router.delete("/:id", deleteSubjectAssignment);

module.exports = router;
