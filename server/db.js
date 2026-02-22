const msnodesql = require("msnodesqlv8");
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

/**
 * Executes a SQL query with optional parameters.
 * @param {string} sqlQuery - The T-SQL query string.
 * @param {Array} params - Optional parameters for the query.
 * @returns {Promise<Array>} - Resolves with the result rows.
 */
const query = (sqlQuery, params = []) => {
    return new Promise((resolve, reject) => {
        msnodesql.query(connectionString, sqlQuery, params, (err, rows) => {
            if (err) {
                console.error("Database Query Error:", err.message);
                console.error("SQL:", sqlQuery);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

const connectDB = async () => {
    try {
        console.log("Connecting to SQL Server...");
        // Running a simple query to verify connection
        await query("SELECT 1 as result");
        console.log("✅ Successfully connected to SQL Server!");
        return true;
    } catch (err) {
        console.error("❌ SQL Server connection failed!");
        console.error(err.message);
        throw err;
    }
};

module.exports = { query, connectDB };
