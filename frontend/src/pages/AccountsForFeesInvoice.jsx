import React, { useState } from "react";

function AccountsForFeesInvoice() {
  const [banks, setBanks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    bankName: "",
    bankAddress: "",
    accountNumber: "",
    accountHolder: "",
    ifscCode: "",
    swiftCode: "",
    instructions: "",
  });
  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddBank = () => {
    if (formData.bankName && formData.accountNumber) {
      setBanks((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...formData,
        },
      ]);
      setFormData({
        bankName: "",
        bankAddress: "",
        accountNumber: "",
        accountHolder: "",
        ifscCode: "",
        swiftCode: "",
        instructions: "",
      });
      setShowAddForm(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const handleDeleteBank = (id) => {
    setBanks((prev) => prev.filter((bank) => bank.id !== id));
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Accounts For Fees Invoice</h1>
        <p>Manage bank accounts for fee collection</p>
      </div>

      <div className="settings-container">
        <div className="accounts-form">
          {!showAddForm ? (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddForm(true)}
            >
              + Add New Bank Account
            </button>
          ) : (
            <div className="add-bank-form">
              <h3>Add New Bank Account</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleInputChange}
                    placeholder="Enter bank name"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Bank Address</label>
                  <textarea
                    name="bankAddress"
                    value={formData.bankAddress}
                    onChange={handleInputChange}
                    placeholder="Enter bank address"
                    rows="2"
                  />
                </div>

                <div className="form-group">
                  <label>Account Number *</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Enter account number"
                  />
                </div>

                <div className="form-group">
                  <label>Account Holder Name</label>
                  <input
                    type="text"
                    name="accountHolder"
                    value={formData.accountHolder}
                    onChange={handleInputChange}
                    placeholder="Enter account holder name"
                  />
                </div>

                <div className="form-group">
                  <label>IFSC Code</label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode}
                    onChange={handleInputChange}
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div className="form-group">
                  <label>SWIFT Code</label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={formData.swiftCode}
                    onChange={handleInputChange}
                    placeholder="Enter SWIFT code"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Instructions</label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="Write instructions"
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleAddBank}>
                  Add Bank
                </button>
              </div>
            </div>
          )}

          {banks.length > 0 && (
            <div className="banks-list">
              <h3>Bank Accounts</h3>
              {banks.map((bank) => (
                <div key={bank.id} className="bank-card">
                  <div className="bank-info">
                    <h4>{bank.bankName}</h4>
                    <p>
                      <strong>Account No:</strong> {bank.accountNumber}
                    </p>
                    <p>
                      <strong>Account Holder:</strong> {bank.accountHolder || "N/A"}
                    </p>
                    {bank.ifscCode && (
                      <p>
                        <strong>IFSC:</strong> {bank.ifscCode}
                      </p>
                    )}
                    {bank.instructions && (
                      <p>
                        <strong>Instructions:</strong> {bank.instructions}
                      </p>
                    )}
                  </div>
                  <button
                    className="btn btn-danger-outline"
                    onClick={() => handleDeleteBank(bank.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {saved && <span className="success-message">✓ Bank account added successfully</span>}
        </div>
      </div>
    </div>
  );
}

export default AccountsForFeesInvoice;
