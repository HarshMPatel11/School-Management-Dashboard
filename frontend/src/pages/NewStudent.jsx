import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import StudentForm from "../components/StudentForm";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function NewStudent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const isEditing = Boolean(id);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!isEditing) return;
      try {
        const res = await api.get(`/students/${id}`);
        setStudent(res.data);
      } catch (error) {
        showToast("Could not load student", "error");
      }
    };

    fetchStudent();
  }, [id, isEditing, showToast]);

  const handleSubmit = async (formData, photoFile) => {
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value ?? "");
      });
      if (photoFile) {
        payload.append("photo", photoFile);
      }

      if (isEditing) {
        await api.put(`/students/${id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        showToast("Student updated successfully", "success");
      } else {
        const res = await api.post("/students", payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const createdStudent = res.data;
        showToast(
          `Student added. Username: ${createdStudent.loginUsername}, Password: ${createdStudent.loginPassword}`,
          "success"
        );
        navigate(`/students/admission-letter/${createdStudent._id}`);
        return;
      }
      navigate("/students");
    } catch (error) {
      showToast(error.response?.data?.message || "Could not save student", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2 className="page-title">{isEditing ? "Edit Student" : "Add New Student"}</h2>
          <p className="page-subtitle">
            {isEditing ? "Update student information." : "Create a student profile with class details."}
          </p>
        </div>
      </div>

      <StudentForm
        onSubmit={handleSubmit}
        editingStudent={student}
        onCancel={() => navigate("/students")}
      />
    </div>
  );
}

export default NewStudent;
