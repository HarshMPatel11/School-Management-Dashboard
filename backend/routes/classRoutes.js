const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  getClassStats,
} = require("../controllers/classController");

router.use(protect);

router.get("/stats/summary", authorizeRoles("admin", "employee"), getClassStats);
router.post("/", authorizeRoles("admin"), createClass);
router.get("/", authorizeRoles("admin", "employee"), getClasses);
router.get("/:id", authorizeRoles("admin", "employee"), getClassById);
router.put("/:id", authorizeRoles("admin"), updateClass);
router.delete("/:id", authorizeRoles("admin"), deleteClass);

module.exports = router;
