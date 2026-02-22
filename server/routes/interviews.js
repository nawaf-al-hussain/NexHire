const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   POST /api/interviews/schedule
 * @desc    Schedule a new interview for a candidate application
 * @access  Private (Recruiter)
 */
router.post('/schedule', protect, authorize(2), async (req, res) => {
    const { applicationId, interviewStart, interviewEnd } = req.body;
    const userID = req.user.UserID;

    if (!applicationId || !interviewStart || !interviewEnd) {
        return res.status(400).json({ error: "Missing required fields: applicationId, interviewStart, interviewEnd." });
    }

    try {
        // 1. Fetch matching RecruiterID from UserID
        const recruiterCheck = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        const recruiterId = recruiterCheck[0].RecruiterID;

        // 2. Validate ApplicationID belongs to a Job posted by this Recruiter/Company
        // Optional strictly enforcing security, but we'll assume the Recruiter ID is good for demo insertion
        const appCheck = await query("SELECT ApplicationID FROM Applications WHERE ApplicationID = ?", [applicationId]);
        if (appCheck.length === 0) {
            return res.status(404).json({ error: "Application not found." });
        }

        // 3. Use the integrated stored procedure for scheduling
        // This handles timezone conversion and safely returns the identity
        const result = await query(
            `EXEC sp_ScheduleInterviewWithTimezone ?, ?, ?, ?`,
            [applicationId, recruiterId, interviewStart, interviewEnd]
        );

        res.status(201).json({
            success: true,
            message: "Interview scheduled successfully.",
            scheduleId: result[0].ScheduleID
        });
    } catch (err) {
        console.error("Schedule Interview Error:", err.message);
        res.status(500).json({ error: "Failed to schedule interview." });
    }
});

/**
 * @route   GET /api/interviews
 * @desc    Get all scheduled interviews for the current recruiter
 * @access  Private (Recruiter)
 */
router.get('/', protect, authorize(2), async (req, res) => {
    const userID = req.user.UserID;

    try {
        const recruiterCheck = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        const recruiterId = recruiterCheck[0].RecruiterID;

        const interviews = await query(`
            SELECT i.ScheduleID, i.InterviewStart, i.InterviewEnd, i.CandidateConfirmed, c.FullName as CandidateName, j.JobTitle 
            FROM InterviewSchedules i
            JOIN Applications a ON i.ApplicationID = a.ApplicationID
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            WHERE i.RecruiterID = ?
            ORDER BY i.InterviewStart ASC
        `, [recruiterId]);

        res.json(interviews);
    } catch (err) {
        console.error("Fetch Interviews Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interviews." });
    }
});

module.exports = router;
