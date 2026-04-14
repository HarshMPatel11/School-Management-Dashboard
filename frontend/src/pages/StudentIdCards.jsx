import React, { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import api from "../api/axios";

const styles = ["default", "style1", "style2"];

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function StudentIdCards() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cardStyle, setCardStyle] = useState("default");

  const resolvePhotoUrl = (photoUrl) => {
    if (!photoUrl) return "";
    if (/^https?:\/\//i.test(photoUrl)) return photoUrl;
    const apiOrigin = api.defaults.baseURL?.replace(/\/api\/?$/, "") || "http://localhost:5000";
    return `${apiOrigin}${photoUrl.startsWith("/") ? photoUrl : `/${photoUrl}`}`;
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students", {
        params: { all: true, limit: 1000 },
      });
      setStudents(res.data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.fullName, s.rollNumber, s.className].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [students, search]);

  return (
    <div className="page-container">
      <div className="card student-id-shell">
        <div className="student-id-topbar">
          <div className="student-id-breadcrumb">Students / All Students / Student ID Cards</div>
          <div className="student-id-actions">
            <button className="btn secondary" onClick={fetchStudents}>Refresh</button>
            <input
              className="student-id-search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn secondary" onClick={() => window.print()}>Print</button>
          </div>
        </div>

        <div className="student-id-style-tabs">
          {styles.map((s) => (
            <button
              key={s}
              className={`student-id-style-btn ${cardStyle === s ? "active" : ""}`}
              onClick={() => setCardStyle(s)}
            >
              {s === "default" ? "Default" : s.replace("style", "Style ")}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="muted">Loading student cards...</p>
        ) : (
          <div className="student-card-grid">
            {filtered.map((student) => (
              <article key={student._id} className={`student-id-card ${cardStyle}`}>
                <div className="student-id-header-pattern" />
                {student.photoUrl ? (
                  <img
                    src={resolvePhotoUrl(student.photoUrl)}
                    alt={student.fullName}
                    className="student-id-avatar-img"
                  />
                ) : (
                  <div className="student-id-avatar">{initials(student.fullName)}</div>
                )}
                <div className="student-id-barcode" />
                <h4>{student.fullName}</h4>
                <p className="student-id-role">STUDENT</p>
                <div className="student-id-meta">
                  <div>ID - {student.rollNumber}</div>
                  <div>Class - {student.className}</div>
                  <div>DOA - {new Date(student.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="student-id-qr">
                  <QRCodeSVG
                    value={JSON.stringify({
                      id: student.rollNumber,
                      name: student.fullName,
                      className: student.className,
                      section: student.section,
                    })}
                    size={48}
                    bgColor="#ffffff"
                    fgColor="#111827"
                    level="M"
                  />
                </div>
              </article>
            ))}
            {filtered.length === 0 ? <p className="muted">No students found.</p> : null}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentIdCards;
