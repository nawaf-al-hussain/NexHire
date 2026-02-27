const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   POST /api/maintenance/archive
 * @desc    Run the data archiving stored procedure
 * @access  Private (Admin Only)
 */
router.post('/archive', protect, authorize([1]), async (req, res) => {
    try {
        // First check if procedure exists
        const procCheck = await query(`
            SELECT 1 FROM sys.procedures WHERE name = 'sp_ArchiveOldData'
        `);

        if (procCheck.length === 0) {
            return res.status(400).json({ error: "Stored procedure sp_ArchiveOldData does not exist in database." });
        }

        await query("EXEC sp_ArchiveOldData");
        res.json({ message: "Archival process completed successfully." });
    } catch (err) {
        console.error("Archiving Error:", err.message);
        res.status(500).json({ error: "Failed to run archival process: " + err.message });
    }
});

/**
 * @route   POST /api/maintenance/anonymize
 * @desc    Run the PII anonymization stored procedure
 * @access  Private (Admin Only)
 */
router.post('/anonymize', protect, authorize([1]), async (req, res) => {
    try {
        await query("EXEC sp_AnonymizeArchivedCandidates");
        res.json({ message: "PII anonymization completed successfully." });
    } catch (err) {
        console.error("Anonymization Error:", err.message);
        res.status(500).json({ error: "Failed to run anonymization process." });
    }
});

/**
 * @route   POST /api/maintenance/consent-check
 * @desc    Run the GDPR consent expiry stored procedure
 * @access  Private (Admin Only)
 */
router.post('/consent-check', protect, authorize([1]), async (req, res) => {
    try {
        await query("EXEC sp_CheckConsentExpiry");
        res.json({ message: "Consent expiry check completed successfully." });
    } catch (err) {
        console.error("Consent Check Error:", err.message);
        res.status(500).json({ error: "Failed to run consent check." });
    }
});

/**
 * @route   GET /api/maintenance/archive-stats
 * @desc    Get counts from archive tables
 * @access  Private (Admin Only)
 */
