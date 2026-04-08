import React, { useEffect, useState } from "react";
import api from "../api/axios";
import StudentForm from "../components/StudentForm";

function Students() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 10 });

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students", {
        params: { search, className, section, page, limit: 10 },
      });
      setStudents(res.data.data || []);
      setPagination(res.data.pagination || { page: 1, totalPages: 1, total: 0, limit: 10 });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, className, section, page]);

  useEffect(() => {
    setPage(1);
  }, [search, className, section]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData);
        setEditingStudent(null);
      } else {
        await api.post("/students", formData);
      }

      if (page !== 1) {
        setPage(1);
        return;
      }

      fetchStudents();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await api.delete(`/students/${id}`);

      if (students.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
        return;
      }

      fetchStudents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="page-grid">
      <StudentForm
        onSubmit={handleCreateOrUpdate}
        editingStudent={editingStudent}
        onCancel={() => setEditingStudent(null)}
      />

      <div className="card">
        <div className="toolbar">
          <input
            placeholder="Search by name, roll no, parent"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="Filter by class"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <input
            placeholder="Filter by section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Roll No</th>
                <th>Class</th>
                <th>Section</th>
                <th>Gender</th>
                <th>Parent</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-row">No students found</td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName}</td>
                    <td>{student.rollNumber}</td>
                    <td>{student.className}</td>
                    <td>{student.section}</td>
                    <td>{student.gender}</td>
                    <td>{student.parentName}</td>
                    <td>{student.contactNumber}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn warning" onClick={() => setEditingStudent(student)}>Edit</button>
                        <button className="btn danger" onClick={() => handleDelete(student._id)}>Delete</button>
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

export default Students;
