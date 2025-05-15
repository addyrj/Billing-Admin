const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const {
  findUserByEmail,
  findUserByMobile,
  findUserById,
  createUser
} = require("../models/authModel");
const {
  registerValidation,
  loginValidation,
  updateValidation
} = require("../validations/authValidation");

// Register Superadmin (Initial Setup)
const registerSuperadmin = async (req, res) => {
  try {
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, mobile, password } = req.body;

    const [existingEmail] = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const [existingMobile] = await findUserByMobile(mobile);
    if (existingMobile) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }

    const [role] = await pool.query('SELECT id FROM roles WHERE name = ?', ['superadmin']);
    if (!role[0]) {
      return res.status(500).json({ error: "Superadmin role not found" });
    }

    await createUser(name, email, mobile, password, role[0].id, null);
    return res.status(201).json({ message: "Superadmin registered successfully" });

  } catch (err) {
    console.error("Superadmin registration error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

// Create Admin (Sales or Purchase)
// Create Admin (Sales or Purchase)
const createAdmin = async (req, res) => {
  try {
    // Validate input using your existing Joi schema
    const { error } = registerValidation(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        details: error.details.map(d => d.message)
      });
    }

    const { name, email, mobile, password, role } = req.body;

    // Verify superadmin permissions
    const [requestingUser] = await findUserById(req.user.id);
    if (!requestingUser || requestingUser.role_id !== 1) {
      return res.status(403).json({ 
        error: "Only superadmin can create admins",
        code: "FORBIDDEN"
      });
    }

    // Check for existing email
    const [existingEmail] = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ 
        error: "Email already exists",
        code: "EMAIL_EXISTS"
      });
    }

    // Check for existing mobile
    const [existingMobile] = await findUserByMobile(mobile);
    if (existingMobile) {
      return res.status(409).json({ 
        error: "Mobile number already exists",
        code: "MOBILE_EXISTS"
      });
    }

    // Get role ID (using your existing role validation)
    const [roleData] = await pool.query(
      'SELECT id FROM roles WHERE name = ?', 
      [role]
    );
    
    if (!roleData[0]) {
      return res.status(500).json({ 
        error: "Role configuration error",
        details: `Role '${role}' not found in database`
      });
    }

    // Create admin user
    await createUser(
      name, 
      email, 
      mobile, 
      password, 
      roleData[0].id, 
      req.user.id
    );

    return res.status(201).json({ 
      success: true,
      message: `${role} admin created successfully`,
      admin: { 
        name, 
        email, 
        mobile,
        role,
        created_by: requestingUser.username 
      }
    });

  } catch (err) {
    console.error("Admin creation error:", err);
    
    // Handle specific database errors
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: "Duplicate entry",
        details: "User with similar credentials already exists"
      });
    }
    
    return res.status(500).json({
      error: "Admin creation failed",
      details: process.env.NODE_ENV === 'development' ? {
        message: err.message,
        stack: err.stack
      } : undefined,
      code: "INTERNAL_ERROR"
    });
  }
};

