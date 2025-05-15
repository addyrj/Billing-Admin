

import React, { useState } from "react";
import "./home.css";
import { Routes, Route, Navigate,Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
const HomePurchaseAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="homepurchaseuser">
    <Sidebar className={`sidebar ${sidebarOpen ? "open" : ""}`} />
    <div className="homecontaineruser">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Outlet /> {/* This will render the nested routes */}
    </div>
  </div>
  );
};
export default HomePurchaseAdmin;