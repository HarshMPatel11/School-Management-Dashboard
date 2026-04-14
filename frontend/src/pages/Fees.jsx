import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";

const LINE_ITEMS = [
  { label: "MONTHLY FEE", amount: 25000 },
  { label: "ADMISSION FEE", amount: 0 },
  { label: "REGISTRATION FEE", amount: 0 },
  { label: "ART MATERIAL", amount: 0 },
  { label: "TRANSPORT", amount: 0 },
  { label: "BOOKS", amount: 0 },
  { label: "UNIFORM", amount: 0 },
  { label: "FINE", amount: 0 },
  { label: "OTHERS", amount: 0 },
  { label: "PREVIOUS BALANCE", amount: 0 },
  { label: "DISCOUNT IN FEE 2%", amount: -500 },
];

const monthLabelFromValue = (value) => {
  if (!value) return "";
  const [year, month] = value.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

function Fees() {
  const { showToast } = useToast();
  const [students, setStudents] = useState([]);

  const [activeTab, setActiveTab] = useState("student");
  const [feeMonth, setFeeMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [fineAfterDueDate, setFineAfterDueDate] = useState(0);
  const [selectedBank, setSelectedBank] = useState("BOB");

  const [searchStudent, setSearchStudent] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [invoiceRows, setInvoiceRows] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get("/students", { params: { all: true, limit: 5000 } });
        const data = res.data?.data || [];
        setStudents(data);
        if (data.length > 0 && !selectedStudentId) {
          setSelectedStudentId(data[0]._id);
        }
      } catch (error) {
        showToast("Could not load students", "error");
      }
    };

    fetchStudents();
  }, [showToast, selectedStudentId]);

  const filteredStudents = useMemo(() => {
    const q = searchStudent.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) =>
      [s.fullName, s.rollNumber, s.className, s.section].some((v) =>
        String(v || "").toLowerCase().includes(q)
      )
    );
  }, [students, searchStudent]);

  const classOptions = useMemo(() => {
    return Array.from(new Set(students.map((s) => s.className).filter(Boolean))).sort();
  }, [students]);

  const sectionOptions = useMemo(() => {
    const byClass = students.filter((s) => !selectedClass || s.className === selectedClass);
    return Array.from(new Set(byClass.map((s) => s.section).filter(Boolean))).sort();
  }, [students, selectedClass]);

  const totalFromLines = useMemo(() => {
    return LINE_ITEMS.reduce((sum, line) => sum + Number(line.amount || 0), 0) + Number(fineAfterDueDate || 0);
  }, [fineAfterDueDate]);

  const createFeeRecord = async (studentId) => {
    const payload = {
      student: studentId,
      month: monthLabelFromValue(feeMonth),
      totalFee: totalFromLines,
      paidFee: 0,
    };

    await api.post("/fees", payload);
  };

  const generateStudentWise = async () => {
    const student = students.find((s) => s._id === selectedStudentId);
    if (!student) {
      showToast("Please select a student", "warning");
      return;
    }

    setIsGenerating(true);
    try {
      await createFeeRecord(student._id);

      setInvoiceRows([
        {
          student,
          lineItems: LINE_ITEMS,
          total: totalFromLines,
        },
      ]);
      showToast("Student wise invoice generated", "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to generate invoice", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateClassWise = async () => {
    if (!selectedClass) {
      showToast("Please select class", "warning");
      return;
    }

    const targets = students.filter(
      (s) => s.className === selectedClass && (!selectedSection || s.section === selectedSection)
    );

    if (targets.length === 0) {
      showToast("No students found for selected class/section", "warning");
      return;
    }

    setIsGenerating(true);
    try {
      await Promise.all(targets.map((s) => createFeeRecord(s._id)));

      setInvoiceRows(
        targets.map((student) => ({
          student,
          lineItems: LINE_ITEMS,
          total: totalFromLines,
        }))
      );
      showToast(`Class wise invoices generated for ${targets.length} student(s)`, "success");
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to generate class wise invoices", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  const onGenerate = () => {
    if (activeTab === "student") {
      generateStudentWise();
      return;
    }
    generateClassWise();
  };

  return (
    <div className="page-container fees-generate-page">
      <div className="card no-print">
        <div className="page-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="page-title">Generate Fees Invoice</h2>
            <p className="page-subtitle">Create invoices using Student Wise or Class Wise mode.</p>
          </div>
        </div>

        <div className="fees-tabs">
          <button
            className={`fees-tab ${activeTab === "student" ? "active" : ""}`}
            onClick={() => setActiveTab("student")}
            type="button"
          >
            Student Wise
          </button>
          <button
            className={`fees-tab ${activeTab === "class" ? "active" : ""}`}
            onClick={() => setActiveTab("class")}
            type="button"
          >
            Class Wise
          </button>
        </div>

        <div className="fees-generate-grid">
          <div className="fees-field">
            <label>Fee Month</label>
            <input type="month" value={feeMonth} onChange={(e) => setFeeMonth(e.target.value)} />
          </div>

          <div className="fees-field">
            <label>Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>

          <div className="fees-field">
            <label>Fine After Due Date</label>
            <input
              type="number"
              min="0"
              placeholder="Enter fine amount"
              value={fineAfterDueDate}
              onChange={(e) => setFineAfterDueDate(Number(e.target.value || 0))}
            />
          </div>

          <div className="fees-field">
            <label>Select Bank</label>
            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
              <option value="BOB">BOB</option>
              <option value="HDFC">HDFC</option>
              <option value="SBI">SBI</option>
              <option value="ICICI">ICICI</option>
            </select>
          </div>

          {activeTab === "student" ? (
            <>
              <div className="fees-field">
                <label>Search Student</label>
                <input
                  placeholder="Search by name, roll no, class"
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                />
              </div>

              <div className="fees-field fees-span-2">
                <label>Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  {filteredStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.rollNumber}) - {s.className} {s.section}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            <>
              <div className="fees-field">
                <label>Select Class</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  <option value="">Select Class</option>
                  {classOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="fees-field">
                <label>Select Section</label>
                <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}>
                  <option value="">All Sections</option>
                  {sectionOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="fees-generate-actions">
          <button className="btn primary" type="button" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate"}
          </button>
          <button
            className="btn secondary"
            type="button"
            onClick={() => window.print()}
            disabled={invoiceRows.length === 0}
          >
            Print Fees Invoice
          </button>
        </div>
      </div>

      {invoiceRows.length > 0 && (
        <div className="fees-invoice-list">
          {invoiceRows.map((row, index) => (
            <div key={`${row.student._id}-${index}`} className="fees-invoice-card">
              <div className="fees-invoice-top">
                <h3>Fees Invoice</h3>
                <span>{monthLabelFromValue(feeMonth)}</span>
              </div>

              <div className="fees-invoice-body">
                <div className="fees-student-meta">
                  <p><strong>Student ID:</strong> {row.student.rollNumber}</p>
                  <p><strong>Student Name:</strong> {row.student.fullName}</p>
                  <p><strong>Class:</strong> {row.student.className} {row.student.section}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString("en-GB")}</p>
                  <p><strong>Due Date:</strong> {new Date(dueDate).toLocaleDateString("en-GB")}</p>
                  <p><strong>Bank:</strong> {selectedBank}</p>
                </div>

                <div className="fees-line-table-wrap">
                  <table className="fees-line-table">
                    <thead>
                      <tr>
                        <th>Sr.</th>
                        <th>Particulars</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.lineItems.map((item, i) => (
                        <tr key={`${item.label}-${i}`}>
                          <td>{i + 1}</td>
                          <td>{item.label}</td>
                          <td>₹ {item.amount}</td>
                        </tr>
                      ))}
                      {Number(fineAfterDueDate) > 0 && (
                        <tr>
                          <td>{row.lineItems.length + 1}</td>
                          <td>FINE AFTER DUE DATE</td>
                          <td>₹ {fineAfterDueDate}</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="2">TOTAL</td>
                        <td>₹ {row.total}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Fees;
