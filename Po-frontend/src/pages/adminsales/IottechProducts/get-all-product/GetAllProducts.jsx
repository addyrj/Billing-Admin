import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./allproduct.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const AllProductsAdminSales = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/products`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      
      const responseData = await response.json();
      const sortedData = responseData.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setData(sortedData);
      setFilteredData(sortedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredData(data);
      setCurrentPage(1);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = data.filter(product => 
      product.name.toLowerCase().includes(lowerSearch) ||
      (product.models && product.models.toLowerCase().includes(lowerSearch))
    );

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, data]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/products/${id}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to delete product");
        fetchData();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleEdit = (productId) => {
    navigate(`/adminsales/edit-iot-product/${productId}`);
  };

  const parseModels = (modelsString) => {
    if (!modelsString) return [];
    return modelsString.split(",").map(model => {
      const [modelName, price] = model.split("-").map(item => item.trim());
      return { modelName, price };
    });
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1 className="sales-title">IoT Product List</h1>
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input_34"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="sales-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Product Name</th>
              <th>Model</th>
              <th>Price</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((product, rowIndex) => (
                <React.Fragment key={product.id}>
                  {parseModels(product.models).map((model, modelIndex) => (
                    <tr key={`${product.id}-${modelIndex}`}>
                      {modelIndex === 0 && (
                        <>
                          <td rowSpan={parseModels(product.models).length} data-label="S.No">
                            {getSerialNumber(rowIndex)}
                          </td>
                          <td rowSpan={parseModels(product.models).length} data-label="Product Name">
                            {product.name}
                          </td>
                        </>
                      )}
                      <td data-label="Model">{model.modelName}</td>
                      <td data-label="Price">{model.price}</td>
                      {modelIndex === 0 && (
                        <td rowSpan={parseModels(product.models).length} data-label="Action">
                          <div className="action-buttons">
                            <button 
                              className="edit-button_32" 
                              onClick={() => handleEdit(product.id)}
                              aria-label="Edit product"
                            >
                              <EditIcon className="action-icon" />
                            </button>
                            <button 
                              className="delete-button_32" 
                              onClick={() => handleDelete(product.id)}
                              aria-label="Delete product"
                            >
                              <DeleteIcon className="action-icon" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  {searchTerm ? "No products found matching your search" : "No products available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredData.length > 0 && (
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

export default AllProductsAdminSales;