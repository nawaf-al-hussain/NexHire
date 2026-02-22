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
        await query("EXEC sp_ArchiveOldData");
        res.json({ message: "Archival process completed successfully." });
    } catch (err) {
        console.error("Archiving Error:", err.message);
        res.status(500).json({ error: "Failed to run archival process." });
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
        const [jobsResult, appsResult] = await Promise.all([
            query("SELECT COUNT(*) as total FROM JobPostingsArchive"),
            query("SELECT COUNT(*) as total FROM ApplicationsArchive")
        ]);

        res.json({
            archivedJobs: jobsResult[0].total,
            archivedApplications: appsResult[0].total,
            lastUpdated: new Date()
        });
    } catch (err) {
        console.error("Archive Stats Error:", err.message);
        res.status(500).json({ error: "Failed to fetch archive statistics." });
    }
});

/**
 * @route   GET /api/maintenance/archive-jobs
 * @desc    Get data from JobPostingsArchive
 * @access  Private (Admin Only)
 */
router.get('/archive-jobs', protect, authorize([1]), async (req, res) => {
    try {
        const archivedJobs = await query("SELECT TOP 50 * FROM JobPostingsArchive ORDER BY ArchivedAt DESC");
        res.json(archivedJobs);
    } catch (err) {
        console.error("Archive Jobs Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch archived jobs." });
    }
});

/**
 * @route   GET /api/maintenance/archive-applications
 * @desc    Get data from ApplicationsArchive
 * @access  Private (Admin Only)
 */
router.get('/archive-applications', protect, authorize([1]), async (req, res) => {
    try {
        const archivedApps = await query("SELECT TOP 50 * FROM ApplicationsArchive ORDER BY ArchivedAt DESC");
        res.json(archivedApps);
    } catch (err) {
        console.error("Archive Apps Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch archived applications." });
    }
});

module.exports = router;
