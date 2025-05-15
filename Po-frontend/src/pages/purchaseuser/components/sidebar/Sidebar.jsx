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
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleProductDropdown = () => {
    setProductDropdownOpen(!productDropdownOpen);
  };

  const togglePartnerDropdown = () => {
    setPartnerDropdownOpen(!partnerDropdownOpen);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navigateTo = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) setIsOpen(false);
  };

  return (
    <>
      <button className="userpurchase-sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <div className={`userpurchase-sidebar ${isOpen ? "open" : ""}`}>
        <div className="userpurchase-top">
          <div className="userpurchase-logo-container">
            <img src={logo} alt="Yantram" className="userpurchase-logo-image" />
          </div>
          <hr className="userpurchase-divider" />
        </div>
        <div className="userpurchase-center">
          <p className="userpurchase-title">MAIN</p>
          <ul className="userpurchase-menu">
            <li
              className="userpurchase-menu-item"
              onClick={() => navigateTo("/purchaseuser/all-invoice")}
            >
              <DashboardIcon className="userpurchase-menu-icon" />
              <span className="userpurchase-menu-text">Dashboard</span>
            </li>
          </ul>
          
          <p className="userpurchase-title">Lists</p>
          <ul className="userpurchase-menu">
            <li
              className="userpurchase-menu-item"
              onClick={() => navigateTo("/purchaseuser/create-invoice")}
            >
              <ProductionQuantityLimitsIcon className="userpurchase-menu-icon" />
              <span className="userpurchase-menu-text">Create Invoice</span>
            </li>
          </ul>

          <li className="userpurchase-menu-item" onClick={toggleProductDropdown}>
            <InventoryIcon className="userpurchase-menu-icon" />
            <span className="userpurchase-menu-text">
              P-Products
              {productDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>
          </li>
          {productDropdownOpen && (
            <>
              <li
                className="userpurchase-menu-item userpurchase-submenu-item"
                onClick={() => navigateTo("/purchaseuser/create-pp")}
              >
                <ProductionQuantityLimitsIcon className="userpurchase-menu-icon" />
                <span className="userpurchase-menu-text">Create Product</span>
              </li>
              <li
                className="userpurchase-menu-item userpurchase-submenu-item"
                onClick={() => navigateTo("/purchaseuser/get-all-pp")}
              >
                <CategoryIcon className="userpurchase-menu-icon" />
                <span className="userpurchase-menu-text">All Products</span>
              </li>
            </>
          )}


          <p className="userpurchase-title">Profile</p>
          <ul className="userpurchase-menu">
            <li className="userpurchase-menu-item" onClick={handleLogout}>
              <LogoutIcon className="userpurchase-menu-icon" />
              <span className="userpurchase-menu-text">Logout</span>
            </li>
          </ul>
        </div>
      </div>
      {isOpen && (
        <div className="userpurchase-sidebar-overlay show" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;