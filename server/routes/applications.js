const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   PUT /api/applications/:id/status
 * @desc    Update application status (Screening, Interview, Rejected, etc.)
 * @access  Private (Recruiter)
 */
router.put('/:id/status', protect, authorize(2), async (req, res) => {
    const { statusID, notes } = req.body;
    const recruiterUserID = req.user.UserID;

    if (!statusID) {
        return res.status(400).json({ error: "New Status ID is required." });
    }

    try {
        await query(
            "EXEC sp_UpdateApplicationStatus @ApplicationID = ?, @NewStatusID = ?, @ChangedBy = ?, @Notes = ?",
            [req.params.id, statusID, recruiterUserID, notes || 'Status updated via recruiter panel']
        );
        res.json({ message: "Application status updated successfully." });
    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to update application status." });
    }
});

/**
 * @route   POST /api/applications/:id/hire
 * @desc    Hire a candidate (concurrency-safe)
 * @access  Private (Recruiter)
 */
router.post('/:id/hire', protect, authorize(2), async (req, res) => {
    const recruiterUserID = req.user.UserID;

    try {
        // Need to find the RecruiterID from UserID
        const recruiter = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [recruiterUserID]);

        if (recruiter.length === 0) {
            return res.status(403).json({ error: "Unauthorized: Not a registered recruiter." });
        }

        const recruiterID = recruiter[0].RecruiterID;

        await query(
            "EXEC sp_HireCandidate @ApplicationID = ?, @RecruiterID = ?",
            [req.params.id, recruiterID]
        );
        res.json({ message: "Candidate hired successfully! Vacancy count adjusted." });
    } catch (err) {
        console.error("Hire Candidate Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to finalize hire." });
    }
});

/**
 * @route   GET /api/applications/:id/history
 * @desc    Get status transition history for an application
 * @access  Private
 */
router.get('/:id/history', protect, async (req, res) => {
    try {
        const history = await query(
            "SELECT h.*, s1.StatusName as FromStatus, s2.StatusName as ToStatus, u.Username as ChangedByLabel " +
            "FROM ApplicationStatusHistory h " +
            "JOIN ApplicationStatus s1 ON h.FromStatusID = s1.StatusID " +
            "JOIN ApplicationStatus s2 ON h.ToStatusID = s2.StatusID " +
            "JOIN Users u ON h.ChangedBy = u.UserID " +
            "WHERE h.ApplicationID = ? " +
            "ORDER BY h.ChangedAt DESC",
            [req.params.id]
        );
        res.json(history);
    } catch (err) {
        console.error("Fetch History Error:", err.message);
        res.status(500).json({ error: "Failed to fetch application history." });
    }
});

module.exports = router;
