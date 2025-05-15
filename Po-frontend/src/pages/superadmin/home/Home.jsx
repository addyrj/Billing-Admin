

import React, { useState } from "react";
import "./home.css";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
const HomePurchaseAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="home">
    <Sidebar className={`sidebar ${sidebarOpen ? "open" : ""}`} />
    <div className="homecontainer">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Outlet />
    </div>
  </div>
  );
};
export default HomePurchaseAdmin;
