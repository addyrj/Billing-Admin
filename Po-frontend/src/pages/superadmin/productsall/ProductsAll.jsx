import React, { useState, useEffect } from "react";
import "./allproduct.css";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const ProductsAll = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required. Please login.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/all-data`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error(`Server responded with ${response.status}`);

        const responseData = await response.json();
        
        if (!responseData.data || !Array.isArray(responseData.data)) {
          throw new Error("Invalid data format received from server");
        }

        const sortedData = responseData.data
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .map((company, index) => ({
            ...parseCompanyData(company),
            serialNumber: index + 1
          }));

        setData(sortedData);
        setFilteredData(sortedData);
      } catch (error) {
        setError(error.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
      setCurrentPage(1);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = data.filter(company => 
        (company.companyName && company.companyName.toLowerCase().includes(lowerSearch)) ||
        (company.partnerName && company.partnerName.toLowerCase().includes(lowerSearch)) ||
        (company.email && company.email.toLowerCase().includes(lowerSearch)) ||
        (company.gstNo && company.gstNo.toLowerCase().includes(lowerSearch)) ||
        (company.contactNumbers && company.contactNumbers.some(num => 
          num.toString().includes(searchTerm)
        )
      ));
      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, data]);

  const handleDelete = async (companyId) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/companies/${companyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);

      setData(data.filter(company => company.id !== companyId));
      setFilteredData(filteredData.filter(company => company.id !== companyId));
      alert("Company deleted successfully");
    } catch (error) {
      console.error("Error deleting company:", error);
      alert("Failed to delete company");
    }
  };

  const parseCompanyData = (company) => {
    const parseField = (field, defaultValue) => {
      try {
        if (typeof field === "string") return JSON.parse(field.replace(/\\"/g, '"'));
        return field || defaultValue;
      } catch (e) {
        console.error("Parsing error:", e);
        return defaultValue;
      }
    };

    return {
      ...company,
      billingAddress: parseField(company.billingAddress, { address: "", State: "", pinCode: "" }),
      shippingAddress: parseField(company.shippingAddress, { address: "", State: "", pinCode: "" }),
      registeredOfficeAddress: parseField(company.registeredOfficeAddress, { address: "", State: "", pinCode: "" }),
      products: parseField(company.products, []),
      contactNumbers: parseField(company.contactNumbers || company.contactNumber, [])
    };
  };

  const toggleDropdown = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentItems = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  const formatAddress = (address) => {
    if (!address) return "N/A";
    const parts = [address.address, address.State, address.pinCode].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "N/A";
  };

  if (loading) return (
    <div className="loading-container">
      <CircularProgress />
      <p>Loading company data...</p>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <Alert severity="error">{error}</Alert>
      <button className="retry-button" onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );

  if (data.length === 0) return (
    <div className="no-data">
      <Alert severity="info">No company data available</Alert>
    </div>
  );

  return (
    <div className="product-table-container">
      <div className="table-header">
        <h1 className="table-title">List of Created All Orders by all partners</h1>
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search by company, partner, email, GST..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input_37"
          />
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="product-table_1">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Action</th>
              <th>Date Created</th>
              <th>Partner Name</th>
              <th>Company Name</th>
              <th>Company Contact No</th>
              <th>Products</th>
              <th>Grand Total</th>
              <th>Email</th>
              <th>GST</th>
              <th>Address</th>
              <th>Business Type</th>
              <th>Firm Type</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((company) => (
              <tr key={company.id}>
                <td data-label="S.No">{getSerialNumber(company.serialNumber)}</td>
                <td data-label="Action">
                  <button 
                    className="delete-button_23" 
                    onClick={() => handleDelete(company.id)}
                    aria-label="Delete company"
                  >
                    <DeleteIcon className="action-icon" />
                  </button>
                </td>
                <td data-label="Date Created">{formatDate(company.created_at)}</td>
                <td data-label="Partner Name">{company.partnerName || "N/A"}</td>
                <td data-label="Company Name">{company.companyName}</td>
                <td data-label="Company Contact No">
                  {company.contactNumbers?.length > 0 ? (
                    <ul className="contact-list">
                      {company.contactNumbers.map((num, i) => (
                        <li key={i}>{num}</li>
                      ))}
                    </ul>
                  ) : "N/A"}
                </td>
                <td data-label="Products">
                  {company.products?.length > 0 ? (
                    <ul className="product-list">
                      {company.products.map((product, index) => (
                        <li key={index}>
                          <div className="product-header" onClick={() => toggleDropdown(`${company.id}-${index}`)}>
                            <span>{product.name || "Unnamed Product"}</span>
                            {expandedCompany === `${company.id}-${index}` ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </div>
                          {expandedCompany === `${company.id}-${index}` && (
                            <div className="product-details">
                              <table>
                                <tbody>
                                  <tr><th>Model:</th><td>{product.modelNumber || "N/A"}</td></tr>
                                  <tr><th>Qty:</th><td>{product.quantity || "0"}</td></tr>
                                  <tr><th>Price:</th><td>₹{product.price || "0"}</td></tr>
                                  <tr><th>Total:</th><td>₹{product.totalPrice || "0"}</td></tr>
                                  <tr><th>GST:</th><td>{product.gstIncluded === true || product.gstIncluded === "true" ? "Included" : "Excluded"}</td></tr>
                                </tbody>
                              </table>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : <span>No products</span>}
                </td>
                <td data-label="Grand Total">₹{company.grandTotalPrice || "0"}</td>
                <td data-label="Email">{company.email || "N/A"}</td>
                <td data-label="GST">{company.gstNo || "N/A"}</td>
                <td data-label="Address">
                  <div className="address-container">
                    <strong>Billing:</strong>
                    <span>{formatAddress(company.billingAddress)}</span>
                    <strong>Shipping:</strong>
                    <span>{formatAddress(company.shippingAddress)}</span>
                    <strong>Registered:</strong>
                    <span>{formatAddress(company.registeredOfficeAddress)}</span>
                  </div>
                </td>
                <td data-label="Business Type">{company.natureOfBusiness || "N/A"}</td>
                <td data-label="Firm Type">{company.firmType || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && searchTerm && (
        <div className="no-results">No companies found matching your search.</div>
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

export default ProductsAll;