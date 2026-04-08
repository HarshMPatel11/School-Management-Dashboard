import React, { useEffect, useState } from "react";
import api from "../api/axios";

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendanceMarked: 0,
    totalCollected: 0,
    totalDue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/students/stats/summary");
        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="cards-grid">
        <div className="stat-card">
          <h4>Total Students</h4>
          <p>{stats.totalStudents}</p>
        </div>
        <div className="stat-card">
          <h4>Attendance Marked Today</h4>
          <p>{stats.todayAttendanceMarked}</p>
        </div>
        <div className="stat-card">
          <h4>Fees Collected</h4>
          <p>Rs {stats.totalCollected}</p>
        </div>
        <div className="stat-card">
          <h4>Total Due</h4>
          <p>Rs {stats.totalDue}</p>
        </div>
      </div>

      <div className="card mt-20">
        <h3>Project Modules</h3>
        <div className="info-grid">
          <div>
            <h4>Student List</h4>
            <p>Add, edit, delete, search and filter student records.</p>
          </div>
          <div>
            <h4>Attendance System</h4>
            <p>Mark attendance by date and track present, absent and late records.</p>
          </div>
          <div>
            <h4>Fees Management</h4>
            <p>Track paid amount, due amount and payment status for each student.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
