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

      <style jsx>{`
        .editor-toolbar {
          background: #f5f5f5;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 12px;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .toolbar-group {
          display: flex;
          gap: 6px;
          align-items: center;
        }

        .toolbar-btn {
          background: white;
          border: 1px solid #ddd;
          padding: 6px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .toolbar-btn:hover {
          background: #e8e8e8;
          border-color: #999;
        }

        .toolbar-divider {
          width: 1px;
          height: 20px;
          background: #ddd;
        }

        .editor-content {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-family: inherit;
          resize: vertical;
        }
      `}</style>
    </div>
  );
}

export default RulesAndRegulation;
