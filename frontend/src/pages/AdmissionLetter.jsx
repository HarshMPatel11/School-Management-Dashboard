import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function AdmissionLetter() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(id || "");
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students", { params: { all: true, limit: 3000 } });
        setStudents(res.data?.data || []);
      } catch (error) {
        showToast("Could not load students", "error");
      }
    };

    fetchStudents();
  }, [showToast]);

  useEffect(() => {
    if (!selectedId && students.length > 0) {
      const first = students[0]?._id;
      if (first) setSelectedId(first);
    }
  }, [students, selectedId]);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!selectedId) return;
      try {
        const res = await api.get(`/students/${selectedId}`);
        setSelectedStudent(res.data);
      } catch (error) {
        showToast("Could not load student details", "error");
      }
    };

    fetchStudent();
  }, [selectedId, showToast]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      return [s.fullName, s.rollNumber, s.className, s.section].some((val) =>
        String(val || "").toLowerCase().includes(q)
      );
    });
  }, [students, search]);

  const student = selectedStudent;
  const qrValue = student
    ? JSON.stringify({
        id: student.rollNumber,
        name: student.fullName,
        class: student.className,
        section: student.section,
        username: student.loginUsername,
      })
    : "";

  return (
    <div className="page-container admission-page">
      <div className="card">
        <div className="page-header" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="page-title">Admission Letter</h2>
            <p className="page-subtitle">Generate and print student admission confirmation.</p>
          </div>
          <button className="btn secondary" onClick={() => navigate("/students")}>
            Back to Students
          </button>
        </div>

        <div className="admission-toolbar no-print">
          <input
            className="admission-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, roll number or class"
          />
          <select
            className="admission-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {filteredStudents.map((s) => (
              <option key={s._id} value={s._id}>
                {s.fullName} ({s.rollNumber})
              </option>
            ))}
          </select>
          <button className="btn primary" onClick={() => window.print()} disabled={!student}>
            Print Admission Letter
          </button>
        </div>

        {!student ? (
          <div className="empty-panel">Select a student to generate the admission letter.</div>
        ) : (
          <div className="admission-letter-sheet" id="admission-letter-sheet">
            <div className="admission-header-band">
              <div>
                <h3>ADMISSION CONFIRMATION</h3>
                <p>School Management Dashboard</p>
              </div>
              <div className="admission-date">{formatDate(new Date())}</div>
            </div>

            <div className="admission-body-grid">
              <div className="admission-profile-col">
                <div className="admission-avatar-wrap">
                  {student.photoUrl ? (
                    <img
                      src={student.photoUrl.startsWith("http") ? student.photoUrl : `http://localhost:5000${student.photoUrl}`}
                      alt={student.fullName}
                      className="admission-avatar"
                    />
                  ) : (
                    <div className="admission-avatar-fallback">{(student.fullName || "S").slice(0, 1).toUpperCase()}</div>
                  )}
                </div>
                <h4>{student.fullName}</h4>
                <p className="muted">Registration ID: {student.rollNumber}</p>
                <div className="admission-status">Status: Active</div>
              </div>

              <div className="admission-info-col">
                <div className="admission-info-grid">
                  <div>
                    <span>Class</span>
                    <strong>{student.className}</strong>
                  </div>
                  <div>
                    <span>Section</span>
                    <strong>{student.section}</strong>
                  </div>
                  <div>
                    <span>Admission Date</span>
                    <strong>{formatDate(student.createdAt)}</strong>
                  </div>
                  <div>
                    <span>Gender</span>
                    <strong>{student.gender}</strong>
                  </div>
                  <div>
                    <span>Parent/Guardian</span>
                    <strong>{student.parentName || "-"}</strong>
                  </div>
                  <div>
                    <span>Contact</span>
                    <strong>{student.contactNumber || "-"}</strong>
                  </div>
                </div>

                <div className="admission-credentials-box">
                  <h5>Login Credentials (Auto Generated)</h5>
                  <p>
                    <span>Username:</span>
                    <strong>{student.loginUsername || "-"}</strong>
                  </p>
                  <p>
                    <span>Password:</span>
                    <strong>{student.loginPassword || "-"}</strong>
                  </p>
                </div>
              </div>

              <div className="admission-qr-col">
                <div className="qr-card">
                  <QRCodeSVG value={qrValue} size={92} />
                  <small>Scan for student details</small>
                </div>
              </div>
            </div>

            <div className="admission-footer-notes">
              <h5>Rules & Important Notes</h5>
              <ul>
                <li>Please keep this admission letter for future reference.</li>
                <li>Student login should be changed after first login.</li>
                <li>In case of any correction, contact the school office immediately.</li>
              </ul>
            </div>

            <div className="admission-sign-row">
              <div>Parent Signature</div>
              <div>Authorized Signature</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdmissionLetter;
