const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { uploadEmployeePhoto } = require("../middleware/uploadMiddleware");

router.use(protect);

router.post("/", authorizeRoles("admin"), uploadEmployeePhoto.single("photo"), createEmployee);
router.get("/", authorizeRoles("admin"), getEmployees);
router.get("/:id", authorizeRoles("admin"), getEmployeeById);
router.put("/:id", authorizeRoles("admin"), uploadEmployeePhoto.single("photo"), updateEmployee);
router.delete("/:id", authorizeRoles("admin"), deleteEmployee);

module.exports = router;
