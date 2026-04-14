import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function monthToLabel(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function SalaryPaidSlip() {
  const { showToast } = useToast();
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchEmployee, setSearchEmployee] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        const res = await api.get("/salaries", { params: { all: true, limit: 5000 } });
        setRecords(res.data?.data || []);
      } catch (error) {
        showToast("Could not load salary records", "error");
      }
    };

    fetchSalaries();
  }, [showToast]);

  const filtered = useMemo(() => {
    const q = searchEmployee.trim().toLowerCase();
    const label = monthToLabel(month);
    return records.filter((r) => {
      const e = r.employee || {};
      const monthOk = !label || r.month === label;
      const searchOk = !q || [e.employeeName, e.role, e.mobile].some((v) => String(v || "").toLowerCase().includes(q));
      return monthOk && searchOk;
    });
  }, [records, month, searchEmployee]);

  const selectRecord = (record) => {
    setSelectedRecord(record);
    setSearchEmployee(`${record.employee?.employeeName || ""} - ${record.employee?.role || ""}`);
  };

  return (
    <div className="page-container fees-paid-page">
      <div className="card no-print">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Salary Paid Slip</h2>
            <p className="page-subtitle">Search salary records and print receipt.</p>
          </div>
        </div>

        <div className="fees-paid-search-box">
          <div className="fees-field">
            <label>Salary Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>

          <div className="fees-field fees-student-search-wrap">
            <label>Search Employee</label>
            <input
              placeholder="Search Employee"
              value={searchEmployee}
              onChange={(e) => {
                setSearchEmployee(e.target.value);
                setSelectedRecord(null);
              }}
            />

            {filtered.length > 0 && !selectedRecord && (
              <div className="fees-suggestion-list">
                {filtered.slice(0, 8).map((record) => (
                  <button
                    key={record._id}
                    type="button"
                    className="fees-suggestion-item"
                    onClick={() => selectRecord(record)}
                  >
                    {record.employee?.employeeName} - {record.employee?.role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="card fees-paid-receipt-card">
          <div className="fees-generate-actions no-print" style={{ justifyContent: "flex-end" }}>
            <button className="btn secondary" type="button" onClick={() => window.print()}>Print Detailed Receipt</button>
          </div>

          <div className="fees-paid-receipt-body">
            <h3>{selectedRecord.employee?.employeeName || "Employee"}</h3>
            <div className="fees-paid-lines">
              <p><span>Registration/ID :</span><strong>{selectedRecord.employee?._id?.slice(-6).toUpperCase() || "-"}</strong></p>
              <p><span>Type:</span><strong>{selectedRecord.employee?.role || "-"}</strong></p>
              <p><span>Salary Month:</span><strong>{selectedRecord.month || "-"}</strong></p>
              <p><span>Date of Receiving:</span><strong>{new Date(selectedRecord.paymentDate || Date.now()).toLocaleDateString("en-GB")}</strong></p>
              <p><span>Bonus:</span><strong>₹ {selectedRecord.bonus || 0}</strong></p>
              <p><span>Deduction:</span><strong>₹ {selectedRecord.deduction || 0}</strong></p>
              <p><span>Net Paid:</span><strong>₹ {selectedRecord.netPaid || 0}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SalaryPaidSlip;