// Create User (Sales or Purchase)
const createUserByAdmin = async (req, res) => {
  try {
    // Validate input
    const { error } = registerValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, mobile, password, role } = req.body;
    const { role_id } = req.user;

    // Verify admin permissions
    if (role_id === 2 && role !== 'salesuser') {
      return res.status(403).json({ 
        error: "Admin sales can only create sales users" 
      });
    }

    if (role_id === 3 && role !== 'purchaseuser') {
      return res.status(403).json({ 
        error: "Admin purchase can only create purchase users" 
      });
    }

    // Check for existing users
    const [existingEmail] = await pool.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const [existingMobile] = await pool.query(
      'SELECT id FROM users WHERE mobile = ?', 
      [mobile]
    );
    if (existingMobile.length > 0) {
      return res.status(400).json({ error: "Mobile number already exists" });
    }

    // FIXED: Proper role ID query
    const [roleData] = await pool.query(
      'SELECT id FROM roles WHERE name = ? LIMIT 1', 
      [role.toLowerCase()] // Ensure case consistency
    );

    if (!roleData || roleData.length === 0) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      `INSERT INTO users 
       (username, email, mobile, password, role_id, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, mobile, hashedPassword, roleData[0].id, req.user.id]
    );

    return res.status(201).json({ 
      message: `${role} user created successfully`,
      user: { name, email, mobile, role }
    });

  } catch (err) {
    console.error("User creation error:", err);
    
    if (err.code === 'ER_PARSE_ERROR') {
      // Log the exact SQL query that failed
      console.error("Failed SQL query:", err.sql);
      return res.status(500).json({ 
        error: "Database query error",
        details: err.sqlMessage 
      });
    }
    
    return res.status(500).json({ 
      error: "Failed to create user. Please try again." 
    });
  }
};
// Login with email, mobile, or user_id
const login = async (req, res) => {
  try {
    const { error } = loginValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { user_id, password } = req.body;
    let user;

    if (typeof user_id === 'number') {
      [user] = await findUserById(user_id);
    } else if (user_id.includes('@')) {
      [user] = await findUserByEmail(user_id);
    } else {
      [user] = await findUserByMobile(user_id);
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Get role name
  
    const [role] = await pool.query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    if (!role[0]) {
        return res.status(500).json({ error: "Role not found for user." });
    }

    // Normalize role name to lowercase
    const roleName = role[0].name.toLowerCase();

    const token = jwt.sign(
        { 
            id: user.id, 
            role_id: user.role_id,
            role: roleName // Use normalized role name
        },
        process.env.JWT_SECRET,
        { expiresIn: "15d" }
    );

    return res.json({ 
        message: "Login successful", 
        token, 
        role: roleName,
        user: {
            id: user.id,
            name: user.username,
            email: user.email,
            mobile: user.mobile
        }
    });
} catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
}
};
// Get all users (for superadmin only)
const getAllUsers = async (req, res) => {
  try {
    const [user] = await findUserById(req.user.id);
    if (!user || user.role_id !== 1) {
      return res.status(403).json({ error: "Only superadmin can view all users" });
    }

    const [users] = await pool.query(`
      SELECT u.id, u.username, u.email, u.mobile, r.name as role, 
             creator.username as created_by, u.created_at 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN users creator ON u.created_by = creator.id
    `);
    
    return res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};

// Update user information
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = updateValidation(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // Explicitly reject username/name updates
    if (req.body.username || req.body.name) {
      return res.status(400).json({ 
        error: "Username/name cannot be updated" 
      });
    }

    const { email, mobile, password } = req.body;
    const [currentUser] = await findUserById(id);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // ... (keep your existing authorization logic) ...

    // Validate field uniqueness
    const updatePayload = {};
    const updatedFields = [];
    
    if (email && email !== currentUser.email) {
      const [emailCheck] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?', 
        [email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(400).json({ error: "Email already in use" });
      }
      updatePayload.email = email;
      updatedFields.push('email');
    }

    if (mobile && mobile !== currentUser.mobile) {
      const [mobileCheck] = await pool.query(
        'SELECT id FROM users WHERE mobile = ? AND id != ?', 
        [mobile, id]
      );
      if (mobileCheck.length > 0) {
        return res.status(400).json({ error: "Mobile number already in use" });
      }
      updatePayload.mobile = mobile;
      updatedFields.push('mobile');
    }

    if (password) {
      updatePayload.password = await bcrypt.hash(password, 10);
      updatedFields.push('password');
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({ error: "No valid fields provided for update" });
    }

    // Build dynamic update query
    const setClause = updatedFields.map(field => `${field} = ?`).join(', ');
    const values = updatedFields.map(field => updatePayload[field]);
    values.push(id);

    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    return res.json({ 
      message: "User updated successfully",
      updatedFields: updatedFields
    });

  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ 
      error: "Failed to update user",
      details: err.message 
    });
  }
};


// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [requestingUser] = await findUserById(req.user.id);
    const [user] = await findUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Authorization check
    if (requestingUser.role_id !== 1 && requestingUser.id !== parseInt(id)) {
      return res.status(403).json({ error: "Unauthorized to view this user" });
    }

    const [role] = await pool.query('SELECT name FROM roles WHERE id = ?', [user.role_id]);

    return res.json({
      id: user.id,
      name: user.username,
      email: user.email,
      mobile: user.mobile,
      role: role[0].name,
      created_at: user.created_at
    });

  } catch (err) {
    console.error("Get user by ID error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
// Get all admins by type (for superadmin)
const getAllAdmins = async (req, res) => {
  try {
    const [admins] = await pool.query(`
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.mobile, 
        r.name as role,
        u.created_at 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name IN ('adminsales', 'adminpurchase')
      ORDER BY r.name, u.created_at
    `);
    
    return res.json(admins);
  } catch (err) {
    console.error("Get all admins error:", err);
    return res.status(500).json({ error: "Failed to fetch admins" });
  }
};

// New getAdminById controller
const getAdminById = async (req, res) => {
  try {
    const [admin] = await pool.query(`
      SELECT u.*, r.name as role 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ? AND r.name LIKE 'admin%'
    `, [req.params.id]);
    
    if (!admin) return res.status(404).json({ error: "Admin not found" });
    return res.json(admin);
  } catch (err) {
    // error handling
  }
};
// Update admin by type and ID
const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id; // Get ID from URL params

    if (!adminId) {
      return res.status(400).json({ 
        error: "Admin ID is required",
        code: "MISSING_ID"
      });
    }

    // Verify superadmin permissions
    const [requestingUser] = await findUserById(req.user.id);
    if (!requestingUser || requestingUser.role_id !== 1) {
      return res.status(403).json({ 
        error: "Only superadmin can update admins",
        code: "FORBIDDEN"
      });
    }

    // Validate input
    const { error } = updateValidation(req.body);
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message,
        details: error.details
      });
    }

    // Get the target admin
    const [admin] = await findUserById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        error: "Admin not found",
        code: "ADMIN_NOT_FOUND"
      });
    }

    // Verify admin role
    const [role] = await pool.query('SELECT name FROM roles WHERE id = ?', [admin.role_id]);
    if (!role || !role[0] || !['adminsales', 'adminpurchase'].includes(role[0].name)) {
      return res.status(400).json({ 
        error: "Target user is not an admin",
        code: "NOT_AN_ADMIN"
      });
    }

    // Prepare update fields
    const { email, mobile, password } = req.body;
    const updateFields = {};
    const updatedFields = [];

    if (email && email !== admin.email) {
      // Check if email already exists
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, adminId]);
      if (existing.length > 0) {
        return res.status(400).json({ 
          error: "Email already in use",
          code: "EMAIL_EXISTS"
        });
      }
      updateFields.email = email;
      updatedFields.push('email');
    }

    if (mobile && mobile !== admin.mobile) {
      // Check if mobile already exists
      const [existing] = await pool.query('SELECT id FROM users WHERE mobile = ? AND id != ?', [mobile, adminId]);
      if (existing.length > 0) {
        return res.status(400).json({ 
          error: "Mobile number already in use",
          code: "MOBILE_EXISTS"
        });
      }
      updateFields.mobile = mobile;
      updatedFields.push('mobile');
    }

    if (password) {
      updateFields.password = await bcrypt.hash(password, 10);
      updatedFields.push('password');
    }

    if (updatedFields.length === 0) {
      return res.status(400).json({ 
        error: "No valid fields provided for update",
        code: "NO_UPDATES"
      });
    }

    // Build and execute update query
    const setClause = updatedFields.map(field => `${field} = ?`).join(', ');
    const values = updatedFields.map(field => updateFields[field]);
    values.push(adminId);

    await pool.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    // Get updated admin data
    const [updatedAdmin] = await findUserById(adminId);
    const [adminRole] = await pool.query('SELECT name FROM roles WHERE id = ?', [updatedAdmin.role_id]);

    return res.json({ 
      success: true,
      message: "Admin updated successfully",
      data: {
        id: updatedAdmin.id,
        name: updatedAdmin.username,
        email: updatedAdmin.email,
        mobile: updatedAdmin.mobile,
        role: adminRole[0].name,
        updatedFields: updatedFields
      }
    });

  } catch (err) {
    console.error("Update admin error:", err);
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

const deactivateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id;

    if (!adminId) {
      return res.status(400).json({ 
        error: "Admin ID is required",
        code: "MISSING_ID"
      });
    }

    // Verify superadmin permissions
    const [requestingUser] = await findUserById(req.user.id);
    if (!requestingUser || requestingUser.role_id !== 1) {
      return res.status(403).json({ 
        error: "Only superadmin can deactivate admins",
        code: "FORBIDDEN"
      });
    }

    // Get the target admin
    const [admin] = await findUserById(adminId);
    if (!admin) {
      return res.status(404).json({ 
        error: "Admin not found",
        code: "ADMIN_NOT_FOUND"
      });
    }

    // Verify admin role
    const [role] = await pool.query('SELECT name FROM roles WHERE id = ?', [admin.role_id]);
    if (!role || !role[0] || !['adminsales', 'adminpurchase'].includes(role[0].name)) {
      return res.status(400).json({ 
        error: "Target user is not an admin",
        code: "NOT_AN_ADMIN"
      });
    }

    // Use the model function
    const result = await pool.query('DELETE FROM users WHERE id = ?', [adminId]);

    return res.json({ 
      success: true,
      message: "Admin deactivated successfully",
      data: {
        id: admin.id,
        name: admin.username,
        email: admin.email,
        role: role[0].name
      }
    });

  } catch (err) {
    console.error("Admin deactivation error:", err);
    return res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Get all sales users (for admin sales)
const getAllSalesUsers = async (req, res) => {
  try {
    const [admin] = await findUserById(req.user.id);
    if (!admin || admin.role_id !== 2) {
      return res.status(403).json({ error: "Only admin sales can access this" });
    }

    const [users] = await pool.query(`
      SELECT u.id, u.username, u.email, u.mobile, u.created_at 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'salesuser' AND u.created_by = ?
    `, [req.user.id]);
    
    return res.json(users);
  } catch (err) {
    console.error("Get sales users error:", err);
    return res.status(500).json({ error: "Failed to fetch sales users" });
  }
};

// Get all purchase users (for admin purchase)
const getAllPurchaseUsers = async (req, res) => {
  try {
    const [admin] = await findUserById(req.user.id);
    if (!admin || admin.role_id !== 3) {
      return res.status(403).json({ error: "Only admin purchase can access this" });
    }

    const [users] = await pool.query(`
      SELECT u.id, u.username, u.email, u.mobile, u.created_at 
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE r.name = 'purchaseuser' AND u.created_by = ?
    `, [req.user.id]);
    
    return res.json(users);
  } catch (err) {
    console.error("Get purchase users error:", err);
    return res.status(500).json({ error: "Failed to fetch purchase users" });
  }
};

// Get specific user by ID with role checking
const getUserWithRoleCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const [requestingUser] = await findUserById(req.user.id);
    const [user] = await findUserById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get role names for both users
    const [[requesterRole], [targetRole]] = await Promise.all([
      pool.query('SELECT name FROM roles WHERE id = ?', [requestingUser.role_id]),
      pool.query('SELECT name FROM roles WHERE id = ?', [user.role_id])
    ]);

    // Authorization logic
    if (requestingUser.role_id === 1) { // Superadmin can view anyone
      return res.json({
        id: user.id,
        name: user.username,
        email: user.email,
        mobile: user.mobile,
        role: targetRole[0].name,
        created_at: user.created_at
      });
    }

    if (requesterRole[0].name === 'adminsales' && targetRole[0].name === 'salesuser') {
      // Admin sales can view their sales users
      if (user.created_by === requestingUser.id) {
        return res.json({
          id: user.id,
          name: user.username,
          email: user.email,
          mobile: user.mobile,
          created_at: user.created_at
        });
      }
    }

    if (requesterRole[0].name === 'adminpurchase' && targetRole[0].name === 'purchaseuser') {
      // Admin purchase can view their purchase users
      if (user.created_by === requestingUser.id) {
        return res.json({
          id: user.id,
          name: user.username,
          email: user.email,
          mobile: user.mobile,
          created_at: user.created_at
        });
      }
    }

    return res.status(403).json({ error: "Unauthorized to view this user" });

  } catch (err) {
    console.error("Get user by ID error:", err);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};
const deactivateUser = async (req, res) => {
  try {
    // Get ID directly from params without destructuring
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ 
        error: "User ID is required",
        code: "MISSING_ID"
      });
    }

    const [currentUser] = await findUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Authorization checks
    const [requestingUser] = await findUserById(req.user.id);
    const [targetRole] = await pool.query('SELECT name FROM roles WHERE id = ?', [currentUser.role_id]);

    // Superadmin can delete any user
    if (requestingUser.role_id === 1) {
      const result = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
      return res.json({ 
        success: true,
        message: "User permanently deleted",
        deletedUser: {
          id: currentUser.id,
          name: currentUser.username,
          email: currentUser.email
        }
      });
    }
    // Admin sales can only delete their sales users
    else if (requestingUser.role_id === 2 && targetRole[0].name === 'salesuser' && currentUser.created_by === requestingUser.id) {
      const result = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
      return res.json({ 
        success: true,
        message: "Sales user permanently deleted" 
      });
    }
    // Admin purchase can only delete their purchase users
    else if (requestingUser.role_id === 3 && targetRole[0].name === 'purchaseuser' && currentUser.created_by === requestingUser.id) {
      const result = await pool.query('DELETE FROM users WHERE id = ?', [userId]);
      return res.json({ 
        success: true,
        message: "Purchase user permanently deleted" 
      });
    } else {
      return res.status(403).json({ 
        error: "Unauthorized to delete this user",
        code: "UNAUTHORIZED"
      });
    }
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ 
      error: "Failed to delete user",
      code: "DELETE_FAILED",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

module.exports = {
  registerSuperadmin,
  createAdmin,
  createUserByAdmin,
  login,
  getAllUsers,
  getAllAdmins, // Replace getAllAdminSales and getAllAdminPurchases
  updateUser,
  updateAdmin, // Add this
  deactivateUser,
  deactivateAdmin, // Add this
  getUserById,
  getUserWithRoleCheck,
  getAllPurchaseUsers,
  getAllSalesUsers,
  getAdminById
};
