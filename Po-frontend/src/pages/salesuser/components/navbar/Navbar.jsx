import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./nav.css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
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
    <div className="navbar">
      <div className="navbar-top">
        <img src={logo} alt="Logo" className="navbar-logo" />
        <h1 className="navbar-title">IOTTECH SMART PRODUCTS PRIVATE LIMITED</h1>
      </div>

      <div className="navbar-buttons">
        <button
          className="btn primary"
          onClick={() => navigate("create-product")}
        >
          <AddCircleOutlineIcon className="icon" />
          <span className="button-text">Create Orders</span>
        </button>

        <button
          className="btn secondary"
          onClick={() => navigate("all-products")}
        >
          <InventoryIcon className="icon" />
          <span className="button-text">View Orders</span>
        </button>
      </div>

      <div className="navbar-right">
        <div className="welcome-message">Welcome {user?.name || "Guest"} Ji</div>
        <div className="profile" onClick={toggleDropdown}>
          <AccountCircleIcon className="avatar" />
          <div className="badge">1</div>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <div 
                className="dropdown-item"
                onClick={handleLogout}
              >
                <LogoutIcon className="dropdown-icon" />
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