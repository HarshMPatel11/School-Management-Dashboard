import React, { useState } from "react";

function MarksGrading() {
  const [gradings, setGradings] = useState([
    { id: 1, grade: "A+", startMarks: 80, endMarks: 100, status: "PASS" },
    { id: 2, grade: "A", startMarks: 70, endMarks: 79, status: "PASS" },
    { id: 3, grade: "B+", startMarks: 60, endMarks: 69, status: "PASS" },
    { id: 4, grade: "B", startMarks: 50, endMarks: 59, status: "PASS" },
    { id: 5, grade: "C", startMarks: 40, endMarks: 49, status: "PASS" },
    { id: 6, grade: "D", startMarks: 33, endMarks: 39, status: "PASS" },
    { id: 7, grade: "F", startMarks: 0, endMarks: 32, status: "FAIL" },
  ]);

  const [saved, setSaved] = useState(false);

  const handleChange = (id, field, value) => {
    setGradings((prev) =>
      prev.map((grading) =>
        grading.id === id ? { ...grading, [field]: value } : grading
      )
    );
  };

  const handleAddGrading = () => {
    const newId = Math.max(...gradings.map((g) => g.id), 0) + 1;
    setGradings((prev) => [
      ...prev,
      { id: newId, grade: "", startMarks: 0, endMarks: 0, status: "PASS" },
    ]);
  };

  const handleDeleteGrading = (id) => {
    setGradings((prev) => prev.filter((grading) => grading.id !== id));
  };

  const handleSave = () => {
    console.log("Saving Marks Grading:", gradings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Marks Grading Settings</h1>
        <p>Customize Grading</p>
      </div>

      <div className="settings-container">
        <div className="grading-form">
          <div className="grading-table">
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Grade*</th>
                    <th>% From*</th>
                    <th>% Upto*</th>
                    <th>Status*</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {gradings.map((grading) => (
                    <tr key={grading.id}>
                      <td>
                        <input
                          type="text"
                          value={grading.grade}
                          onChange={(e) =>
                            handleChange(grading.id, "grade", e.target.value)
                          }
                          placeholder="e.g., A+, A, B"
                          className="grading-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={grading.startMarks}
                          onChange={(e) =>
                            handleChange(
                              grading.id,
                              "startMarks",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="0"
                          className="grading-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={grading.endMarks}
                          onChange={(e) =>
                            handleChange(
                              grading.id,
                              "endMarks",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="100"
                          className="grading-input"
                        />
                      </td>
                      <td>
                        <select
                          value={grading.status}
                          onChange={(e) =>
                            handleChange(grading.id, "status", e.target.value)
                          }
                          className="grading-select"
                        >
                          <option value="PASS">PASS</option>
                          <option value="FAIL">FAIL</option>
                        </select>
                      </td>
                      <td>
                        <button
                          className="btn btn-danger-outline"
                          onClick={() => handleDeleteGrading(grading.id)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-secondary" onClick={handleAddGrading}>
              + Add More Option
            </button>
            {saved && <span className="success-message">✓ Saved successfully</span>}
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default MarksGrading;
