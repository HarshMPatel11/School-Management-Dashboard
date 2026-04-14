import React, { useState } from "react";

function InstituteProfile() {
  const [formData, setFormData] = useState({
    instituteName: "Your Institute Name",
    address: "Institute Address",
    city: "City",
    state: "State",
    country: "Country",
    phone: "Phone Number",
    email: "Email Address",
    website: "Website URL",
    principalName: "Principal Name",
    established: "Year Established",
    registrationNumber: "Registration Number",
    affiliation: "Board Affiliation",
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    console.log("Saving Institute Profile:", formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Institute Profile</h1>
        <p>Update your institute information</p>
      </div>

      <div className="settings-container">
        <div className="settings-form">
          <div className="form-section">
            <h2>Basic Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Institute Name *</label>
                <input
                  type="text"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleInputChange}
                  placeholder="Enter institute name"
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Enter website URL"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Address Details</h2>
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter complete address"
                />
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                />
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Principal Name</label>
                <input
                  type="text"
                  name="principalName"
                  value={formData.principalName}
                  onChange={handleInputChange}
                  placeholder="Enter principal name"
                />
              </div>

              <div className="form-group">
                <label>Year Established</label>
                <input
                  type="text"
                  name="established"
                  value={formData.established}
                  onChange={handleInputChange}
                  placeholder="Enter year established"
                />
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="Enter registration number"
                />
              </div>

              <div className="form-group">
                <label>Board Affiliation</label>
                <input
                  type="text"
                  name="affiliation"
                  value={formData.affiliation}
                  onChange={handleInputChange}
                  placeholder="Enter board affiliation"
                />
              </div>
            </div>
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

export default InstituteProfile;
