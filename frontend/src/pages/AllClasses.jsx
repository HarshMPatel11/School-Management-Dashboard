import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function AllClasses() {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useToast();
  const [classes, setClasses] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });

  const fetchClasses = async () => {
    try {
      const res = await api.get("/classes", {
        params: { search, page, limit: 10 },
      });
      setClasses(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("This will permanently delete this class.");
    if (!confirmed) return;
    try {
      await api.delete(`/classes/${id}`);
      showToast("Class deleted successfully", "success");
      if (classes.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }
      fetchClasses();
    } catch (error) {
      showToast("Failed to delete class", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Classes</h1>
          <p className="page-subtitle">Manage all school classes and sections</p>
        </div>
        <button className="btn primary" onClick={() => navigate("/classes/new")}>
          + New Class
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input
            placeholder="Search by class name or teacher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Sections</th>
                <th>Capacity</th>
                <th>Class Teacher</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-row">No classes found</td>
                </tr>
              ) : (
                classes.map((cls) => (
                  <tr key={cls._id}>
                    <td><strong>{cls.name}</strong></td>
                    <td>
                      <div className="badge-row">
                        {cls.sections.map((sec) => (
                          <span key={sec} className="badge">{sec}</span>
                        ))}
                      </div>
                    </td>
                    <td>{cls.capacity}</td>
                    <td>{cls.classTeacher || <span className="text-muted">—</span>}</td>
                    <td>{cls.description || <span className="text-muted">—</span>}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn warning"
                          onClick={() => navigate(`/classes/edit/${cls._id}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn danger"
                          onClick={() => handleDelete(cls._id)}
                        >
                          Delete
                        </button>
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

export default AllClasses;
