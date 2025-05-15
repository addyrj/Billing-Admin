import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


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

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sales-users/${id}`, {
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

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sales-users/${id}`, {
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
  
      setSuccess("Partner updated successfully!");
      setTimeout(() => navigate("/adminsales/get-all-partner"), 2000);
  
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (loading) {
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
            <h2 className="sales-form-title">Edit Partner (ID: {id})</h2>
          </div>
          <p>Loading partner data...</p>
        </div>
      </div>
    );
  }

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
          <h2 className="sales-form-title">Edit Partner (ID: {id})</h2>
        </div>

        {(error || success) && (
          <div className={`message ${success ? "success" : "error"}`}>
            {success || error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="sales-form">
          <div className="form-group21">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Partner name"
              value={formData.name}
              onChange={handleChange}
              disabled
            />
          </div>

          <div className="form-group21">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group21">
            <label htmlFor="mobile">Mobile Number</label>
            <input
              id="mobile"
              type="text"
              name="mobile"
              placeholder="10-digit mobile number"
              value={formData.mobile}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group21">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Leave blank to keep current password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group21">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="submit-button"
              disabled={
                (formData.email === originalData.email && 
                 formData.mobile === originalData.mobile && 
                 !formData.password)
              }
            >
              Update Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPartner;