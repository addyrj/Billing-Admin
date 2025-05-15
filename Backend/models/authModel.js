const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const findUserByEmail = async (email) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
  return rows;
};

const findUserByMobile = async (mobile) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE mobile = ?", [mobile]);
  return rows;
};

const findUserById = async (id) => {
  const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
  return rows; // Returns an array of results
};

const createUser = async (name, email, mobile, password, role_id, created_by) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    "INSERT INTO users (username, email, mobile, password, role_id, created_by) VALUES (?, ?, ?, ?, ?, ?)",
    [name, email, mobile, hashedPassword, role_id, created_by]
  );
  return result;
};

const updateUserField = async (id, field, value) => {
  try {
    // Validate input
    if (!id || !field || value === undefined || value === null) {
      throw new Error('Missing required parameters');
    }

    // List of allowed fields that can be updated
    const allowedFields = ['email', 'mobile', 'password'];
    if (!allowedFields.includes(field)) {
      throw new Error(`Field ${field} is not updatable`);
    }

    // Special handling for password
    let finalValue = value;
    if (field === 'password') {
      if (value.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      finalValue = await bcrypt.hash(value, 10);
    }

    // Email validation
    if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
    }

    // Mobile validation
    if (field === 'mobile') {
      const mobileRegex = /^[0-9]{10,15}$/;
      if (!mobileRegex.test(value)) {
        throw new Error('Mobile must be 10-15 digits');
      }
    }

    // Parameterized query to prevent SQL injection
    const query = `UPDATE users SET ${field} = ? WHERE id = ?`;
    const params = [finalValue, id];

    // Execute update
    const [result] = await pool.query(query, params);
    
    // Check if update was successful
    if (result.affectedRows === 0) {
      throw new Error('User not found or no changes made');
    }

    return {
      success: true,
      affectedRows: result.affectedRows,
      fieldUpdated: field
    };

  } catch (error) {
    console.error(`Error updating user field: ${error.message}`);
    throw error; // Re-throw for controller to handle
  }
};

const deactivateUser = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const [result] = await pool.query(
      "DELETE FROM users WHERE id = ?",
      [userId]
    );
    
    return result;
  } catch (error) {
    console.error("Delete user error:", error);
    throw error; // Let the controller handle the response
  }
};

module.exports = {
  findUserByEmail,
  findUserByMobile,
  findUserById,
  createUser,
  updateUserField,
  deactivateUser
};