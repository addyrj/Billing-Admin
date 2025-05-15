import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./navSales.css";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import InventoryIcon from "@mui/icons-material/Inventory";
import DownloadIcon from "@mui/icons-material/Download";
import LogoutIcon from "@mui/icons-material/Logout";
import logo from "../../../../Assets/yantram_logo.png";

const NavbarSales = ({ toggleSidebar }) => {
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
    <div className="navbarSales">
  
        <div className="navbarSales-top">
          <img src={logo} alt="Logo" className="navbarSales-logo" />
          <h1 className="titleSales_1">IOTTECH SMART PRODUCTS PRIVATE LIMITED</h1>
        </div>

        <div className="navbarSales-buttons">
          <button className="btnSales primarySales" onClick={handleDownload}>
            <DownloadIcon className="iconSales" />
            <span className="download1-product-text">Download Excel</span>
          </button>

          <button
            className="btnSales secondarySales"
            onClick={() => navigate("/adminsales/sales-all-product")}
          >
            <InventoryIcon className="iconSales" />
            <span className="download-product-text">Sales All Orders</span>
          </button>
        </div>

        <div className="rightSales">
          <div className="welcomeSales">Welcome {user?.name || "Admin"} Ji</div>
          <div className="profileSales" onClick={toggleDropdown}>
            <AccountCircleIcon className="avatarSales" />
            <div className="badgeSales">1</div>

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
                  <LogoutIcon style={{ color: "#07a6c9" }}  />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default NavbarSales;
