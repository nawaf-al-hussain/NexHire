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
    const { statusID, notes, rejectionReason } = req.body;
    const recruiterUserID = req.user.UserID;

    if (!statusID) {
        return res.status(400).json({ error: "New Status ID is required." });
    }

    try {
        await query(
            "EXEC sp_UpdateApplicationStatus @ApplicationID = ?, @NewStatusID = ?, @ChangedBy = ?, @Notes = ?, @RejectionReason = ?",
            [req.params.id, statusID, recruiterUserID, notes || 'Status updated via recruiter panel', rejectionReason || null]
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

/**
 * @route   POST /api/applications/auto-reject
 * @desc    Run auto-reject batch process for unqualified candidates
 * @access  Private (Recruiter)
 */
router.post('/auto-reject', protect, authorize(2), async (req, res) => {
    try {
        const result = await query("EXEC sp_AutoRejectUnqualified");
        res.json({
            success: true,
            message: "Auto-reject batch completed.",
            result: result
        });
    } catch (err) {
        console.error("Auto-Reject Error:", err.message);
        res.status(500).json({ error: "Failed to run auto-reject process." });
    }
});

/**
 * @route   GET /api/applications/auto-rejected
 * @desc    Get list of auto-rejected applications
 * @access  Private (Recruiter)
 */
router.get('/auto-rejected', protect, authorize(2), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                a.ApplicationID,
                a.AppliedDate,
                a.RejectionReason,
                c.FullName AS CandidateName,
                c.YearsOfExperience AS CandidateExperience,
                j.JobTitle,
                j.MinExperience AS RequiredExperience
            FROM Applications a
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            JOIN ApplicationStatus s ON a.StatusID = s.StatusID
            WHERE s.StatusName = 'Rejected' 
            AND a.RejectionReason LIKE '%Auto-Rejected%'
            AND a.IsDeleted = 0
            ORDER BY a.AppliedDate DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Auto-Rejected List Error:", err.message);
        res.status(500).json({ error: "Failed to fetch auto-rejected applications." });
    }
});

module.exports = router;
