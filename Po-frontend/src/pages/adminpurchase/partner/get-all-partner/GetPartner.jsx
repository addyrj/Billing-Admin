import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./allpartners.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const GetPartner = () => {
  const [salesUsers, setSalesUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }
  
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/purchase-users`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.status}`);
        }
  
        const data = await response.json();
        const usersArray = Array.isArray(data) ? data : (data.users || []);
        
        if (usersArray.length > 0) {
          const sortedUsers = usersArray.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });
          setSalesUsers(sortedUsers);
        } else {
          setSalesUsers([]);
        }
      } catch (error) {
        console.error("Error fetching sales users:", error);
        setError(error.message);
        setSalesUsers([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  const handleEdit = (userId) => {
    navigate(`/adminpurchase/edit-partner/${userId}`);
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this Purchase user?");
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/purchase-users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete sales user: ${response.status}`);
      }
  
      setSalesUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error deleting sales user:", error);
      alert("Error deleting sales user: " + error.message);
    }
  };

  const filteredUsers = salesUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.mobile && user.mobile.toString().includes(searchTerm))
  );

  const currentItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  if (loading) return <div className="loading">Loading sales users...</div>;
  if (error) return (
    <div className="error">
      <div className="error-message">Error: {error}</div>
      <button onClick={() => window.location.reload()} className="retry-button">
        Retry
      </button>
    </div>
  );

  return (
    <div className="po-list-container">
      <div className="po-list-header">
        <h1 className="po-list-title">Sales Users</h1>
        <div className="search-container">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="po-list-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((user, index) => (
                <tr key={user.id}>
                  <td>{getSerialNumber(index)}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.mobile || 'N/A'}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="edit-button"
                        onClick={() => handleEdit(user.id)}
                        title="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(user.id)}
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
                <td colSpan="6" className="no-results">
                  No sales users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-button" 
            onClick={prevPage} 
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="page-indicator">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            className="pagination-button" 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default GetPartner;