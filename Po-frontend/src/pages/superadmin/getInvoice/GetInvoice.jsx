import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./POList.css";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const POList = () => {
  const [poList, setPoList] = useState([]);
  const [filteredPOs, setFilteredPOs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchPOs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication failed: No token provided.");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/get-po`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 403)
        throw new Error("Access denied. Invalid token.");
      if (!response.ok) throw new Error("Failed to fetch purchase orders");

      const data = await response.json();
      const sortedData = (data.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setPoList(sortedData);
      setFilteredPOs(sortedData);
    } catch (error) {
      console.error("Error fetching POs:", error);
      setError(error.message);
      setPoList([]);
      setFilteredPOs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  useEffect(() => {
    const filtered = poList.filter(
      (po) =>
        po.poNo?.toLowerCase().includes(search.toLowerCase()) ||
        po.supplier?.toLowerCase().includes(search.toLowerCase()) ||
        po.totalAmount?.toString().includes(search)
    );
    setFilteredPOs(filtered);
    setCurrentPage(1);
  }, [search, poList]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    setFilteredPOs((prev) =>
      [...prev].sort((a, b) => {
        if (field === "totalAmount") {
          return order === "asc"
            ? (a.totalAmount || 0) - (b.totalAmount || 0)
            : (b.totalAmount || 0) - (a.totalAmount || 0);
        } else if (field === "created_at") {
          return order === "asc"
            ? new Date(a.created_at) - new Date(b.created_at)
            : new Date(b.created_at) - new Date(a.created_at);
        }
        return order === "asc"
          ? String(a[field] || "").localeCompare(String(b[field] || ""))
          : String(b[field] || "").localeCompare(String(a[field] || ""));
      })
    );
  };

  const handleView = (id) => {
    navigate(`/superadmin/view-invoice/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0.00';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace('₹', '₹');
  };

  // Pagination logic
  const currentItems = filteredPOs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  if (loading) {
    return <div className="po-table-container loading">Loading purchase orders...</div>;
  }

  if (error) {
    return (
      <div className="po-table-container error">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (poList.length === 0) {
    return <div className="po-table-container no-data">No purchase orders found</div>;
  }

  return (
    <div className="po-table-container">
      <div className="table-header">
        <h1 className="table-title">Purchase Orders</h1>
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search by PO Number, Supplier, Amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input_51"
          />
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="po-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th onClick={() => handleSort("created_at")}>
                <div className="sortable-header">
                  Created Date
                  {sortField === "created_at" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("poNo")}>
                <div className="sortable-header">
                  PO Number
                  {sortField === "poNo" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th>Supplier Name</th>
              <th onClick={() => handleSort("totalAmount")}>
                <div className="sortable-header">
                  Total Amount
                  {sortField === "totalAmount" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((po, index) => (
              <tr key={po.id || index}>
                <td data-label="S.No">{getSerialNumber(index)}</td>
                <td data-label="Created Date">{formatDate(po.created_at)}</td>
                <td data-label="PO Number">{po.poNo || "N/A"}</td>
                <td data-label="Supplier Name">{po.supplier || "N/A"}</td>
                <td data-label="Total Amount">{formatCurrency(po.totalAmount)}</td>
                <td data-label="Actions">
                  <div className="action-buttons">
                    <button
                      className="view-button_2"
                      onClick={() => handleView(po.id)}
                      aria-label="View PO"
                    >
                      <VisibilityIcon className="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredPOs.length === 0 && search && (
        <div className="no-results">No purchase orders found matching your search.</div>
      )}

      {totalPages > 1 && (
        <div className="pagination1">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="pagination1-button"
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="pagination1-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default POList;