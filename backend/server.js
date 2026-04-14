const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const User = require("./models/User");

dotenv.config();
connectDB();

const ensureAdminUser = async () => {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@school.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const adminName = process.env.ADMIN_NAME || "System Admin";

  const existingAdmin = await User.findOne({ email: adminEmail });
  if (existingAdmin) {
    return;
  }

  await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: "admin",
  });

  console.log(`Default admin user created: ${adminEmail}`);
};

ensureAdminUser().catch((error) => {
  console.error("Failed to ensure admin user:", error.message);
});

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("School Management Dashboard API is running");
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/salaries", require("./routes/salaryRoutes"));
app.use("/api/classes", require("./routes/classRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));

app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "Image must be 100KB or smaller." });
  }

  if (err && err.message === "Only image files are allowed.") {
    return res.status(400).json({ message: err.message });
  }

  return next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
