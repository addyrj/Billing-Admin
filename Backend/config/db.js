const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
async function testConnection() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.ping();
    console.log('✅ MySQL connection pool established');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

testConnection();

module.exports = pool;