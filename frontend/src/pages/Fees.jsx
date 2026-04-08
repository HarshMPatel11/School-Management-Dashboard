import React, { useEffect, useState } from "react";
import api from "../api/axios";
import FeeForm from "../components/FeeForm";

function Fees() {
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingFee, setEditingFee] = useState(null);
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

  const fetchFees = async () => {
    try {
      const res = await api.get("/fees", { params: { status: statusFilter, page, limit: 10 } });
      setFees(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchFees();
  }, [statusFilter, page]);

  useEffect(() => {
    setPage(1);
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

      if (page !== 1) {
        setPage(1);
        return;
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

      if (fees.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }

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

export default Fees;
