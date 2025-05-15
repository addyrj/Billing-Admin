

import React, { useState } from "react";
import "./homeSalesuser.css";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import Navbar from "../components/navbar/Navbar";
const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="homeSalesUser">
    <Sidebar className={`sidebar ${sidebarOpen ? "open" : ""}`} />
    <div className="homeSalesContainerUser">
      <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Outlet /> {/* This will render the nested routes */}
    </div>
  </div>
  );
};
export default Home;