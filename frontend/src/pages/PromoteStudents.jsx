import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

function PromoteStudents() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("");

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/students", {
        params: {
          all: true,
          limit: 1000,
          search,
          className: classFilter,
        },
      });
      setStudents(res.data.data || []);
      setSelectedIds([]);
    } catch (error) {
      showToast("Could not fetch students", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [classFilter]);

  const classOptions = useMemo(() => {
    const classes = students.map((s) => s.className).filter(Boolean);
    return [...new Set(classes)].sort((a, b) => a.localeCompare(b));
  }, [students]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.rollNumber, s.fullName, s.className].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [students, search]);

  const isAllSelected = filtered.length > 0 && filtered.every((s) => selectedIds.includes(s._id));

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filtered.some((s) => s._id === id)));
      return;
    }
    const next = new Set(selectedIds);
    filtered.forEach((s) => next.add(s._id));
    setSelectedIds([...next]);
  };

  const toggleOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handlePromote = async () => {
    if (!targetClass.trim()) {
      showToast("Please select promote class", "error");
      return;
    }
    if (selectedIds.length === 0) {
      showToast("Please select at least one student", "error");
      return;
    }

    try {
      const res = await api.post("/students/promote", {
        studentIds: selectedIds,
        targetClass,
        targetSection,
      });
      showToast(res.data?.message || "Students promoted", "success");
      await fetchStudents();
    } catch (error) {
      showToast(error.response?.data?.message || "Promotion failed", "error");
    }
  };

  return (
    <div className="page-container">
      <div className="promote-layout">
        <div className="card promote-search-card">
          <h3>Search</h3>
          <input
            placeholder="Search Student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
            <option value="">Select Class</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <button className="btn secondary" onClick={fetchStudents}>Reload All</button>
        </div>

        <div className="card promote-table-card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>
                    <label className="checkbox-inline">
                      <input type="checkbox" checked={isAllSelected} onChange={toggleAll} />
                      Select All
                    </label>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="4" className="empty-row">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="4" className="empty-row">No students found</td></tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s._id}>
                      <td>{s.rollNumber}</td>
                      <td>{s.fullName}</td>
                      <td>{s.className}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(s._id)}
                          onChange={() => toggleOne(s._id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card promote-action-card">
          <h3>Promote In</h3>
          <select value={targetClass} onChange={(e) => setTargetClass(e.target.value)}>
            <option value="">Select*</option>
            {classOptions.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
          <input
            placeholder="Section (Optional)"
            value={targetSection}
            onChange={(e) => setTargetSection(e.target.value)}
          />
          <button className="btn primary" onClick={handlePromote}>Save Changes</button>
          <p className="muted">Selected: {selectedIds.length}</p>
        </div>
      </div>
    </div>
  );
}

export default PromoteStudents;
