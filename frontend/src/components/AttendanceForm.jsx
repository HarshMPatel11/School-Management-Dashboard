import React, { useState } from "react";

function AttendanceForm({ students, onSubmit }) {
  const today = new Date().toISOString().slice(0, 10);
  const [student, setStudent] = useState("");
  const [date, setDate] = useState(today);
  const [status, setStatus] = useState("Present");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ student, date, status });
  };

  return (
    <form className="card form-grid" onSubmit={handleSubmit}>
      <h3>Mark Attendance</h3>
      <div className="grid three-col">
        <select value={student} onChange={(e) => setStudent(e.target.value)} required>
          <option value="">Select Student</option>
          {students.map((s) => (
            <option key={s._id} value={s._id}>
              {s.fullName} ({s.rollNumber})
            </option>
          ))}
        </select>

        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Late">Late</option>
        </select>
      </div>

      <button className="btn primary" type="submit">Save Attendance</button>
    </form>
  );
}

export default AttendanceForm;
