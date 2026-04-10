import React, { useEffect, useState } from "react";
import api from "../api/axios";
import AttendanceForm from "../components/AttendanceForm";
import { useToast } from "../context/ToastContext";

function Attendance() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [dateFilter, setDateFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students", { params: { page: 1, limit: 1000 } });
      setStudents(res.data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await api.get("/attendance", {
        params: { date: dateFilter, page, limit: 10 },
      });
      setRecords(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, page]);

  useEffect(() => {
    setPage(1);
  }, [dateFilter]);

  const handleSubmit = async (data) => {
    try {
      await api.post("/attendance", data);

      if (page !== 1) {
        setPage(1);
        return;
      }

      showToast("Attendance saved successfully", "success");
      fetchAttendance();
    } catch (error) {
      showToast(error.response?.data?.message || "Could not save attendance", "error");
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

        <div className="pagination-row">
          <button
            className="btn secondary"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={pagination.page <= 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages} | Total: {pagination.total}
          </span>
          <button
            className="btn secondary"
            onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages || 1))}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
