import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./side.css"; // Changed to use the same CSS file as SidebarSales
import logo from "../../../../Assets/yantram_logo.png";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import InventoryIcon from "@mui/icons-material/Inventory";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from "@mui/icons-material/Close";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleProductDropdown = () => {
    setProductDropdownOpen(!productDropdownOpen);
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
      <button className="sidebarSales-toggle" onClick={toggleSidebar}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>
      <div className={`sidebarSales ${isOpen ? "open" : ""}`}>
        <div className="topSales">
          <div className="logoSales-container">
            <img src={logo} alt="Yantram" className="logoSales-image" />
          </div>
          <hr className="divider" />
        </div>
        
        <div className="centerSales">
          <p className="titleSales">MAIN</p>
          <ul className="menuSales">
            <li
              className="menuSales-item"
              onClick={() => navigateTo("/salesuser/all-products")}
            >
              <DashboardIcon className="menuSales-icon" />
              <span className="menuSales-text">Dashboard</span>
            </li>
          </ul>
          
          <p className="titleSales">Lists</p>
          <ul className="menuSales">
            <li
              className="menuSales-item"
              onClick={() => navigateTo("/salesuser/create-product")}
            >
              <ProductionQuantityLimitsIcon className="menuSales-icon" />
              <span className="menuSales-text">Create orders</span>
            </li>

            <li className="menuSales-item" onClick={toggleProductDropdown}>
              <InventoryIcon className="menuSales-icon" />
              <span className="menuSales-text">
                Products
                {productDropdownOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </span>
            </li>
            {productDropdownOpen && (
              <>
                <li
                  className="menuSales-item submenuSales-item"
                  onClick={() => navigateTo("/salesuser/create-iot-product")}
                >
                  <ProductionQuantityLimitsIcon className="menuSales-icon" />
                  <span className="menuSales-text">Create-Iot-Product</span>
                </li>
                <li
                  className="menuSales-item submenuSales-item"
                  onClick={() => navigateTo("/salesuser/get-iot-product")}
                >
                  <CategoryIcon className="menuSales-icon" />
                  <span className="menuSales-text">Get-Iot-Products</span>
                </li>
              </>
            )}
          </ul>

          <p className="titleSales">Profile</p>
          <ul className="menuSales">
            <li className="menuSales-item" onClick={handleLogout}>
              <LogoutIcon className="menuSales-icon" />
              <span className="menuSales-text">Logout</span>
            </li>
          </ul>
        </div>
      </div>
      {isOpen && (
        <div className="sidebarSales-overlay show" onClick={toggleSidebar}></div>
      )}
    </>
  );
};

export default Sidebar;