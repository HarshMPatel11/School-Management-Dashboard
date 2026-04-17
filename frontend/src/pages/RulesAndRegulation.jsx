import React, { useState } from "react";

function RulesAndRegulation() {
  const [rules, setRules] = useState("");
  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setRules(e.target.value);
  };

  const handleSave = () => {
    console.log("Saving Rules & Regulations:", rules);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Institute Rules & Regulations</h1>
        <p>Set rules and regulations for your institute</p>
      </div>

      <div className="settings-container">
        <div className="rich-text-form">
          <div className="editor-toolbar">
            <div className="toolbar-group">
              <button className="toolbar-btn" title="Bold">
                <strong>B</strong>
              </button>
              <button className="toolbar-btn" title="Italic">
                <em>I</em>
              </button>
              <button className="toolbar-btn" title="Underline">
                <u>U</u>
              </button>
              <button className="toolbar-btn" title="Add highlight">
                🖍️
              </button>
              <span className="toolbar-divider"></span>
              <button className="toolbar-btn" title="Bullet list">
                ≡
              </button>
              <button className="toolbar-btn" title="Numbered list">
                1.
              </button>
            </div>
          </div>

          <textarea
            value={rules}
            onChange={handleChange}
            placeholder="Write institute rules and regulations here..."
            className="editor-content"
            rows="15"
          />

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

export default RulesAndRegulation;
