

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
import "./getgrn.css";
const GetGrn = () => {
  const [grnList, setGrnList] = useState([]);
  const [filteredGRNs, setFilteredGRNs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 7;
  const navigate = useNavigate();

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication failed: No token provided.");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/grn`,
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
      if (!response.ok) throw new Error("Failed to fetch GRNs");

      const data = await response.json();
      const sortedData = (data.data || []).sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
      setGrnList(sortedData);
      setFilteredGRNs(sortedData);
    } catch (error) {
      console.error("Error fetching GRNs:", error);
      setError(error.message);
      setGrnList([]);
      setFilteredGRNs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGRNs();
  }, []);

  useEffect(() => {
    const filtered = grnList.filter(
      (grn) =>
        grn.grn_no?.toLowerCase().includes(search.toLowerCase()) ||
        grn.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
        grn.payable_amount?.toString().includes(search)
    );
    setFilteredGRNs(filtered);
    setCurrentPage(1);
  }, [search, grnList]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    setFilteredGRNs((prev) =>
      [...prev].sort((a, b) => {
        if (field === "payable_amount") {
          return order === "asc"
            ? (a.payable_amount || 0) - (b.payable_amount || 0)
            : (b.payable_amount || 0) - (a.payable_amount || 0);
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
    navigate(`/adminpurchase/view-grn/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/adminpurchase/edit-grn/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this GRN?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/grn/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete GRN");
      fetchGRNs();
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
  const currentItems = filteredGRNs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredGRNs.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  if (loading) {
    return <div className="userpurchase-po-list-container loading">Loading GRNs...</div>;
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
        <h1 className="userpurchase-po-list-title">Goods Received Notes--- &&--- Create Debit Notes Here</h1>
        <div className="userpurchase-search-container">
          <SearchIcon className="userpurchase-search-icon" />
          <input
            type="text"
            placeholder="Search by GRN No, Vendor, Amount..."
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
                <th>Create Debit Note</th>
              <th onClick={() => handleSort("created_at")}>
                <div className="userpurchase-sortable-header">
                  Created Date
                  {sortField === "created_at" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("grn_no")}>
                <div className="userpurchase-sortable-header">
                  GRN Number
                  {sortField === "grn_no" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("vendor_name")}>
                <div className="userpurchase-sortable-header">
                  Vendor Name
                  {sortField === "vendor_name" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("payable_amount")}>
                <div className="userpurchase-sortable-header">
                  Payable Amount
                  {sortField === "payable_amount" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((grn, index) => (
                <tr key={grn.id || index}>
                  <td data-label="S.No">{getSerialNumber(index)}</td>
               <td data-label="Create Debit Note">
  <button
    onClick={() => grn.damage_status === "Damage" && navigate(`/adminpurchase/create-debit?grnId=${grn.id}`)}
    className={`userpurchase-create-debit-button ${grn.damage_status !== "Damage" ? "disabled" : ""}`}
    disabled={grn.damage_status !== "Damage"}
  >
    {grn.damage_status === "Damage" ? "Create DNote" : "No Damage"}
  </button>
</td>
                  <td data-label="Created Date">{formatDate(grn.created_at)}</td>
                  <td data-label="GRN Number">{grn.grn_no || "N/A"}</td>
                  <td data-label="Vendor Name">{grn.vendor_name || "N/A"}</td>
                  <td data-label="Payable Amount">{formatCurrency(grn.payable_amount)}</td>
                  <td data-label="Actions">
                    <div className="userpurchase-action-buttonss">
                      <button
                        className="userpurchase-view-buttonn"
                        onClick={() => handleView(grn.id)}
                        aria-label="View GRN"
                      >
                        <VisibilityIcon className="userpurchase-action-iconn" />
                      </button>
                      <button
                        className="userpurchase-edit-buttonn"
                        onClick={() => handleEdit(grn.id)}
                        aria-label="Edit GRN"
                      >
                        <EditIcon className="userpurchase-action-iconn" />
                      </button>
                      <button
                        className="userpurchase-delete-buttonn"
                        onClick={() => handleDelete(grn.id)}
                        aria-label="Delete GRN"
                      >
                        <DeleteIcon className="userpurchase-action-iconn" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="userpurchase-no-results">
                  {search ? "No matching GRNs found" : "No GRNs available"}
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

export default GetGrn