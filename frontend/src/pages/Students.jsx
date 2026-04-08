import React, { useEffect, useState } from "react";
import api from "../api/axios";
import StudentForm from "../components/StudentForm";

function Students() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [search, setSearch] = useState("");
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");

  const fetchStudents = async () => {
    try {
      const res = await api.get("/students", {
        params: { search, className, section },
      });
      setStudents(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, className, section]);

  const handleCreateOrUpdate = async (formData) => {
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, formData);
        setEditingStudent(null);
      } else {
        await api.post("/students", formData);
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
      </div>
    </div>
  );
}

export default Students;
