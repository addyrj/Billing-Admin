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
    role: "adminsales",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && (!/^\d*$/.test(value) || value.length > 10)) return;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (formData.mobile.length !== 10) {
      setError("Mobile number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication failed. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/create-admin`, {
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
      setFormData({ 
        name: "", 
        email: "", 
        mobile: "", 
        password: "", 
        confirmPassword: "", 
        role: "adminsales" 
      });

      setTimeout(() => {
        navigate("/superadmin/get-all-partner");
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="partner-form-container">
      <div className="partner-form-card">
        <h2 className="form-title">Create Partner</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group1">
         
            <input 
              type="text" 
              id="name"
              name="name" 
              placeholder="Enter name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group1">
      
            <input 
              type="email" 
              id="email"
              name="email" 
              placeholder="Enter email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group1">
        
            <input 
              type="text" 
              id="mobile"
              name="mobile" 
              placeholder="Enter 10-digit mobile number" 
              value={formData.mobile} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group1">
         
            <input 
              type="password" 
              id="password"
              name="password" 
              placeholder="Enter password (min 6 characters)" 
              value={formData.password} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group1">
        
            <input 
              type="password" 
              id="confirmPassword"
              name="confirmPassword" 
              placeholder="Confirm password" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group1">
            <label htmlFor="role">Role</label>
            <select 
              id="role"
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              required
            >
              <option value="adminsales">Sales Admin</option>
              <option value="adminpurchase">Purchase Admin</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartner;