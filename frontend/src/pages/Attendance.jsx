import React, { useEffect, useState } from "react";
import api from "../api/axios";
import AttendanceForm from "../components/AttendanceForm";

function Attendance() {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance", {
        params: { date: dateFilter },
      });
      setRecords(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter]);

  const handleSubmit = async (data) => {
    try {
      await api.post("/attendance", data);
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || "Could not save attendance");
    }
  };

  return (
    <div className="page-grid">
      <AttendanceForm students={students} onSubmit={handleSubmit} />

      <div className="card">
        <div className="toolbar single-filter">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll No</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-row">No attendance records found</td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record._id}>
                    <td>{record.student?.fullName}</td>
                    <td>{record.student?.rollNumber}</td>
                    <td>{record.date}</td>
                    <td>
                      <span className={`badge ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
