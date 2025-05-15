import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";


const EditPartner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [originalData, setOriginalData] = useState({
    email: "",
    mobile: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication failed. Please log in.");

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/purchase-users/${id}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch partner data.");

        setFormData({
          name: data.name || "",
          email: data.email || "",
          mobile: data.mobile || "",
          password: "",
          confirmPassword: "",
        });

        setOriginalData({
          email: data.email || "",
          mobile: data.mobile || ""
        });

      } catch (err) {
        setError(err.message || "Failed to load partner data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartner();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && (!/^\d*$/.test(value) || value.length > 10)) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      return;
    }
  
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication failed. Please log in.");
        return;
      }
  
      const payload = {};
      if (formData.email !== originalData.email) payload.email = formData.email;
      if (formData.mobile !== originalData.mobile) payload.mobile = formData.mobile;
      if (formData.password) payload.password = formData.password;
  
      if (Object.keys(payload).length === 0) {
        setError("No changes detected");
        return;
      }
  
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/purchase-users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to update partner.");
      }
  
      setSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/adminpurchase/get-all-partner"), 2000);
  
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (loading) return <div className="partner-loading">Loading partner data...</div>;

  return (
    <div className="partner-form-container_3">
      <div className="partner-form-card_3">
        <h2 className="partner-form-title">Edit Partner</h2>
        {error && <div className="partner-error-message">{error}</div>}
        {success && <div className="partner-success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="partner-form">
          <div className="partner-form-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              disabled
              className="partner-input"
            />
          </div>
          <div className="partner-form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="partner-input"
            />
          </div>
          <div className="partner-form-group">
            <input
              type="text"
              name="mobile"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              className="partner-input"
            />
          </div>
          <div className="partner-form-group">
            <input
              type="password"
              name="password"
              placeholder="New Password (leave blank to keep current)"
              value={formData.password}
              onChange={handleChange}
              className="partner-input"
            />
          </div>
          <div className="partner-form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="partner-input"
            />
          </div>
          <div className="partner-button-container">
            <button type="submit" className="partner-submit-button">
              Update Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPartner;