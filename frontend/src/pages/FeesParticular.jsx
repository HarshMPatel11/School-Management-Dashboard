import React, { useState } from "react";

function FeesParticular() {
  const [particulars, setParticulars] = useState([
    { id: 1, name: "MONTHLY TUITION FEE", defaultAmount: 0 },
    { id: 2, name: "ADMISSION FEE", defaultAmount: 0 },
    { id: 3, name: "REGISTRATION FEE", defaultAmount: 0 },
    { id: 4, name: "ART MATERIAL", defaultAmount: 0 },
    { id: 5, name: "TRANSPORT", defaultAmount: 0 },
    { id: 6, name: "BOOKS", defaultAmount: 0 },
    { id: 7, name: "UNIFORM", defaultAmount: 0 },
    { id: 8, name: "FINE", defaultAmount: 0 },
    { id: 9, name: "OTHERS", defaultAmount: 0 },
  ]);

  const [newParticular, setNewParticular] = useState("");
  const [saved, setSaved] = useState(false);

  const handleAmountChange = (id, value) => {
    setParticulars((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, defaultAmount: parseFloat(value) || 0 } : item
      )
    );
  };

  const handleAddParticular = () => {
    if (newParticular.trim()) {
      setParticulars((prev) => [
        ...prev,
        { id: Date.now(), name: newParticular.toUpperCase(), defaultAmount: 0 },
      ]);
      setNewParticular("");
    }
  };

  const handleDeleteParticular = (id) => {
    setParticulars((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    console.log("Saving Fees Particulars:", particulars);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Change Fee Particulars</h1>
        <p>Set Required and Optional fee heads</p>
      </div>

      <div className="settings-container">
        <div className="fee-particulars-form">
          <div className="add-particular-section">
            <label>Add Particular Label</label>
            <div className="input-group">
              <input
                type="text"
                value={newParticular}
                onChange={(e) => setNewParticular(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddParticular()}
                placeholder="Enter new particular label"
              />
              <button className="btn btn-secondary" onClick={handleAddParticular}>
                Add Particular
              </button>
            </div>
          </div>

          <div className="particulars-table">
            <h3>Fee Particulars</h3>
            <table>
              <thead>
                <tr>
                  <th>Particular Label</th>
                  <th>Default Amount</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {particulars.map((particular) => (
                  <tr key={particular.id}>
                    <td>
                      <span className="particular-label">{particular.name}</span>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={particular.defaultAmount}
                        onChange={(e) =>
                          handleAmountChange(particular.id, e.target.value)
                        }
                        placeholder="0"
                        className="amount-input"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-danger-outline"
                        onClick={() => handleDeleteParticular(particular.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-actions">
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

export default FeesParticular;
