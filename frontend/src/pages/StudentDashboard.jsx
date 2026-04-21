import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function StudentDashboard() {
  const { showToast } = useToast();
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/student-portal/dashboard");
        setData(res.data);
      } catch (error) {
        showToast("Could not load student dashboard", "error");
      }
    };
    load();
  }, [showToast]);

  const latestFees = useMemo(() => data?.fees || [], [data]);
  const classTests = useMemo(() => data?.classTestSummary || [], [data]);

  if (!data) {
    return <div className="loading-screen">Loading...</div>;
  }

  const student = data.student || {};
  const attendance = data.attendance || {};
  const latestExam = data.latestExam;

  return (
    <div className="student-portal">
      <section className="student-hero">
        <div className="student-profile-card">
          <div className="student-profile-avatar">
            {(student.fullName || "S").split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
          </div>
          <h2>{student.fullName}</h2>
          <div className="student-profile-meta">
            <p><span>Registration No</span><strong>{student.rollNumber}</strong></p>
            <p><span>Date of Admission</span><strong>{student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "-"}</strong></p>
            <p><span>Class</span><strong>{student.className} {student.section}</strong></p>
            <p><span>Family</span><strong>{student.parentName || "-"}</strong></p>
          </div>
        </div>

        <div className="student-banner-card">
          <p className="student-banner-kicker">Welcome {student.fullName}</p>
          <h1>Student Portal Dashboard</h1>
          <p>Track attendance, exam scores, class tests and fee receipts from one place.</p>
        </div>
      </section>

      <section className="student-dashboard-grid">
        <div className="card">
          <h3>Attendance Report</h3>
          <div className="student-stat-grid">
            <div><span>Overall</span><strong>{Number(attendance.percentage || 0).toFixed(2)}%</strong></div>
            <div><span>Presents</span><strong>{attendance.present || 0}</strong></div>
            <div><span>Leaves</span><strong>{attendance.late || 0}</strong></div>
            <div><span>Absents</span><strong>{attendance.absent || 0}</strong></div>
          </div>
        </div>

        <div className="card">
          <h3>Examination Report</h3>
          {latestExam ? (
            <div className="student-stat-grid">
              <div><span>Latest Exam</span><strong>{latestExam.examName}</strong></div>
              <div><span>Obtained</span><strong>{latestExam.obtainedMarks}</strong></div>
              <div><span>Total</span><strong>{latestExam.totalMarks}</strong></div>
              <div><span>Overall</span><strong>{latestExam.percentage.toFixed(1)}%</strong></div>
            </div>
          ) : (
            <p className="muted">No exam result found yet.</p>
          )}
        </div>

        <div className="card">
          <h3>Class Tests Report</h3>
          {classTests.length === 0 ? (
            <p className="muted">No class test data found yet.</p>
          ) : (
            <div className="student-mini-list">
              {classTests.map((item) => (
                <div key={item.subjectName} className="student-mini-row">
                  <div>
                    <strong>{item.subjectName}</strong>
                    <p>{item.totalTests} tests</p>
                  </div>
                  <span>{item.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Fee Report</h3>
          {latestFees.length === 0 ? (
            <p className="muted">No fee receipts found yet.</p>
          ) : (
            <div className="student-mini-list">
              {latestFees.map((fee) => (
                <div key={fee._id} className="student-mini-row">
                  <div>
                    <strong>Rs {Number(fee.paidFee || 0).toLocaleString()}</strong>
                    <p>{fee.month}</p>
                  </div>
                  <span className={`badge ${fee.paymentStatus === "Paid" ? "paid" : fee.paymentStatus === "Partial" ? "partial" : "unpaid"}`}>
                    {fee.paymentStatus}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;
