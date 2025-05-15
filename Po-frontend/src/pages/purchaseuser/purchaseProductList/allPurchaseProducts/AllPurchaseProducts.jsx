import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./allPurchaseProducts.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const PurchaseProductList = () => {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/purchase-products`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      const sortedData = data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setProducts(sortedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/purchase-products/${id}`,
          {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to delete product");
        }

        fetchProducts();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const filteredProducts = products.filter(product => 
    product.productname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  if (loading) return <div className="userpurchase-loading">Loading products...</div>;
  if (error) return (
    <div className="userpurchase-error">
      <div className="userpurchase-error-message">Error: {error}</div>
      <button className="userpurchase-retry-button" onClick={fetchProducts}>Retry</button>
    </div>
  );

  return (
    <div className="userpurchase-po-list-container">
      <div className="userpurchase-po-list-header">
        <h1 className="userpurchase-po-list-title">Purchase Products</h1>
        <div className="userpurchase-search-container">
          <span className="userpurchase-search-icon">🔍</span>
          <input
            type="text"
            className="userpurchase-search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="userpurchase-table-wrapper">
        <table className="userpurchase-po-list-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((product, index) => (
                <tr key={product.id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{product.productname}</td>
                  <td>{product.description}</td>
                  <td>{formatDate(product.created_at)}</td>
                  <td>
                    <div className="userpurchase-action-buttons">
                      <button 
                        className="userpurchase-edit-button"
                        onClick={() => navigate(`/purchaseuser/edit-all-pp/${product.id}`)}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="userpurchase-delete-button"
                        onClick={() => handleDelete(product.id)}
                        title="Delete"
                      >
                        <DeleteIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="userpurchase-no-results">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="userpurchase-pagination">
        <button 
          className="userpurchase-pagination-button" 
          onClick={prevPage} 
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="userpurchase-page-indicator">
          Page {currentPage} of {totalPages}
        </span>
        <button 
          className="userpurchase-pagination-button" 
          onClick={nextPage} 
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PurchaseProductList;