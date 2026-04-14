import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

function AccountSetting() {
  const { user } = useAuth();
  const [accountData, setAccountData] = useState({
    username: user?.username || "admin@example.com",
    email: user?.email || "admin@example.com",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    timezone: "Asia/Karachi",
    language: "English",
    currency: "Dollars (USD)",
  });

  const [saved, setSaved] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAccountData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPasswordError("");
  };

  const handlePasswordChange = () => {
    if (!accountData.currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    if (!accountData.newPassword) {
      setPasswordError("New password is required");
      return;
    }
    if (accountData.newPassword !== accountData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (accountData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    console.log("Changing password");
    setSaved(true);
    setTimeout(() => {
      setAccountData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setSaved(false);
    }, 2000);
  };

  const handleSave = () => {
    console.log("Saving Account Settings:", {
      timezone: accountData.timezone,
      language: accountData.language,
      currency: accountData.currency,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Account Settings</h1>
        <p>Manage your account preferences and security</p>
      </div>

      <div className="settings-container">
        <div className="account-settings-form">
          {/* Account Details Section */}
          <div className="settings-section">
            <h2>Account Details</h2>
            <div className="account-details-box">
              <div className="detail-row">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={accountData.username}
                  disabled
                  className="disabled-input"
                />
              </div>
              <div className="detail-row">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={accountData.email}
                  disabled
                  className="disabled-input"
                />
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="settings-section">
            <h2>Change Password</h2>
            <div className="password-form">
              <div className="form-group">
                <label>Current Password *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={accountData.currentPassword}
                  onChange={handleInputChange}
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password *</label>
                <input
                  type="password"
                  name="newPassword"
                  value={accountData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={accountData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                />
              </div>

              {passwordError && (
                <div className="error-message">{passwordError}</div>
              )}

              <button className="btn btn-secondary" onClick={handlePasswordChange}>
                Update Password
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="settings-section">
            <h2>Preferences</h2>
            <div className="preferences-form">
              <div className="form-group">
                <label>Timezone</label>
                <select
                  name="timezone"
                  value={accountData.timezone}
                  onChange={handleInputChange}
                >
                  <option value="America/New_York">America/New_York</option>
                  <option value="Europe/London">Europe/London</option>
                  <option value="Asia/Karachi">Asia/Karachi</option>
                  <option value="Asia/Kolkata">Asia/Kolkata</option>
                  <option value="Asia/Dubai">Asia/Dubai</option>
                  <option value="Australia/Sydney">Australia/Sydney</option>
                </select>
              </div>

              <div className="form-group">
                <label>Language</label>
                <select
                  name="language"
                  value={accountData.language}
                  onChange={handleInputChange}
                >
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Arabic">Arabic</option>
                </select>
              </div>

              <div className="form-group">
                <label>Currency</label>
                <select
                  name="currency"
                  value={accountData.currency}
                  onChange={handleInputChange}
                >
                  <option value="Dollars (USD)">Dollars (USD)</option>
                  <option value="Euros (EUR)">Euros (EUR)</option>
                  <option value="Rupees (PKR)">Rupees (PKR)</option>
                  <option value="Rupees (INR)">Rupees (INR)</option>
                  <option value="Dirhams (AED)">Dirhams (AED)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="settings-section danger-zone">
            <h2>Danger Zone</h2>
            <div className="delete-account-box">
              <div>
                <h3>Delete Account</h3>
                <p>This action cannot be undone. Please be certain.</p>
              </div>
              <button className="btn btn-danger">Delete Account</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            {saved && <span className="success-message">✓ Saved successfully</span>}
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .account-details-box {
          background: #f9f9f9;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .detail-row {
          margin-bottom: 16px;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-row label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          color: #333;
        }

        .disabled-input {
          background: #f5f5f5;
          color: #666;
          cursor: not-allowed;
        }

        .password-form,
        .preferences-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .password-form .form-group:nth-child(n + 4),
        .password-form button {
          grid-column: 1 / -1;
        }

        .error-message {
          grid-column: 1 / -1;
          color: #dc2626;
          font-size: 14px;
          background: #fee2e2;
          padding: 12px;
          border-radius: 4px;
          border-left: 4px solid #dc2626;
        }

        .danger-zone {
          border: 1px solid #fca5a5;
          background: #fef2f2;
        }

        .delete-account-box {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: white;
          border-radius: 6px;
          border: 1px solid #fca5a5;
        }

        .delete-account-box h3 {
          margin: 0;
          color: #dc2626;
        }

        .delete-account-box p {
          margin: 4px 0 0 0;
          color: #666;
          font-size: 14px;
        }

        .btn-danger {
          background: #dc2626;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-danger:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
}

export default AccountSetting;
