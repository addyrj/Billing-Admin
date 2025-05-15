import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreatePartner.css";

const CreatePartner = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "purchaseuser",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

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

    if (formData.password.length < 6) {
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
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/create-userPurchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile,
          password: formData.password,
          role: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create partner.");
      }

      setSuccess("Partner created successfully!");
      setFormData({ name: "", email: "", mobile: "", password: "", confirmPassword: "", role: "partner" });

      setTimeout(() => {
        navigate("/adminpurchase/get-all-partner");
      }, 1500);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="partner-form-container_3">
      <div className="partner-form-card_3">
        <h2 className="partner-form-title">Create Partner</h2>
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
              required
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
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="partner-input"
            />
          </div>
          <div className="partner-form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="partner-input"
            />
          </div>
          <div className="partner-button-container">
            <button type="submit" className="partner-submit-button">
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartner;