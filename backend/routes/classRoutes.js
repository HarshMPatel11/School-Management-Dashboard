const express = require("express");
const router = express.Router();
const {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass,
  getClassStats,
} = require("../controllers/classController");

router.get("/stats/summary", getClassStats);
router.post("/", createClass);
router.get("/", getClasses);
router.get("/:id", getClassById);
router.put("/:id", updateClass);
router.delete("/:id", deleteClass);

module.exports = router;
