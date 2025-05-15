import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./navuser.css";
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="userpurchase-navbar">
      <div className="userpurchase-navbar-top">
        <img src={logo} alt="Logo" className="userpurchase-navbar-logo" />
        <h1 className="userpurchase-navbar-title">IOTTECH SMART PRODUCTS PRIVATE LIMITED</h1>
      </div>
      <div className="userpurchase-navbar-buttons">
        <button 
          className="userpurchase-create-button"
          onClick={() => navigate("/purchaseuser/create-invoice")}
        >
          <AddCircleIcon className="userpurchase-button-icon" />
          <span className="userpurchase-button-text">Create Invoice</span>
        </button>

        <button
          className="userpurchase-inventory-button"
          onClick={() => navigate("/purchaseuser/all-invoice")}
        >
          <InventoryIcon className="userpurchase-button-icon" />
          <span className="userpurchase-button-text">All Invoices</span>
        </button>
      </div>
      <div className="userpurchase-navbar-right">
        <div className="userpurchase-welcome-message">Welcome {user?.name || "Admin"} Ji</div>
        <div className="userpurchase-profile-dropdown" onClick={toggleDropdown}>
          <AccountCircleIcon className="userpurchase-profile-icon" />
          <div className="userpurchase-notification-counter">1</div>
          
          {dropdownOpen && (
            <div className="userpurchase-dropdown-menu">
              <div 
                className="userpurchase-dropdown-item"
                onClick={handleLogout}
              >
                <LogoutIcon className="userpurchase-dropdown-icon" />
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