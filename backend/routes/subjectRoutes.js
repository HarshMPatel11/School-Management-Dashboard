const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  assignSubjects,
  getClassesWithSubjects,
  getSubjectsByClass,
  deleteSubjectAssignment,
} = require("../controllers/subjectController");

router.use(protect);

router.post("/assign", authorizeRoles("admin", "employee"), assignSubjects);
router.get("/classes-with-subjects", authorizeRoles("admin", "employee"), getClassesWithSubjects);
router.get("/class/:classId", authorizeRoles("admin", "employee"), getSubjectsByClass);
router.delete("/:id", authorizeRoles("admin"), deleteSubjectAssignment);

module.exports = router;
