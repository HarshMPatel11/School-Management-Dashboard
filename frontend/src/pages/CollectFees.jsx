import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const DEFAULT_ITEMS = [
  { label: "MONTHLY FEE", amount: 25000 },
  { label: "ADMISSION FEE", amount: 0 },
  { label: "REGISTRATION FEE", amount: 0 },
  { label: "ART MATERIAL", amount: 0 },
  { label: "TRANSPORT", amount: 0 },
  { label: "BOOKS", amount: 0 },
  { label: "UNIFORM", amount: 0 },
  { label: "FINE", amount: 0 },
  { label: "OTHERS", amount: 0 },
  { label: "PREVIOUS BALANCE", amount: 0 },
  { label: "DISCOUNT IN FEE 0 %", amount: 0 },
];

const monthLabelFromValue = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

function CollectFees() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("student");
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeMonth, setFeeMonth] = useState(new Date().toISOString().slice(0, 7));
  const [feeDate, setFeeDate] = useState(new Date().toISOString().slice(0, 10));
  const [lineItems, setLineItems] = useState(DEFAULT_ITEMS);
  const [deposit, setDeposit] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students", { params: { all: true, limit: 5000 } });
        setStudents(res.data?.data || []);
      } catch (error) {
        showToast("Could not load students", "error");
      }
    };

    fetchStudents();
  }, [showToast]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return students
      .filter((s) => [s.fullName, s.rollNumber, s.className].some((v) => String(v || "").toLowerCase().includes(q)))
      .slice(0, 8);
  }, [search, students]);

  const total = useMemo(() => lineItems.reduce((sum, item) => sum + Number(item.amount || 0), 0), [lineItems]);
  const due = Math.max(total - Number(deposit || 0), 0);

  const onSelectStudent = (student) => {
    setSelectedStudent(student);
    setSearch(`${student.rollNumber} - ${student.fullName} - ${student.className}`);
  };

  const updateLineAmount = (index, value) => {
    const amount = Number(value || 0);
    setLineItems((prev) => prev.map((item, i) => (i === index ? { ...item, amount } : item)));
  };

  const submitFees = async () => {
    if (!selectedStudent) {
      showToast("Please select a student", "warning");
      return;
    }

    const month = monthLabelFromValue(feeMonth);
    if (!month) {
      showToast("Please select fee month", "warning");
      return;
    }

    setSaving(true);
    try {
      const existingRes = await api.get("/fees", {
        params: {
          student: selectedStudent._id,
          month,
          all: true,
          limit: 5000,
        },
      });

      const existing = existingRes.data?.data?.[0];
      if (existing) {
        const alreadyPaid = Number(existing.paidFee || 0);
        const newPaid = Math.min(alreadyPaid + Number(deposit || 0), Number(total || 0));

        await api.put(`/fees/${existing._id}`, {
          student: selectedStudent._id,
          month,
          totalFee: Number(total || 0),
          paidFee: newPaid,
        });
      } else {
        await api.post("/fees", {
          student: selectedStudent._id,
          month,
          totalFee: Number(total || 0),
          paidFee: Number(deposit || 0),
        });
      }

      showToast("Fees submitted successfully", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit fees", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container fees-collect-page">
      <div className="card">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Collect Fees</h2>
            <p className="page-subtitle">Student wise fee collection and deposit entry.</p>
          </div>
        </div>

        <div className="fees-tabs">
          <button className={`fees-tab ${activeTab === "student" ? "active" : ""}`} onClick={() => setActiveTab("student")} type="button">Student Wise</button>
          <button className={`fees-tab ${activeTab === "family" ? "active" : ""}`} onClick={() => setActiveTab("family")} type="button">Family Wise</button>
          <button className={`fees-tab ${activeTab === "scan" ? "active" : ""}`} onClick={() => setActiveTab("scan")} type="button">Scanning Paid Invoices</button>
        </div>

        {activeTab !== "student" ? (
          <div className="empty-panel">This mode can be added next. Use Student Wise for now.</div>
        ) : (
          <>
            <div className="fees-field fees-student-search-wrap">
              <label>Search Student</label>
              <input
                placeholder="Search Student"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedStudent(null);
                }}
              />

              {suggestions.length > 0 && !selectedStudent && (
                <div className="fees-suggestion-list">
                  {suggestions.map((s) => (
                    <button
                      key={s._id}
                      type="button"
                      className="fees-suggestion-item"
                      onClick={() => onSelectStudent(s)}
                    >
                      {s.rollNumber} - {s.fullName} - {s.className}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="fees-collection-card">
                <h3>Fees Collection</h3>

                <div className="fees-student-head-grid">
                  <div><span>Registration</span><strong>{selectedStudent.rollNumber}</strong></div>
                  <div><span>Student Name</span><strong>{selectedStudent.fullName}</strong></div>
                  <div><span>Guardian Name</span><strong>{selectedStudent.parentName || "-"}</strong></div>
                  <div><span>Class</span><strong>{selectedStudent.className}</strong></div>
                </div>

                <div className="fees-generate-grid" style={{ marginTop: 10 }}>
                  <div className="fees-field">
                    <label>Fees Month</label>
                    <input type="month" value={feeMonth} onChange={(e) => setFeeMonth(e.target.value)} />
                  </div>
                  <div className="fees-field">
                    <label>Date</label>
                    <input type="date" value={feeDate} onChange={(e) => setFeeDate(e.target.value)} />
                  </div>
                </div>

                <div className="fees-line-table-wrap" style={{ marginTop: 12 }}>
                  <table className="fees-line-table">
                    <thead>
                      <tr>
                        <th>Sr.</th>
                        <th>Particulars</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={`${item.label}-${index}`}>
                          <td>{index + 1}</td>
                          <td>{item.label}</td>
                          <td>
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) => updateLineAmount(index, e.target.value)}
                              className="fees-amount-input"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2">TOTAL</td>
                        <td>₹ {total}</td>
                      </tr>
                      <tr>
                        <td colSpan="2">DEPOSIT</td>
                        <td>
                          <input
                            type="number"
                            value={deposit}
                            onChange={(e) => setDeposit(Number(e.target.value || 0))}
                            className="fees-amount-input"
                          />
                        </td>
                      </tr>
                      <tr>
                        <td colSpan="2">DUE-ABLE BALANCE</td>
                        <td style={{ color: "#ea580c", fontWeight: 800 }}>₹ {due}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="fees-generate-actions">
                  <button className="btn primary" type="button" disabled={saving} onClick={submitFees}>
                    {saving ? "Submitting..." : "Submit Fees"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default CollectFees;
