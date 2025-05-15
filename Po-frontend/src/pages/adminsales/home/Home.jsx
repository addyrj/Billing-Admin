import React, { useState } from "react";
import "./homeSales.css";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";

const HomeSalesAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="homeSales">
      <Sidebar className={`sidebarSales ${sidebarOpen ? "open" : ""}`} />
      <div className="homeSalesContainer">
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Outlet />
      </div>
    </div>
  );
};

export default HomeSalesAdmin;