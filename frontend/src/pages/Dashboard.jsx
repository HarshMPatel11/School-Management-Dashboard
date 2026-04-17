import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  const totalFeeTarget = feesData.collected + feesData.due;
  const collectionPercent =
    totalFeeTarget > 0 ? (feesData.collected / totalFeeTarget) * 100 : 0;
  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      detail: "Active learners across all classes",
      accentClass: "stat-card--indigo",
      eyebrow: "Enrollment",
    },
    {
      title: "Attendance Marked",
      value: stats.todayAttendanceMarked,
      detail: `${unmarkedCount} students still pending for today`,
      accentClass: "stat-card--violet",
      eyebrow: "Attendance",
    },
    {
      title: "Fees Collected",
      value: `Rs ${feesData.collected.toLocaleString()}`,
      detail: `${feesData.paid} students fully paid`,
      accentClass: "stat-card--rose",
      eyebrow: "Cash Flow",
    },
    {
      title: "Total Due",
      value: `Rs ${feesData.due.toLocaleString()}`,
      detail: `${feesData.unpaid} accounts still unpaid`,
      accentClass: "stat-card--sky",
      eyebrow: "Outstanding",
    },
  ];

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

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Quick Snapshot</p>
            <h2 className="section-title">Live metrics for today</h2>
          </div>
          <p className="section-copy">High-level numbers for attendance, enrollment and fee movement.</p>
        </div>

        <div className="cards-grid dashboard-cards">
          {statCards.map((card) => (
            <article key={card.title} className={`stat-card dashboard-stat-card ${card.accentClass}`}>
              <div className="stat-card-topline">
                <span className="stat-eyebrow">{card.eyebrow}</span>
              </div>
              <h4>{card.title}</h4>
              <p>{card.value}</p>
              <span className="stat-detail">{card.detail}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-section dashboard-section--insights">
        <div className="section-heading section-heading--split">
          <div>
            <p className="section-kicker">Detailed Insights</p>
            <h2 className="section-title">Attendance and fee analysis</h2>
          </div>
          <p className="section-copy">This area is more detailed, so the cards are designed like working panels instead of summary tiles.</p>
        </div>

        <div className="dashboard-bottom-grid">
          <article className="card today-panel present-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Attendance Board</span>
                <h3>Today Present Students</h3>
              </div>
              <span className="pill pill-success">{presentStudents.length}</span>
            </div>
            {renderStudentList(
              presentStudents,
              "No students marked present yet for today."
            )}
          </article>

          <article className="card today-panel absent-panel">
            <div className="panel-header">
              <div>
                <span className="panel-kicker">Attendance Board</span>
                <h3>Today Absent Students</h3>
              </div>
              <span className="pill pill-danger">{absentStudents.length}</span>
            </div>
            {renderStudentList(absentStudents, "No students marked absent today.")}
            <p className="helper-note">Not marked yet: {unmarkedCount}</p>
          </article>
        </div>

        <section className="charts-grid">
          <article className="card chart-card chart-card--collections">
            <div className="card-header">
              <div>
                <span className="panel-kicker">Finance View</span>
                <h3>Fees Collections This Month</h3>
              </div>
              <span className="chart-badge chart-badge--success">{collectionPercent.toFixed(1)}%</span>
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

          <article className="card chart-card chart-card--status">
            <div className="card-header">
              <div>
                <span className="panel-kicker">Finance View</span>
                <h3>Payment Status Breakdown</h3>
              </div>
              <span className="chart-badge chart-badge--warning">{feesData.partial} Partial</span>
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

          <article className="card chart-card fees-summary-card chart-card--summary">
            <div className="card-header">
              <div>
                <span className="panel-kicker">Collection Health</span>
                <h3>Fee Summary</h3>
              </div>
              <span className="chart-badge chart-badge--neutral">{feesData.unpaid} Open</span>
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
                  style={{ width: `${collectionPercent}%` }}
                ></div>
              </div>
              <p className="progress-label">{collectionPercent.toFixed(1)}% Collected</p>
            </div>
          </article>
        </section>
      </section>
    </div>
  );
}

export default Dashboard;
