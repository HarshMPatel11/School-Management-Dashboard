import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function ClassesWithSubjects() {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });

  const fetchData = async () => {
    try {
      const res = await api.get("/subjects/classes-with-subjects", {
        params: { search, page, limit: 10 },
      });
      setItems(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
    } catch (error) {
      showToast("Failed to load classes with subjects", "error");
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id) => {
    const confirmed = await showConfirm("This will remove all subject assignments for this class.");
    if (!confirmed) return;

    try {
      await api.delete(`/subjects/${id}`);
      showToast("Subject assignment deleted", "success");

      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }

      fetchData();
    } catch (error) {
      showToast("Failed to delete subject assignment", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes With Subjects</h1>
          <p className="page-subtitle">View classes and all assigned subjects in one place</p>
        </div>
        <button className="btn primary" onClick={() => navigate("/subjects/assign-subjects")}>
          + Assign Subjects
        </button>
      </div>

      <div className="card">
        <div className="toolbar">
          <input
            placeholder="Search by class name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="subject-card-grid">
          {items.length === 0 ? (
            <div className="empty-panel">No classes with subjects found</div>
          ) : (
            items.map((item) => (
              <div className="subject-class-card" key={item._id}>
                <div className="subject-class-head">
                  <h3>{item.classRef?.name}</h3>
                  <button
                    className="btn warning"
                    onClick={() => navigate(`/subjects/assign-subjects?classId=${item.classRef?._id}`)}
                  >
                    Edit
                  </button>
                </div>

                <div className="subject-metrics">
                  <div>
                    <span>Total Subjects</span>
                    <strong>{item.totalSubjects}</strong>
                  </div>
                  <div>
                    <span>Total Exam Marks</span>
                    <strong>{item.totalMarks}</strong>
                  </div>
                </div>

                <div className="subject-list">
                  {item.subjects.map((subject) => (
                    <div className="subject-row" key={`${item._id}-${subject.name}`}>
                      <span>{subject.name}</span>
                      <span>{subject.marks} marks</span>
                    </div>
                  ))}
                </div>

                <div className="subject-card-actions">
                  <button
                    className="btn secondary"
                    onClick={() => navigate(`/subjects/assign-subjects?classId=${item.classRef?._id}`)}
                  >
                    Assign / Update
                  </button>
                  <button className="btn danger" onClick={() => handleDelete(item._id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          <button
            className="subject-add-card"
            onClick={() => navigate("/subjects/assign-subjects")}
            type="button"
          >
            <span className="subject-add-plus">+</span>
            <span>Assign Subjects</span>
          </button>
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

export default ClassesWithSubjects;
