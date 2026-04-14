const express = require("express");
const router = express.Router();

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");
const { uploadEmployeePhoto } = require("../middleware/uploadMiddleware");

router.post("/", uploadEmployeePhoto.single("photo"), createEmployee);
router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.put("/:id", uploadEmployeePhoto.single("photo"), updateEmployee);
router.delete("/:id", deleteEmployee);

module.exports = router;
