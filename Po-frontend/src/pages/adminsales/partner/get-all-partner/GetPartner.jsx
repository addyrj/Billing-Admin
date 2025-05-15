import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./salespartners.css";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

const GetPartner = () => {
  const [salesUsers, setSalesUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 4;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Authentication token not found");
        }
  
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sales-users`, {
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
          const sortedUsers = usersArray.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          );
          setSalesUsers(sortedUsers);
          setFilteredUsers(sortedUsers);
        } else {
          setSalesUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching sales users:", error);
        setError(error.message);
        setSalesUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(salesUsers);
      setCurrentPage(1);
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = salesUsers.filter(user => 
      (user.username && user.username.toLowerCase().includes(lowerSearch)) ||
      (user.email && user.email.toLowerCase().includes(lowerSearch)) ||
      (user.mobile && user.mobile.includes(searchTerm))
    );

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, salesUsers]);

  const handleEdit = (userId) => {
    navigate(`/adminsales/edit-partner/${userId}`);
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this sales user?");
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/sales-users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to delete sales user: ${response.status}`);
      }
  
      setSalesUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error("Error deleting sales user:", error);
      alert("Error deleting sales user: " + error.message);
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

  const currentItems = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  if (loading) {
    return <div className="sales-container loading">Loading sales users...</div>;
  }

  if (error) {
    return (
      <div className="sales-container error">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (salesUsers.length === 0) {
    return <div className="sales-container no-data">No sales users found</div>;
  }

  return (
    <div className="sales-container">
      <div className="sales-header">
        <h1 className="sales-title">Sales Users List</h1>
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, mobile..."
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
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user, index) => (
              <tr key={user.id}>
                <td data-label="S.No">{getSerialNumber(index)}</td>
                <td data-label="Username">{user.username}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Mobile">{user.mobile}</td>
                <td data-label="Created At">{formatDate(user.created_at)}</td>
                <td data-label="Action">
                  <div className="action-buttons">
                    <button 
                      className="edit-button_31" 
                      onClick={() => handleEdit(user.id)}
                      aria-label="Edit user"
                    >
                      <EditIcon className="action-icon" />
                    </button>
                    <button 
                      className="delete-button_31" 
                      onClick={() => handleDelete(user.id)}
                      aria-label="Delete user"
                    >
                      <DeleteIcon className="action-icon" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">
          {searchTerm 
            ? "No users found matching your search" 
            : "No users available"}
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

export default GetPartner;