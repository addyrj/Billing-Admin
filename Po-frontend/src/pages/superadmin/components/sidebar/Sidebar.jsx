import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./side.css";
import logo from "../../../../Assets/yantram_logo.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MenuIcon from "@mui/icons-material/Menu";
import InventoryIcon from "@mui/icons-material/Inventory";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Person3Icon from '@mui/icons-material/Person3';
import GroupIcon from '@mui/icons-material/Group';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from "@mui/icons-material/Close";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };



  const togglePartnerDropdown = () => {
    setPartnerDropdownOpen(!partnerDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Navigation handler with proper path
  const navigateTo = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setIsOpen(false);
  };

  return (
    <>
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="top1">
          <div className="logo-container">
            <img src={logo} alt="Yantram" className="logo-image" />
          </div>
          <hr className="divider" />
        </div>
        <div className="center">
          <p className="title">MAIN</p>
          <ul className="menu">
            <li
              className="menu-item"
              onClick={() => navigateTo("/superadmin/all-user")}
            >
              <DashboardIcon className="menu-icon" />
              <span className="menu-text">Dashboard</span>
            </li>
          </ul>
          
          <p className="title">Lists</p>
          <ul className="menu">
            <li
              className="menu-item"
              onClick={() => navigate("/superadmin/all-products")}
            >
              <ProductionQuantityLimitsIcon className="menu-icon" />
              <span className="menu-text">Sales Orders</span>
            </li>
          </ul>


          <li className="menu-item" onClick={togglePartnerDropdown}>
            <PersonAddIcon className="menu-icon" />
            <span className="menu-text">
              Partner
              {partnerDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>
          </li>
          {partnerDropdownOpen && (
            <>
              <li
                className="menu-item submenu-item"
                onClick={() => navigateTo("/superadmin/create-partner")}
              >
                <PersonAddIcon className="menu-icon" />
                <span className="menu-text">Create Partner</span>
              </li>
              <li
                className="menu-item submenu-item"
                onClick={() => navigateTo("/superadmin/get-all-partner")}
              >
                <GroupIcon className="menu-icon" />
                <span className="menu-text">Get All Partner</span>
              </li>
            </>
          )}

          <p className="title">Profile</p>
          <ul className="menu">
            <li className="menu-item" onClick={handleLogout}>
              <LogoutIcon className="menu-icon" />
              <span className="menu-text">Logout</span>
            </li>
          </ul>
        </div>
      </div>
      {isOpen && (
        <div className="sidebar-overlay show" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;