import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./createpartner.css";
import Loader from "../../../../loader/Loader";

const CreatePartner = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "purchaseuser",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    form: ""
  });
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    mobile: false,
    password: false,
    confirmPassword: false
  });

  const navigate = useNavigate();

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "Name is required" : "";
      case "email":
        if (!value) return "Email is required";
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "Invalid email format" : "";
      case "mobile":
        if (!value) return "Mobile is required";
        return !/^\d{10}$/.test(value) ? "Mobile must be 10 digits" : "";
      case "password":
        if (!value) return "Password is required";
        return value.length < 6 ? "Password must be at least 6 characters" : "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        return value !== formData.password ? "Passwords don't match" : "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile" && (!/^\d*$/.test(value) || value.length > 10)) {
      return;
    }

    setFormData({ ...formData, [name]: value });
    
    // Validate in real-time if the field has been touched
    if (touched[name]) {
      setErrors(prev => ({...prev, [name]: validateField(name, value)}));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({...prev, [name]: true}));
    setErrors(prev => ({...prev, [name]: validateField(name, value)}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
      form: ""
    });
    setSuccess("");

    // Validate all fields
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      mobile: validateField("mobile", formData.mobile),
      password: validateField("password", formData.password),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      form: ""
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      mobile: true,
      password: true,
      confirmPassword: true
    });

    // Check if any errors exist
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setErrors(prev => ({...prev, form: "Authentication failed. Please log in."}));
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
      setFormData({ 
        name: "", 
        email: "", 
        mobile: "", 
        password: "", 
        confirmPassword: "", 
        role: "purchaseuser" 
      });

      setTimeout(() => {
        navigate("/adminpurchase/get-all-partner");
      }, 1500);

    } catch (err) {
      setErrors(prev => ({...prev, form: err.message || "Something went wrong. Please try again."}));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader 
        message="Creating partner..." 
        color="#00a3c6" 
        background="rgba(255, 255, 255, 0.95)"
     
      />
    );
  }

  return (
    <div className="partner-form-container_3">
      <div className="partner-form-card_3">
        <h2 className="partner-form-title">Create Partner</h2>
        {errors.form && <div className="partner-error-message">{errors.form}</div>}
        {success && <div className="partner-success-message">{success}</div>}
        <form onSubmit={handleSubmit} className="partner-form" noValidate>
          <div className="partner-form-group">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`partner-input ${touched.name && errors.name ? "input-error" : ""}`}
            />
            {touched.name && errors.name && (
              <div className="error-message">{errors.name}</div>
            )}
          </div>
          <div className="partner-form-group">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`partner-input ${touched.email && errors.email ? "input-error" : ""}`}
            />
            {touched.email && errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>
          <div className="partner-form-group">
            <input
              type="text"
              name="mobile"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`partner-input ${touched.mobile && errors.mobile ? "input-error" : ""}`}
            />
            {touched.mobile && errors.mobile && (
              <div className="error-message">{errors.mobile}</div>
            )}
          </div>
          <div className="partner-form-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`partner-input ${touched.password && errors.password ? "input-error" : ""}`}
            />
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>
          <div className="partner-form-group">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`partner-input ${touched.confirmPassword && errors.confirmPassword ? "input-error" : ""}`}
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>
          <div className="partner-button-container">
            <button 
              type="submit" 
              className="partner-submit-button"
              disabled={loading}
            >
              {loading ? "Processing..." : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartner;