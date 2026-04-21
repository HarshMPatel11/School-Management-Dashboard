import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function StudentFeeReceipt() {
  const { showToast } = useToast();
  const [data, setData] = useState({ student: null, fees: [] });
  const [selectedRecordId, setSelectedRecordId] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/student-portal/fees");
        const fees = res.data.fees || [];
        setData({ student: res.data.student, fees });
        if (fees[0]) setSelectedRecordId(fees[0]._id);
      } catch (error) {
        showToast("Could not load fee receipts", "error");
      }
    };
    load();
  }, [showToast]);

  const selectedRecord = useMemo(
    () => data.fees.find((item) => item._id === selectedRecordId) || data.fees[0] || null,
    [data.fees, selectedRecordId]
  );

  if (!data.student) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="page-container fees-paid-page print-mode-detailed">
      <div className="card no-print">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Paid Fee Receipt</h2>
            <p className="page-subtitle">View your fee receipts and print the selected one.</p>
          </div>
          <button className="btn secondary" type="button" onClick={() => window.print()} disabled={!selectedRecord}>
            Print Receipt
          </button>
        </div>

        <div className="fees-field">
          <label>Select Receipt</label>
          <select value={selectedRecordId} onChange={(e) => setSelectedRecordId(e.target.value)}>
            {data.fees.map((fee) => (
              <option key={fee._id} value={fee._id}>
                {fee.month} - {fee.paymentStatus} - Rs {fee.paidFee}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRecord ? (
        <div className="card fees-paid-receipt-card">
          <div className="fees-paid-receipt-body receipt-detailed">
            <h3>Fee Submission Slip</h3>
            <div className="receipt-meta-grid">
              <p><span>Reg. No:</span><strong>{data.student.rollNumber}</strong></p>
              <p><span>Student Name:</span><strong>{data.student.fullName}</strong></p>
              <p><span>Father Name:</span><strong>{data.student.parentName || "-"}</strong></p>
              <p><span>Fees Month:</span><strong>{selectedRecord.month}</strong></p>
              <p><span>Class:</span><strong>{data.student.className}</strong></p>
              <p><span>Total Amount:</span><strong>Rs {selectedRecord.totalFee}</strong></p>
              <p><span>Deposit Amount:</span><strong>Rs {selectedRecord.paidFee}</strong></p>
              <p><span>Remaining Balance:</span><strong>Rs {selectedRecord.dueFee}</strong></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card empty-panel">No fee receipts available.</div>
      )}
    </div>
  );
}

export default StudentFeeReceipt;
