import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function monthToLabel(value) {
  if (!value) return "";
  const [year, month] = value.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function FeesPaidSlip() {
  const { showToast } = useToast();
  const [fees, setFees] = useState([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [searchStudent, setSearchStudent] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [printMode, setPrintMode] = useState("detailed");

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await api.get("/fees", { params: { all: true, limit: 5000 } });
        setFees(res.data?.data || []);
      } catch (error) {
        showToast("Could not load fee records", "error");
      }
    };

    fetchFees();
  }, [showToast]);

  const filteredRecords = useMemo(() => {
    const q = searchStudent.trim().toLowerCase();
    const monthLabel = monthToLabel(month);

    return fees.filter((fee) => {
      const student = fee.student || {};
      const matchesMonth = !monthLabel || fee.month === monthLabel;
      const matchesSearch = !q || [student.fullName, student.rollNumber, student.className].some((v) => String(v || "").toLowerCase().includes(q));
      return matchesMonth && matchesSearch;
    });
  }, [fees, month, searchStudent]);

  const selectRecord = (record) => {
    setSelectedRecord(record);
    const student = record.student || {};
    setSearchStudent(`${student.rollNumber || ""} - ${student.fullName || ""} - ${student.className || ""}`);
  };

  const printReceipt = (mode) => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  const selectedStudentHistory = useMemo(() => {
    if (!selectedRecord?.student?._id) return [];
    const studentId = selectedRecord.student._id;
    return fees
      .filter((fee) => fee.student?._id === studentId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [fees, selectedRecord]);

  return (
    <div className={`page-container fees-paid-page print-mode-${printMode}`}>
      <div className="card no-print">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Fees Paid Slip</h2>
            <p className="page-subtitle">Search fee records and print paid receipt.</p>
          </div>
        </div>

        <div className="fees-paid-search-box">
          <div className="fees-field">
            <label>Fees Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>

          <div className="fees-field fees-student-search-wrap">
            <label>Search Student</label>
            <input
              placeholder="Search Student"
              value={searchStudent}
              onChange={(e) => {
                setSearchStudent(e.target.value);
                setSelectedRecord(null);
              }}
            />

            {filteredRecords.length > 0 && !selectedRecord && (
              <div className="fees-suggestion-list">
                {filteredRecords.slice(0, 8).map((record) => {
                  const student = record.student || {};
                  return (
                    <button
                      key={record._id}
                      type="button"
                      className="fees-suggestion-item"
                      onClick={() => selectRecord(record)}
                    >
                      {student.rollNumber} - {student.fullName} - {student.className}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div className="card fees-paid-receipt-card">
          <div className="fees-generate-actions no-print" style={{ justifyContent: "flex-end" }}>
            <button className="btn secondary" type="button" onClick={() => printReceipt("detailed")}>Print Detailed Receipt</button>
            <button className="btn secondary" type="button" onClick={() => printReceipt("mini")}>Mini Receipt</button>
          </div>

          <div className="fees-paid-receipt-body receipt-detailed">
            <h3>Fee Submission Slip</h3>

            <div className="receipt-detail-head">
              <div className="receipt-avatar">{(selectedRecord.student?.fullName || "S").slice(0, 1).toUpperCase()}</div>
              <div className="receipt-meta-grid">
                <p><span>Reg. No:</span><strong>{selectedRecord.student?.rollNumber || "-"}</strong></p>
                <p><span>Serial No:</span><strong>{selectedRecord._id?.slice(-6).toUpperCase()}</strong></p>
                <p><span>Student Name:</span><strong>{selectedRecord.student?.fullName || "-"}</strong></p>
                <p><span>Submit Date:</span><strong>{new Date(selectedRecord.createdAt || Date.now()).toLocaleDateString("en-GB")}</strong></p>
                <p><span>Father Name:</span><strong>{selectedRecord.student?.parentName || "-"}</strong></p>
                <p><span>Fees Month:</span><strong>{selectedRecord.month || "-"}</strong></p>
                <p><span>Class:</span><strong>{selectedRecord.student?.className || "-"}</strong></p>
                <p><span>Total Amount:</span><strong>₹ {selectedRecord.totalFee || 0}</strong></p>
                <p><span>Deposit Amount:</span><strong>₹ {selectedRecord.paidFee || 0}</strong></p>
                <p><span>Remaining Balance:</span><strong>₹ {selectedRecord.dueFee || 0}</strong></p>
              </div>
            </div>

            <div className="fees-line-table-wrap" style={{ marginTop: 10 }}>
              <table className="fees-line-table">
                <thead>
                  <tr>
                    <th>Sr. No.</th>
                    <th>Particulars</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>1</td><td>MONTHLY FEE</td><td>{selectedRecord.totalFee || 0}</td></tr>
                  <tr><td>2</td><td>ADMISSION FEE</td><td>0</td></tr>
                  <tr><td>3</td><td>REGISTRATION FEE</td><td>0</td></tr>
                  <tr><td>4</td><td>ART MATERIAL</td><td>0</td></tr>
                  <tr><td>5</td><td>TRANSPORT</td><td>0</td></tr>
                  <tr><td>6</td><td>BOOKS</td><td>0</td></tr>
                  <tr><td>7</td><td>UNIFORM</td><td>0</td></tr>
                </tbody>
                <tfoot>
                  <tr><td colSpan="2">TOTAL</td><td>{selectedRecord.totalFee || 0}</td></tr>
                  <tr><td colSpan="2">DEPOSIT</td><td>{selectedRecord.paidFee || 0}</td></tr>
                  <tr><td colSpan="2">DUE-ABLE BALANCE</td><td>{selectedRecord.dueFee || 0}</td></tr>
                </tfoot>
              </table>
            </div>

            <div className="fees-history-wrap">
              <h4>Fee Submission Statement of {selectedRecord.student?.fullName || "Student"}</h4>
              <table className="fees-line-table">
                <thead>
                  <tr>
                    <th>Sr#</th>
                    <th>Submission Date</th>
                    <th>Fee Month</th>
                    <th>Total Amount</th>
                    <th>Deposit</th>
                    <th>Due-able</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStudentHistory.map((item, idx) => (
                    <tr key={item._id}>
                      <td>{idx + 1}</td>
                      <td>{new Date(item.createdAt || Date.now()).toLocaleDateString("en-GB")}</td>
                      <td>{item.month}</td>
                      <td>{item.totalFee}</td>
                      <td>{item.paidFee}</td>
                      <td>{item.dueFee}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="receipt-sign-row">
              <span>Prepared By :</span>
              <span>Accounts Department</span>
            </div>
          </div>

          <div className="fees-paid-receipt-body receipt-mini">
            <h3>Fee Submission Slip</h3>
            <div className="fees-paid-lines">
              <p><span>Reg. No:</span><strong>{selectedRecord.student?.rollNumber || "-"}</strong></p>
              <p><span>Student Name:</span><strong>{selectedRecord.student?.fullName || "-"}</strong></p>
              <p><span>Class:</span><strong>{selectedRecord.student?.className || "-"}</strong></p>
              <p><span>Fee Month:</span><strong>{selectedRecord.month || "-"}</strong></p>
              <p><span>Total Amount:</span><strong>₹ {selectedRecord.totalFee || 0}</strong></p>
              <p><span>Deposit:</span><strong>₹ {selectedRecord.paidFee || 0}</strong></p>
              <p><span>Remaining Balance:</span><strong>₹ {selectedRecord.dueFee || 0}</strong></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeesPaidSlip;
