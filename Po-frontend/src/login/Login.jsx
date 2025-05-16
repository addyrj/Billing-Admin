import "./login.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../loader/Loader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: ""
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (token && user) {
      redirectBasedOnRole(user.role);
    }
  }, [navigate]);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "superadmin":
        navigate("/superadmin");
        break;
      case "adminsales":
        navigate("/adminsales");
        break;
      case "adminpurchase":
        navigate("/adminpurchase");
        break;
      case "salesuser":
        navigate("/salesuser");
        break;
      case "purchaseuser":
        navigate("/purchaseuser");
        break;
      default:
        setErrors(prev => ({...prev, form: "Unauthorized role detected."}));
        break;
    }
  };

  const validateEmailOrMobile = (value) => {
    if (!value) return "Email or mobile is required";
    
    // Check if it's a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Check if it's a valid 10-digit mobile number
    const mobileRegex = /^[0-9]{10}$/;
    
    if (!emailRegex.test(value) && !mobileRegex.test(value)) {
      return "Please enter a valid email or 10-digit mobile number";
    }
    
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleBlur = (field) => () => {
    setTouched(prev => ({...prev, [field]: true}));
    
    // Validate the field that just lost focus
    if (field === "email") {
      setErrors(prev => ({...prev, email: validateEmailOrMobile(email)}));
    } else if (field === "password") {
      setErrors(prev => ({...prev, password: validatePassword(password)}));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submission
    const emailError = validateEmailOrMobile(email);
    const passwordError = validatePassword(password);
    
    setErrors({
      email: emailError,
      password: passwordError,
      form: ""
    });
    
    setTouched({
      email: true,
      password: true
    });
    
    if (emailError || passwordError) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: email,
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token && data.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          mobile: data.user.mobile,
          role: data.role
        }));
        redirectBasedOnRole(data.role);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors(prev => ({...prev, form: error.message || "Something went wrong. Please try again."}));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader 
        message="Authenticating..." 
        color="#00a3c6" 
        background="rgba(255, 255, 255, 0.95)"
     
      />
    );
  }

  return (
    <div className="login-container">
      <div className="login-hero">
        <div className="hero-overlay">
          <h1>Welcome Back</h1>
          <p>Manage your sales and purchases seamlessly with our powerful business system.</p>
        </div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>
          
          {errors.form && <div className="login-error">{errors.form}</div>}
          
          <form onSubmit={handleLogin} className="login-form" noValidate>
            <div className="form-groups">
              <label htmlFor="identifier">Email or Mobile</label>
              <input
                id="identifier"
                type="text"
                placeholder="Enter email or mobile number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={handleBlur("email")}
                className={touched.email && errors.email ? "input-error" : ""}
                required
              />
              {touched.email && errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>
            
            <div className="form-groups">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={handleBlur("password")}
                className={touched.password && errors.password ? "input-error" : ""}
                required
              />
              {touched.password && errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="login-button" 
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
          
          <div className="login-footer">
            <p>Need help? <a href="/support">Contact support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;