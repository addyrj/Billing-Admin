import "./login.css";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
        setError("Unauthorized role detected.");
        break;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          user_id: email, // Using email as user_id
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.token && data.role) {
        // Store token and user data
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          mobile: data.user.mobile,
          role: data.role
        }));

        // Redirect based on role
        redirectBasedOnRole(data.role);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-hero">
        <div className="hero-overlay">
          <h1>Welcome Back</h1>
          <p>
  Manage your sales and purchases seamlessly with our powerful business system.
</p>
        </div>
      </div>
      
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>
          
          {error && <div className="login-error">{error}</div>}
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-groups">
              <label htmlFor="identifier">Email or Mobile</label>
              <input
                id="identifier"
                type="text"
                placeholder="Enter email or mobile number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-groups">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button type="submit" className="login-button">
              Sign In
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