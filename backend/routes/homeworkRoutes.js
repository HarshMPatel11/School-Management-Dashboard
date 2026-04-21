const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createHomework,
  getHomework,
  updateHomework,
  deleteHomework,
} = require("../controllers/homeworkController");

router.use(protect, authorizeRoles("admin", "employee"));

router.get("/", getHomework);
router.post("/", createHomework);
router.put("/:id", updateHomework);
router.delete("/:id", deleteHomework);

module.exports = router;
