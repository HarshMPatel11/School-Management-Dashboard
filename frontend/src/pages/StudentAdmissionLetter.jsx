import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const apiOrigin = configuredApiUrl
  ? configuredApiUrl.replace(/\/api\/?$/, "")
  : import.meta.env.DEV
    ? "http://localhost:5000"
    : "";

const resolvePhotoUrl = (photoUrl) => {
  if (!photoUrl) return "";
  if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
  return apiOrigin ? `${apiOrigin}${photoUrl.startsWith("/") ? "" : "/"}${photoUrl}` : photoUrl;
};

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function StudentAdmissionLetter() {
  const { showToast } = useToast();
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/student-portal/me");
        setStudent(res.data.student);
      } catch (error) {
        showToast("Could not load admission letter", "error");
      }
    };
    load();
  }, [showToast]);

  const qrValue = useMemo(() => student ? JSON.stringify({
    id: student.rollNumber,
    name: student.fullName,
    className: student.className,
    section: student.section,
    username: student.loginUsername,
  }) : "", [student]);

  if (!student) return <div className="loading-screen">Loading...</div>;

  return (
    <div className="page-container admission-page">
      <div className="card">
        <div className="page-header no-print" style={{ marginBottom: 14 }}>
          <div>
            <h2 className="page-title">Admission Letter</h2>
            <p className="page-subtitle">View and print your admission confirmation.</p>
          </div>
          <button className="btn primary" onClick={() => window.print()}>
            Print Admission Letter
          </button>
        </div>

        <div className="admission-letter-sheet">
          <div className="admission-header-band">
            <div>
              <h3>ADMISSION CONFIRMATION</h3>
              <p>Student Portal</p>
            </div>
            <div className="admission-date">{formatDate(new Date())}</div>
          </div>

          <div className="admission-body-grid">
            <div className="admission-profile-col">
              <div className="admission-avatar-wrap">
                {student.photoUrl ? (
                  <img src={resolvePhotoUrl(student.photoUrl)} alt={student.fullName} className="admission-avatar" />
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
                <div><span>Class</span><strong>{student.className}</strong></div>
                <div><span>Section</span><strong>{student.section}</strong></div>
                <div><span>Admission Date</span><strong>{formatDate(student.createdAt)}</strong></div>
                <div><span>Gender</span><strong>{student.gender}</strong></div>
                <div><span>Parent/Guardian</span><strong>{student.parentName || "-"}</strong></div>
                <div><span>Contact</span><strong>{student.contactNumber || "-"}</strong></div>
              </div>
            </div>

            <div className="admission-qr-col">
              <div className="qr-card">
                <QRCodeSVG value={qrValue} size={92} />
                <small>Scan for student details</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentAdmissionLetter;
