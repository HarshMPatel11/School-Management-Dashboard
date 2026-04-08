import React, { useEffect, useState } from "react";
import api from "../api/axios";
import FeeForm from "../components/FeeForm";

function Fees() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingFee, setEditingFee] = useState(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students");
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFees = async () => {
    try {
      const res = await api.get("/fees", { params: { status: statusFilter } });
      setFees(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchFees();
  }, [statusFilter]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      const payload = {
        ...formData,
        totalFee: Number(formData.totalFee),
        paidFee: Number(formData.paidFee),
      };

      if (editingFee) {
        await api.put(`/fees/${editingFee._id}`, payload);
        setEditingFee(null);
      } else {
        await api.post("/fees", payload);
      }

      fetchFees();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fee record?")) return;
    try {
      await api.delete(`/fees/${id}`);
      fetchFees();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-grid">
      <FeeForm
        students={students}
        onSubmit={handleCreateOrUpdate}
        editingFee={editingFee}
        onCancel={() => setEditingFee(null)}
      />

      <div className="card">
        <div className="toolbar single-filter">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Month</th>
                <th>Total Fee</th>
                <th>Paid Fee</th>
                <th>Due Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {fees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-row">No fee records found</td>
                </tr>
              ) : (
                fees.map((fee) => (
                  <tr key={fee._id}>
                    <td>{fee.student?.fullName}</td>
                    <td>{fee.month}</td>
                    <td>Rs {fee.totalFee}</td>
                    <td>Rs {fee.paidFee}</td>
                    <td>Rs {fee.dueFee}</td>
                    <td>
                      <span className={`badge ${fee.paymentStatus.toLowerCase()}`}>
                        {fee.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn warning" onClick={() => setEditingFee(fee)}>Edit</button>
                        <button className="btn danger" onClick={() => handleDelete(fee._id)}>Delete</button>
                      </div>
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

export default Fees;
