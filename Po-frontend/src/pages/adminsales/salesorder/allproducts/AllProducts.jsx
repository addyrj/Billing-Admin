import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./allproductsales.css";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SearchIcon from "@mui/icons-material/Search";

const AllProductsSales = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 7;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No token found");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/dashboard/adminsales`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const responseData = await response.json();

        if (!responseData.data || !Array.isArray(responseData.data)) {
          throw new Error("Invalid data format received from server");
        }

        const formattedData = responseData.data
          .map((company, index) => {
            const safeParse = (field) => {
              if (typeof field === "string") {
                try {
                  return JSON.parse(field);
                } catch (e) {
                  console.warn(`Failed to parse field: ${field}`);
                  return {};
                }
              }
              return field || {};
            };

            return {
              ...company,
              serialNumber: index + 1,
              billingAddress: safeParse(company.billingAddress),
              shippingAddress: safeParse(company.shippingAddress),
              products: Array.isArray(company.products)
                ? company.products
                : safeParse(company.products) || [],
              contactNumbers: Array.isArray(company.contactNumbers)
                ? company.contactNumbers
                : safeParse(company.contactNumbers) || [],
            };
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        const sortedDataWithSerialNumbers = formattedData.map(
          (company, index) => ({
            ...company,
            serialNumber: index + 1,
          })
        );

        setData(sortedDataWithSerialNumbers);
        setFilteredData(sortedDataWithSerialNumbers);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = data.filter(
      (company) =>
        (company.companyName &&
          company.companyName.toLowerCase().includes(lowerSearch)) ||
        (company.email && company.email.toLowerCase().includes(lowerSearch)) ||
        (company.contactNumbers &&
          company.contactNumbers.some((num) =>
            num.toString().includes(searchTerm)
          )) ||
        (company.natureOfBusiness &&
          company.natureOfBusiness.toLowerCase().includes(lowerSearch))
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const handleUpdate = (companyId) => {
    navigate(`/adminsales/update-product/${companyId}`);
  };

  const toggleDropdown = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  if (loading) {
    return <div className="sales-container loading">Loading...</div>;
  }

  if (error) {
    return (
      <div className="sales-container error">
        <div className="error-message">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="sales-container no-data">No company data available</div>
    );
  }

  return (
    <div className="sales-container_2">
      <div className="sales-header">
        <h1 className="sales-title"> All Created Order Lists</h1>
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search by company, email, contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input_21"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th style={{ width: "70px", minWidth: "50px" }}> S.No</th>
              <th style={{ width: "85px", minWidth: "50px" }}> Action</th>
              <th>Company</th>
              <th>Date</th>
              <th>Email</th>
              <th>Products</th>
              <th style={{ width: "90px", minWidth: "50px" }}> Total Price</th>
              <th>Billing Address</th>
              <th>Contact</th>
              <th style={{ width: "90px", minWidth: "50px" }}> Business</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((company) => (
              <React.Fragment key={company.id}>
                <tr>
                  <td data-label="S.No">{company.serialNumber}</td>
                  <td data-label="Action">
                    <button
                      className="edit-button_23"
                      onClick={() => handleUpdate(company.id)}
                      aria-label="Edit company"
                    >
                      <EditIcon className="action-icon" />
                    </button>
                  </td>
                  <td data-label="Company">{company.companyName}</td>
                  <td data-label="Date">{formatDate(company.created_at)}</td>
                  <td data-label="Email">{company.email || "N/A"}</td>
                  <td data-label="Products">
                    <div
                      className="product-header_1"
                      onClick={() => toggleDropdown(company.id)}
                    >
                      <span>{company.products.length} product(s)</span>
                      {expandedCompany === company.id ? (
                        <ExpandLessIcon className="expand-icon" />
                      ) : (
                        <ExpandMoreIcon className="expand-icon" />
                      )}
                    </div>
                  </td>
                  <td data-label="Total Price">
                    <strong>
                      {company.grandTotalPrice ||
                        company.products.reduce(
                          (sum, product) =>
                            sum +
                            (parseFloat(product.totalPrice) || 0, 0).toFixed(2)
                        )}
                    </strong>
                  </td>
                  <td data-label="Billing Address">
                    {company.billingAddress?.address
                      ? `${company.billingAddress.address.substring(0, 40)}...`
                      : "N/A"}
                  </td>
                  <td data-label="Contact">
                    {company.contactNumbers?.length > 0 ? (
                      <div className="contact-numbers-inline">
                        {company.contactNumbers[0]}
                        {company.contactNumbers.length > 1 && (
                          <span className="more-contacts">
                            +{company.contactNumbers.length - 1} more
                          </span>
                        )}
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td data-label="Business">
                    {company.natureOfBusiness || "N/A"}
                  </td>
                </tr>

                {expandedCompany === company.id && (
                  <tr className="expanded-row">
                    <td colSpan="10">
                      <div className="expanded-content">
                        <div className="expanded-section">
                          <h4>Products Details</h4>
                          {company.products.map((product, index) => (
                            <div key={index} className="product-details">
                              <table className="product-table">
                                <thead>
                                  <tr>
                                    <th>Name</th>
                                    <th>Model</th>
                                    <th>Qty</th>
                                    <th>Price</th>
                                    <th>GST</th>
                                    <th>Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td>{product.name || "N/A"}</td>
                                    <td>{product.modelNumber || "N/A"}</td>
                                    <td>{product.quantity || "N/A"}</td>
                                    <td>{product.price || "N/A"}</td>
                                    <td>
                                      {product.gstIncluded === true ||
                                      product.gstIncluded === "true"
                                        ? "Included"
                                        : "Excluded"}
                                    </td>
                                    <td>{product.totalPrice || "N/A"}</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>

                        <div className="expanded-section">
                          <h4>Address Details</h4>
                          <div className="address-grid">
                            <div>
                              <h5>Billing Address</h5>
                              <p>
                                {company.billingAddress?.address || "N/A"}
                                <br />
                                {company.billingAddress?.State &&
                                  `${company.billingAddress.State}, `}
                                {company.billingAddress?.pinCode || ""}
                              </p>
                            </div>
                            {/* <div>
                              <h5>Shipping Address</h5>
                              <p>
                                {company.shippingAddress?.address || "Same as billing"}
                                <br />
                                {company.shippingAddress?.State && `${company.shippingAddress.State}, `}
                                {company.shippingAddress?.pinCode || ""}
                              </p>
                            </div> */}
                          </div>
                        </div>

                        <div className="expanded-section">
                          <h4>Contact Numbers</h4>
                          <div className="contact-numbers">
                            {company.contactNumbers?.map((num, i) => (
                              <span key={i} className="contact-badge">
                                {num}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="no-results">
          {searchTerm
            ? "No companies found matching your search"
            : "No companies available"}
        </div>
      )}

      {totalPages > 1 && (
        <div className="sales-pagination">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="pagination-button"
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AllProductsSales;
