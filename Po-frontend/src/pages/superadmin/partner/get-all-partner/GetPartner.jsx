import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./allpartners.css";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';

const GetPartner = () => {
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterRole, setFilterRole] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 3;
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
  
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/admins`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch admins: ${response.status}`);
        }
  
        const data = await response.json();
        const sortedAdmins = data.sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setAdmins(sortedAdmins);
        setFilteredAdmins(sortedAdmins);
      } catch (error) {
        console.error(`Error fetching admins:`, error);
        setError(error.message);
        setAdmins([]);
        setFilteredAdmins([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    let result = admins;
    
    // Apply role filter
    if (filterRole !== 'all') {
      result = result.filter(admin => admin.role === filterRole);
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(admin => 
        (admin.username && admin.username.toLowerCase().includes(lowerSearch)) ||
        (admin.email && admin.email.toLowerCase().includes(lowerSearch)) ||
        (admin.mobile && admin.mobile.includes(searchTerm)) ||
        (admin.role && admin.role.toLowerCase().includes(lowerSearch))
      );
    }
    
    setFilteredAdmins(result);
    setCurrentPage(1);
  }, [admins, filterRole, searchTerm]);

  const handleEdit = (adminId) => {
    navigate(`/superadmin/edit-partner/${adminId}`);
  };

  const handleDelete = async (adminId) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this admin?`);
    if (!confirmDelete) return;
  
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/admins/${adminId}`, 
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to delete admin: ${response.status}`);
      }
  
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
    } catch (error) {
      console.error("Error deleting admin:", error);
      alert("Error deleting admin: " + error.message);
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

  const currentItems = filteredAdmins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);

  const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const getSerialNumber = (index) => (currentPage - 1) * itemsPerPage + index + 1;

  if (loading) {
    return <div className="partner-table-container loading">Loading admins...</div>;
  }

  if (error) {
    return (
      <div className="partner-table-container error">
        <div className="error-message">Error: {error}</div>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (admins.length === 0) {
    return <div className="partner-table-container no-data">No admins found</div>;
  }

  return (
    <div className="partner-table-container">
      <div className="table-header">
        <h1 className="table-title">All Partners</h1>
        <div className="filter-search-container">
          <div className="search-container">
            <SearchIcon className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input_56"
            />
          </div>
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="adminsales">Sales Admin</option>
            <option value="adminpurchase">Purchase Admin</option>
          </select>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table className="partner-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Username</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((admin, index) => (
              <tr key={admin.id}>
                <td data-label="S.No">{getSerialNumber(index)}</td>
                <td data-label="Username">{admin.username}</td>
                <td data-label="Email">{admin.email}</td>
                <td data-label="Mobile">{admin.mobile}</td>
                <td data-label="Role">
                  {admin.role === 'adminsales' ? 'Sales Admin' : 'Purchase Admin'}
                </td>
                <td data-label="Created At">{formatDate(admin.created_at)}</td>
                <td data-label="Action">
                  <div className="partner-action-buttons">
                    <button 
                      className="edit-button_11" 
                      onClick={() => handleEdit(admin.id)}
                      aria-label="Edit partner"
                    >
                      <EditIcon className="action-icon" />
                    </button>
                    <button 
                      className="delete-button_11" 
                      onClick={() => handleDelete(admin.id)}
                      aria-label="Delete partner"
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

      {filteredAdmins.length === 0 && (
        <div className="no-results">
          {searchTerm || filterRole !== 'all' 
            ? "No partners found matching your criteria" 
            : "No partners available"}
        </div>
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

export default GetPartner;