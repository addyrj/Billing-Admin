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
    role: "",
  });

  const [originalData, setOriginalData] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication failed. Please log in.");

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admins/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (!response.ok || !Array.isArray(data) || !data[0])
          throw new Error("Invalid partner data received.");

        const partner = data[0];
        setFormData({
          name: partner.username || "",
          email: partner.email || "",
          mobile: partner.mobile || "",
          password: "",
          confirmPassword: "",
          role: partner.role || "salesuser",
        });

        setOriginalData({
          email: partner.email,
          mobile: partner.mobile,
          role: partner.role,
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
      setError("No changes detected.");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admins/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to update partner.");

      setSuccess("Partner updated successfully!");
      setTimeout(() => navigate("/superadmin/get-all-partner"), 2000);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  if (loading) {
    return <div className="partner-form-container">Loading partner data...</div>;
  }

  return (
    <div className="partner-form-container">
      <div className="partner-form-card">
        <h2 className="form-title">Edit Partner</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group1">
        
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name} 
              disabled 
            />
          </div>

          <div className="form-group1">
     
            <input 
              type="email" 
              id="email" 
              name="email" 
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
              value={formData.password} 
              onChange={handleChange} 
              placeholder="Leave blank to keep unchanged" 
            />
          </div>

          <div className="form-group1">
          
            <input 
              type="password" 
              id="confirmPassword" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              placeholder="Confirm new password" 
            />
          </div>

          <div className="form-group1">
            <label htmlFor="role">Role</label>
            <select 
              id="role" 
              name="role" 
              value={formData.role} 
              disabled
            >
              <option value="adminsales">Sales Admin</option>
              <option value="adminpurchase">Purchase Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" className="submit-button">
              Update Partner
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPartner;
