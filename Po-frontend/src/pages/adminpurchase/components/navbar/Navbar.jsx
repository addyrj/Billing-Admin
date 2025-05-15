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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <div className="addpurchase-navbar">
      <div className="addpurchase-navbar-top">
        <img src={logo} alt="Logo" className="addpurchase-navbar-logo" />
        <h1 className="addpurchase-navbar-title">IOTTECH SMART PRODUCTS PRIVATE LIMITED</h1>
      </div>
      <div className="addpurchase-navbar-buttons">
        <button 
          className="addpurchase-navbar-button addpurchase-create-button"
          onClick={() => navigate("/adminpurchase/create-invoice")}
        >
          <AddCircleIcon className="addpurchase-navbar-button-icon" />
          <span className="addpurchase-navbar-button-text">Create Invoice</span>
        </button>

        <button
          className="addpurchase-navbar-button addpurchase-inventory-button"
          onClick={() => navigate("/adminpurchase/all-invoice")}
        >
          <InventoryIcon className="addpurchase-navbar-button-icon" />
          <span className="addpurchase-navbar-button-text">All Invoices</span>
        </button>
      </div>
      <div className="addpurchase-navbar-right">
        <div className="addpurchase-welcome-message">Welcome {user?.name || "Admin"} Ji</div>
        <div className="addpurchase-profile-dropdown" onClick={toggleDropdown}>
          <AccountCircleIcon className="addpurchase-profile-icon" />
          <div className="addpurchase-notification-counter">1</div>
          
          {dropdownOpen && (
            <div className="addpurchase-dropdown-menu">
              <div 
                className="addpurchase-dropdown-item"
                onClick={handleLogout}
              >
                <LogoutIcon className="addpurchase-dropdown-icon" />
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