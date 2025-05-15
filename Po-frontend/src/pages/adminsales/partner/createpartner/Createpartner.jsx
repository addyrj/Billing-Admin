import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import "./createPartnerSales.css"; // Using the same CSS file

const CreatePartner = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "salesuser",
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
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/create-userSales`, {
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
        navigate("/adminsales/get-all-partner");
      }, 1500);

    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="sales-container2">
      <div className="sales-form-container2">
        <div className="sales-form-header2">
          <button 
            className="back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <ArrowBackIcon />
          </button>
          <h2 className="sales-form-title">Create New Partner</h2>
        </div>

        {(error || success) && (
          <div className={`message ${success ? "success" : "error"}`}>
            {success || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sales-form">
          <div className="form-group21">
        
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Enter partner name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group21">
     
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group21">
       
            <input
              id="mobile"
              type="text"
              name="mobile"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group21">
        
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group21">
      
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={!formData.name || !formData.email || !formData.mobile || !formData.password || !formData.confirmPassword}
            >
              Create Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartner;