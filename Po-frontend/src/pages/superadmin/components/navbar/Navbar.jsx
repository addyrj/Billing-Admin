import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./nav.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import InventoryIcon from "@mui/icons-material/Inventory";
import DownloadIcon from "@mui/icons-material/Download";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../../../Assets/yantram_logo.png";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleDownload = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/companies/export/excel`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "companies.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="navbar1">
      <div className="navbar1-top">
        <img src={logo} alt="Logo" className="navbar1-logo" />
        <h1 className="navbar1-title">IOTTECH SMART PRODUCTS PRIVATE LIMITED</h1>
      </div>
      <div className="navbar1-buttons">
        <button className="create1-product-button" onClick={handleDownload}>
          <DownloadIcon className="download1-product-icon" />
          <span className="download1-product-text">Download Excel</span>
        </button>

        <button
          className="download1-product-button"
          onClick={() => navigate("/superadmin/all-invoice")}
        >
          <InventoryIcon className="download1-product-icon" />
          <span className="download-product-text">All Invoice</span>
        </button>
      </div>
      <div className="navbar1-right">
        <div className="welcome-message">Welcome {user?.name || "Admin"} Ji</div>
        <div className="navbar1-item" onClick={toggleDropdown}>
          <AccountCircleIcon className="navbar-icon" />
          <div className="navbar1-counter">1</div>
          
          {dropdownOpen && (
            <div style={{
              position: "absolute",
              top: "50px",
              right: "0",
              backgroundColor: "#1e2838",
              border: "1px solid #07a6c9",
              borderRadius: "5px",
              padding: "10px",
              zIndex: "1000"
            }}>
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "white",
                  cursor: "pointer"
                }}
                onClick={handleLogout}
              >
                <LogoutIcon style={{ color: "#07a6c9" }} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;