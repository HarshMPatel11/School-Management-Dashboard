import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const monthToLabel = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

function PaySalary() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [salaryMonth, setSalaryMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dateReceiving, setDateReceiving] = useState(new Date().toISOString().slice(0, 10));
  const [totalSalary, setTotalSalary] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [deduction, setDeduction] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees", { params: { all: true, limit: 5000 } });
        setEmployees(res.data?.data || []);
      } catch (error) {
        showToast("Could not load employees", "error");
      }
    };

    fetchEmployees();
  }, [showToast]);

  const suggestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return employees
      .filter((e) => [e.employeeName, e.mobile, e.role].some((v) => String(v || "").toLowerCase().includes(q)))
      .slice(0, 8);
  }, [employees, search]);

  const netPaid = Math.max(Number(totalSalary || 0) + Number(bonus || 0) - Number(deduction || 0), 0);

  const onSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setSearch(`${employee.employeeName} - ${employee.role}`);
    setTotalSalary(Number(employee.monthlySalary || 0));
    setBonus(0);
    setDeduction(0);
    setHighlightedIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!suggestions.length || selectedEmployee) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
      return;
    }

    if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      onSelectEmployee(suggestions[highlightedIndex]);
      return;
    }

    if (e.key === "Escape") {
      setHighlightedIndex(-1);
    }
  };

  const submitSalary = async () => {
    if (!selectedEmployee) {
      showToast("Please select an employee", "warning");
      return;
    }

    setSaving(true);
    try {
      await api.post("/salaries", {
        employee: selectedEmployee._id,
        month: monthToLabel(salaryMonth),
        totalSalary: Number(totalSalary || 0),
        bonus: Number(bonus || 0),
        deduction: Number(deduction || 0),
        paymentDate: dateReceiving,
      });

      showToast("Salary submitted successfully", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to submit salary", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container salary-page">
      <div className="card">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Pay Salary</h2>
            <p className="page-subtitle">Search employee and submit salary.</p>
          </div>
        </div>

        <div className="fees-field fees-student-search-wrap">
          <label>Search Employee</label>
          <input
            placeholder="Search Employee"
            value={search}
            onKeyDown={handleSearchKeyDown}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedEmployee(null);
              setHighlightedIndex(-1);
            }}
          />

          {suggestions.length > 0 && !selectedEmployee && (
            <div className="fees-suggestion-list">
              {suggestions.map((emp) => (
                <button
                  key={emp._id}
                  type="button"
                  className={`fees-suggestion-item ${highlightedIndex >= 0 && suggestions[highlightedIndex]?._id === emp._id ? "is-active" : ""}`}
                  onClick={() => onSelectEmployee(emp)}
                  onMouseEnter={() => {
                    const idx = suggestions.findIndex((item) => item._id === emp._id);
                    setHighlightedIndex(idx);
                  }}
                >
                  {emp.employeeName} - {emp.role}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedEmployee && (
          <div className="fees-collection-card" style={{ marginTop: 14 }}>
            <h3>Salary Submission</h3>
            <div className="fees-student-head-grid">
              <div><span>Registration/ID</span><strong>{selectedEmployee._id?.slice(-6).toUpperCase()}</strong></div>
              <div><span>Name</span><strong>{selectedEmployee.employeeName}</strong></div>
              <div><span>Type</span><strong>{selectedEmployee.role}</strong></div>
              <div><span>Monthly Salary</span><strong>₹ {selectedEmployee.monthlySalary || 0}</strong></div>
            </div>

            <div className="fees-generate-grid" style={{ marginTop: 10 }}>
              <div className="fees-field">
                <label>Salary Month</label>
                <input type="month" value={salaryMonth} onChange={(e) => setSalaryMonth(e.target.value)} />
              </div>

              <div className="fees-field">
                <label>Date of Receiving</label>
                <input type="date" value={dateReceiving} onChange={(e) => setDateReceiving(e.target.value)} />
              </div>

              <div className="fees-field">
                <label>Total Salary</label>
                <input type="number" value={totalSalary} onChange={(e) => setTotalSalary(Number(e.target.value || 0))} />
              </div>

              <div className="fees-field">
                <label>Bonus</label>
                <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value || 0))} />
              </div>

              <div className="fees-field">
                <label>Deduction</label>
                <input type="number" value={deduction} onChange={(e) => setDeduction(Number(e.target.value || 0))} />
              </div>

              <div className="fees-field">
                <label>Net Paid</label>
                <input type="number" value={netPaid} readOnly />
              </div>
            </div>

            <div className="fees-generate-actions">
              <button className="btn primary" type="button" onClick={submitSalary} disabled={saving}>
                {saving ? "Submitting..." : "Submit Salary"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaySalary;
