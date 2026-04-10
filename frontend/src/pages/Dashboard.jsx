import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const getTodayDate = () => new Date().toISOString().slice(0, 10);

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayAttendanceMarked: 0,
    totalCollected: 0,
    totalDue: 0,
  });
  const [presentStudents, setPresentStudents] = useState([]);
  const [absentStudents, setAbsentStudents] = useState([]);
  const [unmarkedCount, setUnmarkedCount] = useState(0);
  const [feesData, setFeesData] = useState({
    collected: 0,
    due: 0,
    paid: 0,
    partial: 0,
    unpaid: 0,
  });
  const [paymentStatusChart, setPaymentStatusChart] = useState([]);
  const [feesPieData, setFeesPieData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const today = getTodayDate();

      try {
        const [statsRes, studentsRes, attendanceRes, feesRes] = await Promise.all([
          api.get("/students/stats/summary"),
          api.get("/students", { params: { page: 1, limit: 1000 } }),
          api.get("/attendance", { params: { date: today, page: 1, limit: 1000 } }),
          api.get("/fees", { params: { page: 1, limit: 1000 } }),
        ]);

        const students = studentsRes.data?.data || [];
        const attendanceRecords = attendanceRes.data?.data || [];
        const feeRecords = feesRes.data?.data || [];

        const attendanceByStudentId = new Map();
        attendanceRecords.forEach((record) => {
          if (record.student?._id) {
            attendanceByStudentId.set(record.student._id, record.status);
          }
        });

        const present = students.filter((student) => {
          const status = attendanceByStudentId.get(student._id);
          return status === "Present" || status === "Late";
        });

        const absent = students.filter((student) => {
          const status = attendanceByStudentId.get(student._id);
          return status === "Absent";
        });

        // Calculate fees data
        let totalCollected = 0;
        let totalDue = 0;
        let paidCount = 0;
        let partialCount = 0;
        let unpaidCount = 0;

        feeRecords.forEach((fee) => {
          totalCollected += fee.paidFee || 0;
          totalDue += fee.dueFee || 0;
          if (fee.paymentStatus === "Paid") paidCount++;
          else if (fee.paymentStatus === "Partial") partialCount++;
          else if (fee.paymentStatus === "Unpaid") unpaidCount++;
        });

        setStats(statsRes.data || {});
        setPresentStudents(present);
        setAbsentStudents(absent);
        setUnmarkedCount(Math.max(students.length - attendanceByStudentId.size, 0));

        setFeesData({
          collected: totalCollected,
          due: totalDue,
          paid: paidCount,
          partial: partialCount,
          unpaid: unpaidCount,
        });

        setPaymentStatusChart([
          { name: "Paid", value: paidCount, fill: "#10b981" },
          { name: "Partial", value: partialCount, fill: "#f59e0b" },
          { name: "Unpaid", value: unpaidCount, fill: "#ef4444" },
        ]);

        setFeesPieData([
          {
            name: "Collections",
            value: totalCollected,
            fill: "#10b981",
          },
          {
            name: "Remaining",
            value: totalDue,
            fill: "#ef4444",
          },
        ]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const todayDateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const renderStudentList = (students, emptyText) => {
    if (loading) {
      return <p className="dashboard-empty">Loading attendance data...</p>;
    }

    if (students.length === 0) {
      return <p className="dashboard-empty">{emptyText}</p>;
    }

    return (
      <ul className="today-list">
        {students.map((student) => (
          <li key={student._id} className="today-list-item">
            <div>
              <p className="student-name">{student.fullName}</p>
              <p className="student-meta">
                Class {student.className} - {student.section} | Roll {student.rollNumber}
              </p>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="dashboard-shell">
      <section className="hero-banner">
        <div>
          <p className="hero-kicker">School Operations</p>
          <h1>Daily Control Center</h1>
          <p className="hero-subtitle">
            Track attendance, fee flow and classroom activity from one place.
          </p>
        </div>
        <div className="hero-date-chip">{todayDateLabel}</div>
      </section>

      <section className="cards-grid dashboard-cards">
        <div className="stat-card stat-card--indigo">
          <h4>Total Students</h4>
          <p>{stats.totalStudents}</p>
        </div>
        <div className="stat-card stat-card--violet">
          <h4>Attendance Marked Today</h4>
          <p>{stats.todayAttendanceMarked}</p>
        </div>
        <div className="stat-card stat-card--rose">
          <h4>Fees Collected</h4>
          <p>Rs {feesData.collected.toLocaleString()}</p>
        </div>
        <div className="stat-card stat-card--sky">
          <h4>Total Due</h4>
          <p>Rs {feesData.due.toLocaleString()}</p>
        </div>
      </section>

      <section className="dashboard-bottom-grid">
        <article className="card today-panel present-panel">
          <div className="panel-header">
            <h3>Today Present Students</h3>
            <span className="pill pill-success">{presentStudents.length}</span>
          </div>
          {renderStudentList(
            presentStudents,
            "No students marked present yet for today."
          )}
        </article>

        <article className="card today-panel absent-panel">
          <div className="panel-header">
            <h3>Today Absent Students</h3>
            <span className="pill pill-danger">{absentStudents.length}</span>
          </div>
          {renderStudentList(absentStudents, "No students marked absent today.")}
          <p className="helper-note">Not marked yet: {unmarkedCount}</p>
        </article>
      </section>

      <section className="charts-grid">
        <article className="card chart-card">
          <div className="card-header">
            <h3>Fees Collections This Month</h3>
          </div>
          <div className="chart-wrapper pie-chart-wrapper">
            {feesPieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={feesPieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: Rs ${value.toLocaleString()}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {feesPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `Rs ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="dashboard-empty">No fees data available</p>
            )}
          </div>
        </article>

        <article className="card chart-card">
          <div className="card-header">
            <h3>Payment Status Breakdown</h3>
          </div>
          <div className="chart-wrapper">
            {paymentStatusChart.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={paymentStatusChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="dashboard-empty">No payment data available</p>
            )}
          </div>
        </article>

        <article className="card chart-card fees-summary-card">
          <div className="card-header">
            <h3>Fee Summary</h3>
          </div>
          <div className="fee-summary-grid">
            <div className="fee-summary-item">
              <p className="fee-label">Collections</p>
              <p className="fee-amount collections">Rs {feesData.collected.toLocaleString()}</p>
              <p className="fee-meta">{feesData.paid} Paid</p>
            </div>
            <div className="fee-divider"></div>
            <div className="fee-summary-item">
              <p className="fee-label">Remaining</p>
              <p className="fee-amount remaining">Rs {feesData.due.toLocaleString()}</p>
              <p className="fee-meta">{feesData.unpaid} Unpaid</p>
            </div>
          </div>
          <div className="fee-progress-container">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${
                    feesData.collected + feesData.due > 0
                      ? (feesData.collected / (feesData.collected + feesData.due)) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
            <p className="progress-label">
              {feesData.collected + feesData.due > 0
                ? (
                    (feesData.collected / (feesData.collected + feesData.due)) *
                    100
                  ).toFixed(1)
                : 0}
              % Collected
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}

export default Dashboard;