router.get('/archive-stats', protect, authorize([1]), async (req, res) => {
    try {
        // Check if tables exist first
        const tablesExist = await query(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_NAME IN ('JobPostingsArchive', 'ApplicationsArchive')
        `);

        const tableNames = tablesExist.map(t => t.TABLE_NAME);
        const hasJobsArchive = tableNames.includes('JobPostingsArchive');
        const hasAppsArchive = tableNames.includes('ApplicationsArchive');

        let archivedJobs = 0;
        let archivedApplications = 0;

        if (hasJobsArchive) {
            const jobsResult = await query("SELECT COUNT(*) as total FROM JobPostingsArchive");
            archivedJobs = jobsResult[0].total;
        }

        if (hasAppsArchive) {
            const appsResult = await query("SELECT COUNT(*) as total FROM ApplicationsArchive");
            archivedApplications = appsResult[0].total;
        }

        res.json({
            archivedJobs,
            archivedApplications,
            hasJobsArchive,
            hasAppsArchive,
            lastUpdated: new Date()
        });
    } catch (err) {
        console.error("Archive Stats Error:", err.message);
        res.status(500).json({ error: "Failed to fetch archive statistics: " + err.message });
    }
});

/**
 * @route   GET /api/maintenance/archive-jobs
 * @desc    Get data from JobPostingsArchive
 * @access  Private (Admin Only)
 */
router.get('/archive-jobs', protect, authorize([1]), async (req, res) => {
    try {
        // Check if table exists
        const tableCheck = await query(`
            SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'JobPostingsArchive'
        `);

        if (tableCheck.length === 0) {
            return res.json([]); // Return empty array if table doesn't exist
        }

        const archivedJobs = await query("SELECT TOP 50 * FROM JobPostingsArchive ORDER BY ArchivedAt DESC");
        res.json(archivedJobs);
    } catch (err) {
        console.error("Archive Jobs Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch archived jobs: " + err.message });
    }
});

/**
 * @route   GET /api/maintenance/archive-applications
 * @desc    Get data from ApplicationsArchive with candidate and job details
 * @access  Private (Admin Only)
 * 
 * NOTE: The ApplicationsArchive table stores: ApplicationID, CandidateID, JobID, StatusID, AppliedDate, ArchivedAt
 * Candidate info (FullName, Email, LinkedInURL) comes from LEFT JOIN to Candidates table.
 * If sp_AnonymizeArchivedCandidates was run, candidate data will be NULL.
 */
router.get('/archive-applications', protect, authorize([1]), async (req, res) => {
    try {
        // Simple query without joins first - just check if table exists and has data
        let archivedApps;

        try {
            archivedApps = await query(`
                SELECT TOP 50 
                    aa.ApplicationID,
                    aa.CandidateID,
                    aa.JobID,
                    aa.StatusID,
                    aa.AppliedDate,
                    aa.ArchivedAt
                FROM ApplicationsArchive aa
                ORDER BY aa.ArchivedAt DESC
            `);
        } catch (tableErr) {
            // Table doesn't exist or other error
            console.log("Archive table query error:", tableErr.message);
            return res.json([]);
        }

        if (archivedApps.length === 0) {
            return res.json([]);
        }

        // Now try to enrich with job and status info
        try {
            const jobIds = archivedApps.map(a => a.JobID).filter(id => id);
            const statusIds = archivedApps.map(a => a.StatusID).filter(id => id);

            let jobMap = {};
            let statusMap = {};

            if (jobIds.length > 0) {
                const jobs = await query(`
                    SELECT JobID, JobTitle FROM JobPostings 
                    WHERE JobID IN (${jobIds.join(',')})
                `);
                jobs.forEach(j => { jobMap[j.JobID] = j.JobTitle; });
            }

            if (statusIds.length > 0) {
                const statuses = await query(`
                    SELECT StatusID, StatusName FROM ApplicationStatus 
                    WHERE StatusID IN (${statusIds.join(',')})
                `);
                statuses.forEach(s => { statusMap[s.StatusID] = s.StatusName; });
            }

            // Add job title and status name to results
            archivedApps = archivedApps.map(app => ({
                ...app,
                JobTitle: jobMap[app.JobID] || null,
                StatusName: statusMap[app.StatusID] || null
            }));
        } catch (enrichErr) {
            console.log("Enrichment error:", enrichErr.message);
            // Continue with basic data
        }

        res.json(archivedApps);
    } catch (err) {
        console.error("Archive Apps Fetch Error:", err.message);
        res.json([]); // Return empty instead of 500 to prevent UI errors
    }
});

/**
 * @route   GET /api/maintenance/email-queue
 * @desc    Get email queue with filters
 * @access  Private (Admin Only)
 * 
 * EmailQueue columns: EmailID, CandidateID, EmailType, Subject, Body, IsSent
 */
router.get('/email-queue', protect, authorize(1), async (req, res) => {
    const { status, type, limit } = req.query;

    try {
        let queryStr = `
            SELECT e.EmailID, e.CandidateID, c.FullName as CandidateName, 
                   e.EmailType, e.Subject, e.Body, e.IsSent, e.CreatedAt, e.SentAt
            FROM EmailQueue e
            LEFT JOIN Candidates c ON e.CandidateID = c.CandidateID
            WHERE 1=1
        `;
        const params = [];

        if (status === 'sent') {
            queryStr += ` AND e.IsSent = 1`;
        } else if (status === 'pending') {
            queryStr += ` AND e.IsSent = 0`;
        }

        if (type) {
            queryStr += ` AND e.EmailType = ?`;
            params.push(type);
        }

        queryStr += ` ORDER BY e.CreatedAt DESC`;

        if (limit) {
            // Replace the initial SELECT with SELECT TOP n
            queryStr = queryStr.replace(/^SELECT /i, `SELECT TOP ${parseInt(limit)} `);
        }

        const emails = await query(queryStr, params);

        // Get stats
        const stats = await query(`
            SELECT 
                COUNT(*) as Total,
                SUM(CASE WHEN IsSent = 1 THEN 1 ELSE 0 END) as Sent,
                SUM(CASE WHEN IsSent = 0 THEN 1 ELSE 0 END) as Pending
            FROM EmailQueue
        `);

        res.json({ emails, stats: stats[0] });
    } catch (err) {
        console.error("Email Queue Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch email queue." });
    }
});

/**
 * @route   PUT /api/maintenance/email-queue/:id/retry
 * @desc    Retry sending a failed email
 * @access  Private (Admin Only)
 */
router.put('/email-queue/:id/retry', protect, authorize(1), async (req, res) => {
    const { id } = req.params;

    try {
        // Reset IsSent to 0 to allow retry
        await query(`
            UPDATE EmailQueue 
            SET IsSent = 0, CreatedAt = GETDATE()
            WHERE EmailID = ? AND IsSent = 0
        `, [id]);

        res.json({ message: "Email queued for retry." });
    } catch (err) {
        console.error("Email Retry Error:", err.message);
        res.status(500).json({ error: "Failed to retry email." });
    }
});

/**
 * @route   DELETE /api/maintenance/email-queue/:id
 * @desc    Delete an email from queue
 * @access  Private (Admin Only)
 */
router.delete('/email-queue/:id', protect, authorize(1), async (req, res) => {
    const { id } = req.params;

    try {
        await query(`DELETE FROM EmailQueue WHERE EmailID = ?`, [id]);
        res.json({ message: "Email deleted from queue." });
    } catch (err) {
        console.error("Email Delete Error:", err.message);
        res.status(500).json({ error: "Failed to delete email." });
    }
});

/**
 * @route   POST /api/maintenance/email-queue/send-test
 * @desc    Send a test email (for debugging)
 * @access  Private (Admin Only)
 */
router.post('/email-queue/send-test', protect, authorize(1), async (req, res) => {
    const { candidateId, emailType, subject, body } = req.body;

    try {
        // Insert into queue for processing
        await query(`
            INSERT INTO EmailQueue (CandidateID, EmailType, Subject, Body, IsSent)
            VALUES (?, ?, ?, ?, 0)
        `, [candidateId, emailType || 'Test', subject || 'Test Email', body || 'This is a test email.']);

        res.json({ message: "Test email added to queue." });
    } catch (err) {
        console.error("Test Email Error:", err.message);
        res.status(500).json({ error: "Failed to queue test email." });
    }
});

module.exports = router;
