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
import Person3Icon from "@mui/icons-material/Person3";
import GroupIcon from "@mui/icons-material/Group";
import CategoryIcon from "@mui/icons-material/Category";
import CloseIcon from "@mui/icons-material/Close";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [partnerDropdownOpen, setPartnerDropdownOpen] = useState(false);
  const [grnDropdownOpen, setGrnDropdownOpen] = useState(false);
  const [debitDropdownOpen, setDebitDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleProductDropdown = () => {
    setProductDropdownOpen(!productDropdownOpen);
  };

  const togglegrnDropdownOpen = () => {
    setGrnDropdownOpen(!grnDropdownOpen);
  };

  const toggleDebitDropdown = () => {
    setDebitDropdownOpen(!debitDropdownOpen);
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
      <button className="addpurchase-sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <div className={`addpurchase-sidebar ${isOpen ? "open" : ""}`}>
        <div className="addpurchase-top">
          <div className="addpurchase-logo-container">
            <img src={logo} alt="Yantram" className="addpurchase-logo-image" />
          </div>
          <hr className="addpurchase-divider" />
        </div>
        <div className="addpurchase-center">
          <p className="addpurchase-title">MAIN</p>
          <ul className="addpurchase-menu">
            <li
              className="addpurchase-menu-item"
              onClick={() => navigateTo("/adminpurchase/all-invoice")}
            >
              <DashboardIcon className="addpurchase-menu-icon" />
              <span className="addpurchase-menu-text">Dashboard</span>
            </li>
          </ul>

          <p className="addpurchase-title">Lists</p>
          <ul className="addpurchase-menu">
            <li
              className="addpurchase-menu-item"
              onClick={() => navigateTo("/adminpurchase/create-invoice")}
            >
              <ProductionQuantityLimitsIcon className="addpurchase-menu-icon" />
              <span className="addpurchase-menu-text">Create Invoice</span>
            </li>
          </ul>

          <li className="addpurchase-menu-item" onClick={togglegrnDropdownOpen}>
            <PersonAddIcon className="addpurchase-menu-icon" />
            <span className="addpurchase-menu-text">
              GRN
              <span className="dropdown-icon">
                {grnDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </span>
            </span>
          </li>
          {grnDropdownOpen && (
            <>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
                onClick={() => navigateTo("/adminpurchase/create-grn")}
              >
                <PersonAddIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">Create GRN</span>
              </li>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
                onClick={() => navigateTo("/adminpurchase/all-grn")}
              >
                <GroupIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">All GRN</span>
              </li>
            </>
          )}

          <li className="addpurchase-menu-item" onClick={toggleDebitDropdown}>
            <DashboardIcon className="addpurchase-menu-icon" />
            <span className="addpurchase-menu-text">
              Debit-Note
              {debitDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>
          </li>
          {debitDropdownOpen && (
            <>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
              onClick={() => navigateTo("/adminpurchase/all-grn")}
              >
                <PersonAddIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">Create Debit Note</span>
              </li>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
                onClick={() => navigateTo("/adminpurchase/all-debit")}
              >
                <CategoryIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">Get Debit Notes</span>
              </li>
            </>
          )}
          <li className="addpurchase-menu-item" onClick={toggleProductDropdown}>
            <InventoryIcon className="addpurchase-menu-icon" />
            <span className="addpurchase-menu-text">
              P-Products
              {productDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>
          </li>
          {productDropdownOpen && (
            <>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
                onClick={() => navigateTo("/adminpurchase/create-pp")}
              >
                <ProductionQuantityLimitsIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">Create Product</span>
              </li>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
                onClick={() => navigateTo("/adminpurchase/get-all-pp")}
              >
                <CategoryIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">All Products</span>
              </li>
            </>
          )}

          {/* ------------------------- */}
          <li className="addpurchase-menu-item" onClick={togglePartnerDropdown}>
            <PersonAddIcon className="addpurchase-menu-icon" />
            <span className="addpurchase-menu-text">
              Partner
              {partnerDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </span>
          </li>
          {partnerDropdownOpen && (
            <>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
                onClick={() => navigateTo("/adminpurchase/create-partner")}
              >
                <PersonAddIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">Create Partner</span>
              </li>
              <li
                className="addpurchase-menu-item addpurchase-submenu-item"
                onClick={() => navigateTo("/adminpurchase/get-all-partner")}
              >
                <GroupIcon className="addpurchase-menu-icon" />
                <span className="addpurchase-menu-text">All Partners</span>
              </li>
            </>
          )}

          <p className="addpurchase-title">Profile</p>
          <ul className="addpurchase-menu">
            <li className="addpurchase-menu-item" onClick={handleLogout}>
              <LogoutIcon className="addpurchase-menu-icon" />
              <span className="addpurchase-menu-text">Logout</span>
            </li>
          </ul>
        </div>
      </div>
      {isOpen && (
        <div
          className="addpurchase-sidebar-overlay show"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
