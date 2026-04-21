const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createSalary,
  getSalaries,
  updateSalary,
  deleteSalary,
} = require("../controllers/salaryController");

router.use(protect);

router.post("/", authorizeRoles("admin"), createSalary);
router.get("/", authorizeRoles("admin"), getSalaries);
router.put("/:id", authorizeRoles("admin"), updateSalary);
router.delete("/:id", authorizeRoles("admin"), deleteSalary);

module.exports = router;
