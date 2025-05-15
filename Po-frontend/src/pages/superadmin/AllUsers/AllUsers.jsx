import React, { useState, useEffect } from 'react';
import "./alluser.css";
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 8;
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
  
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/users`, {
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
          setUsers(sortedUsers);
          setFilteredUsers(sortedUsers);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(error.message);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
      setCurrentPage(1);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = users.filter(user => 
        (user.username && user.username.toLowerCase().includes(lowercasedSearch)) ||
        (user.email && user.email.toLowerCase().includes(lowercasedSearch)) ||
        (user.mobile && user.mobile.toLowerCase().includes(lowercasedSearch)) ||
        (user.role && user.role.toLowerCase().includes(lowercasedSearch)) ||
        (user.created_by && user.created_by.toLowerCase().includes(lowercasedSearch))
      );
      setFilteredUsers(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, users]);

  const handleEdit = (userId) => {
    navigate(`/admin/edit-user/${userId}`);
  };

  const handleDelete = (userId) => {
    // Implement delete functionality here
    console.log("Delete user with ID:", userId);
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
    return <div className="user-table-container loading">Loading users...</div>;
  }

  if (error) {
    return (
      <div className="user-table-container error">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (users.length === 0) {
    return <div className="user-table-container no-data">No users found</div>;
  }

  return (
    <div className="user-table-container">
      <div className="table-header">
        <h1 className="table-title">Users List</h1>
        <div className="search-container">
        
          <input
            type="text"
            placeholder="Search by name, email, mobile, etc..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input_69"
          />
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Created By</th>
              <th>Created Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((user, index) => (
              <tr key={user.id}>
                <td data-label="S.No">{getSerialNumber(index)}</td>
                <td data-label="Name">{user.username}</td>
                <td data-label="Email">{user.email}</td>
                <td data-label="Mobile">{user.mobile}</td>
                <td data-label="Role">{user.role || 'N/A'}</td>
                <td data-label="Created By">{user.created_by || 'N/A'}</td>
                <td data-label="Created Date">{formatDate(user.created_at)}</td>
                <td data-label="Action">
                  <div className="user-action-buttons">
                    <button 
                      className="edit-buttonn" 
                      onClick={() => handleEdit(user.id)}
                      aria-label="Edit user"
                    >
                      <EditIcon className="action-icon" />
                    </button>
                    <button 
                      className="delete-buttonn" 
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

      {filteredUsers.length === 0 && searchTerm && (
        <div className="no-results">No users found matching your search.</div>
      )}

      {totalPages > 1 && (
        <div className="user-pagination">
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

export default AllUsers;