import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from "@mui/icons-material";
import "./POList.css";

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
    navigate(`/purchaseuser/view-invoice/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/purchaseuser/edit-invoice/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this PO?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/delete-po/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete purchase order");
      fetchPOs();
    } catch (error) {
      alert("Delete failed: " + error.message);
    }
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
    }).format(amount);
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
    return <div className="userpurchase-po-list-container loading">Loading purchase orders...</div>;
  }

  if (error) {
    return (
      <div className="userpurchase-po-list-container error">
        <div className="userpurchase-error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="userpurchase-retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="userpurchase-po-list-container">
      <div className="userpurchase-po-list-header">
        <h1 className="userpurchase-po-list-title">Purchase Orders</h1>
        <div className="userpurchase-search-container">
          <SearchIcon className="userpurchase-search-icon" />
          <input
            type="text"
            placeholder="Search by PO Number, Supplier, Amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="userpurchase-search-input"
          />
        </div>
      </div>
      
      <div className="userpurchase-table-wrapper">
        <table className="userpurchase-po-list-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th onClick={() => handleSort("created_at")}>
                <div className="userpurchase-sortable-header">
                  Created Date
                  {sortField === "created_at" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("poNo")}>
                <div className="userpurchase-sortable-header">
                  PO Number
                  {sortField === "poNo" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th>Supplier Name</th>
              <th onClick={() => handleSort("totalAmount")}>
                <div className="userpurchase-sortable-header">
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
            {currentItems.length > 0 ? (
              currentItems.map((po, index) => (
                <tr key={po.id || index}>
                  <td data-label="S.No">{getSerialNumber(index)}</td>
                  <td data-label="Created Date">{formatDate(po.created_at)}</td>
                  <td data-label="PO Number">{po.poNo || "N/A"}</td>
                  <td data-label="Supplier Name">{po.supplier || "N/A"}</td>
                  <td data-label="Total Amount">{formatCurrency(po.totalAmount)}</td>
                  <td data-label="Actions">
                    <div className="userpurchase-action-buttons">
                      <button
                        className="userpurchase-view-button"
                        onClick={() => handleView(po.id)}
                        aria-label="View PO"
                      >
                        <VisibilityIcon className="userpurchase-action-icon" />
                      </button>
                      <button
                        className="userpurchase-edit-button"
                        onClick={() => handleEdit(po.id)}
                        aria-label="Edit PO"
                      >
                        <EditIcon className="userpurchase-action-icon" />
                      </button>
                      {/* <button
                        className="userpurchase-delete-button"
                        onClick={() => handleDelete(po.id)}
                        aria-label="Delete PO"
                      >
                        <DeleteIcon className="userpurchase-action-icon" />
                      </button> */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="userpurchase-no-results">
                  {search ? "No matching purchase orders found" : "No purchase orders available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="userpurchase-pagination">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="userpurchase-pagination-button"
          >
            Previous
          </button>
          <span className="userpurchase-page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="userpurchase-pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default POList;