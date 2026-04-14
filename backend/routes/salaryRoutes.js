const express = require("express");
const router = express.Router();

const {
  createSalary,
  getSalaries,
  updateSalary,
  deleteSalary,
} = require("../controllers/salaryController");

router.post("/", createSalary);
router.get("/", getSalaries);
router.put("/:id", updateSalary);
router.delete("/:id", deleteSalary);

module.exports = router;
