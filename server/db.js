const { Pool } = require("pg");
require('dotenv').config();

const connectionString = process.env.DB_CONNECTION_STRING;

// Use pool for better performance and connection management
const pool = new Pool({
    connectionString: connectionString,
    ssl: {
        rejectUnauthorized: false // Required for some Neon connections, adjust as needed
    }
});

/**
 * Executes a SQL query with optional parameters.
 * Handles both SQL Server (?) and PostgreSQL ($1, $2) parameter styles
 * to maintain compatibility during migration.
 * @param {string} sqlQuery - The SQL query string.
 * @param {Array} params - Optional parameters for the query.
 * @returns {Promise<Array>} - Resolves with the result rows.
 */
const query = async (sqlQuery, params = []) => {
    let client;
    try {
        client = await pool.connect();
        
        // Convert '?' parameters to '$1, $2, ...' if needed for PG
        // This is a simple conversion for legacy SQL Server queries
        let pgQuery = sqlQuery;
        let paramCount = 1;
        while (pgQuery.includes('?')) {
            pgQuery = pgQuery.replace('?', `$${paramCount++}`);
        }

        const result = await client.query(pgQuery, params);
        
        // Alias support for frontend compatibility
        // Automatically maps lowercase keys to PascalCase for common fields
        const processedRows = result.rows.map(row => {
            const aliasedRow = { ...row };
            
            // Comprehensive ID and descriptive field mappings
            const mappings = {
                // IDs
                'userid': 'UserID',
                'roleid': 'RoleID',
                'jobid': 'JobID',
                'applicationid': 'ApplicationID',
                'candidateid': 'CandidateID',
                'statusid': 'StatusID',
                'interviewid': 'InterviewID',
                'assessmentid': 'AssessmentID',
                'skillid': 'SkillID',
                'auditid': 'AuditID',
                'recordid': 'RecordID',
                'consentid': 'ConsentID',

                // Common Descriptive Fields
                'jobtitle': 'JobTitle',
                'location': 'Location',
                'description': 'Description',
                'fullname': 'FullName',
                'candidatename': 'CandidateName',
                'username': 'UserName',
                'email': 'Email',
                'statusname': 'StatusName',
                'rolename': 'RoleName',
                'minexperience': 'MinExperience',
                'vacancies': 'Vacancies',
                'salarymin': 'SalaryMin',
                'salarymax': 'SalaryMax',
                'minsalary': 'MinSalary',
                'maxsalary': 'MaxSalary',
                'applieddate': 'AppliedDate',
                'createdat': 'CreatedAt',
                'updatedat': 'UpdatedAt',
                'isactive': 'IsActive',
                'isdeleted': 'IsDeleted',
                'ismandatory': 'IsMandatory',
                'minproficiency': 'MinProficiency',
                'skillname': 'SkillName',
                'matchedskillscount': 'MatchedSkillsCount',
                'totalmatchscore': 'TotalMatchScore',
                'engagementrate': 'EngagementRate',
                'hireratepercent': 'HireRatePercent',
                'skillgap': 'SkillGap',
                'avgscoregiven': 'AvgScoreGiven',
                'scorevariance': 'ScoreVariance',
                'rejectionreason': 'RejectionReason',
                'rejectioncount': 'RejectionCount',
                'rejectionpercent': 'RejectionPercent'
            };

            Object.keys(mappings).forEach(lowerKey => {
                if (row[lowerKey] !== undefined && row[mappings[lowerKey]] === undefined) {
                    aliasedRow[mappings[lowerKey]] = row[lowerKey];
                }
            });

            return aliasedRow;
        });

        return processedRows;
    } catch (err) {
        console.error("Database Query Error:", err.message);
        console.error("SQL:", sqlQuery);
        throw err;
    } finally {
        if (client) client.release();
    }
};

const connectDB = async () => {
    try {
        console.log("Connecting to Neon PostgreSQL...");
        // Running a simple query to verify connection
        await query("SELECT 1 as result");
        console.log("✅ Successfully connected to Neon PostgreSQL!");
        return true;
    } catch (err) {
        console.error("❌ Neon PostgreSQL connection failed!");
        console.error(err.message);
        throw err;
    }
};

module.exports = { query, connectDB, pool };
