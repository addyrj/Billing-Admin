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
import "./debit.css";

const GetDebit = () => {
  const [debitList, setDebitList] = useState([]);
  const [filteredDebits, setFilteredDebits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("debit_note_date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const fetchDebits = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication failed: No token provided.");

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/debit`,
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
      if (!response.ok) throw new Error("Failed to fetch debit notes");

      const data = await response.json();
      // Explicitly sort by date in descending order (newest first)
      const sortedData = (data.data || []).sort((a, b) => {
        return new Date(b.debit_note_date) - new Date(a.debit_note_date);
      });
      setDebitList(sortedData);
      setFilteredDebits(sortedData);
    } catch (error) {
      console.error("Error fetching debit notes:", error);
      setError(error.message);
      setDebitList([]);
      setFilteredDebits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebits();
  }, []);

  useEffect(() => {
    const filtered = debitList.filter(
      (debit) =>
        debit.debit_note_number?.toLowerCase().includes(search.toLowerCase()) ||
        debit.vendor_name?.toLowerCase().includes(search.toLowerCase()) ||
        debit.grn_no?.toLowerCase().includes(search.toLowerCase()) ||
        debit.payable_amount?.toString().includes(search)
    );
    setFilteredDebits(filtered);
    setCurrentPage(1);
  }, [search, debitList]);

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    setFilteredDebits((prev) =>
      [...prev].sort((a, b) => {
        if (field === "payable_amount") {
          return order === "asc"
            ? (a.payable_amount || 0) - (b.payable_amount || 0)
            : (b.payable_amount || 0) - (a.payable_amount || 0);
        } else if (field === "debit_note_date") {
          return order === "asc"
            ? new Date(a.debit_note_date) - new Date(b.debit_note_date)
            : new Date(b.debit_note_date) - new Date(a.debit_note_date);
        }
        return order === "asc"
          ? String(a[field] || "").localeCompare(String(b[field] || ""))
          : String(b[field] || "").localeCompare(String(a[field] || ""));
      })
    );
  };

  const handleView = (id) => {
    navigate(`/purchaseuser/view-debit/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/purchaseuser/edit-debit/${id}`);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this debit note?"
    );
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/debit/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete debit note");
      fetchDebits();
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
  const currentItems = filteredDebits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredDebits.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  if (loading) {
    return <div className="debit-container loading">Loading debit notes...</div>;
  }

  if (error) {
    return (
      <div className="debit-container error">
        <div className="debit-error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="debit-retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="debit-container">
      <div className="debit-header">
        <h1 className="debit-title">Debit Notes</h1>
        <div className="debit-search-container">
          <SearchIcon className="debit-search-icon" />
          <input
            type="text"
            placeholder="Search by Debit Note No, Vendor, GRN No, Amount..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="debit-search-input"
          />
        </div>
      </div>
      
      <div className="debit-table-wrapper">
        <table className="debit-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th onClick={() => handleSort("debit_note_date")}>
                <div className="debit-sortable-header">
                  Debit Note Date
                  {sortField === "debit_note_date" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("debit_note_number")}>
                <div className="debit-sortable-header">
                  Debit Note Number
                  {sortField === "debit_note_number" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("grn_no")}>
                <div className="debit-sortable-header">
                  GRN Number
                  {sortField === "grn_no" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("vendor_name")}>
                <div className="debit-sortable-header">
                  Vendor Name
                  {sortField === "vendor_name" && (
                    sortOrder === "asc" ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                  )}
                </div>
              </th>
              <th onClick={() => handleSort("payable_amount")}>
                <div className="debit-sortable-header">
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
              currentItems.map((debit, index) => (
                <tr key={debit.id || index}>
                  <td data-label="S.No">{getSerialNumber(index)}</td>
                  <td data-label="Debit Note Date">{formatDate(debit.debit_note_date)}</td>
                  <td data-label="Debit Note Number">{debit.debit_note_number || "N/A"}</td>
                  <td data-label="GRN Number">{debit.grn_no || "N/A"}</td>
                  <td data-label="Vendor Name">{debit.vendor_name || "N/A"}</td>
                  <td data-label="Payable Amount">{formatCurrency(debit.payable_amount)}</td>
                  <td data-label="Actions">
                    <div className="debit-action-buttons">
                      <button
                        className="debit-view-button"
                        onClick={() => handleView(debit.id)}
                        aria-label="View Debit Note"
                      >
                        <VisibilityIcon className="debit-action-icon" />
                      </button>
                      <button
                        className="debit-edit-button"
                        onClick={() => handleEdit(debit.id)}
                        aria-label="Edit Debit Note"
                      >
                        <EditIcon className="debit-action-icon" />
                      </button>
                      <button
                        className="debit-delete-button"
                        onClick={() => handleDelete(debit.id)}
                        aria-label="Delete Debit Note"
                      >
                        <DeleteIcon className="debit-action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="debit-no-results">
                  {search ? "No matching debit notes found" : "No debit notes available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="debit-pagination">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="debit-pagination-button"
          >
            Previous
          </button>
          <span className="debit-page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="debit-pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GetDebit;