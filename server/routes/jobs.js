const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/jobs
 * @desc    Get all active job postings for recruiters
 * @access  Private (Recruiter)
 */
router.get('/', protect, authorize(2), async (req, res) => {
    try {
        // Using the view for vacancy utilization
        const jobs = await query(
            "SELECT * FROM vw_VacancyUtilization ORDER BY JobID DESC"
        );
        res.json(jobs);
    } catch (err) {
        console.error("Fetch Jobs Error:", err.message);
        res.status(500).json({ error: "Failed to fetch job postings." });
    }
});

/**
 * @route   POST /api/jobs
 * @desc    Create a new job posting with skills
 * @access  Private (Recruiter)
 */
router.post('/', protect, authorize(2), async (req, res) => {
    const { title, description, location, minExperience, vacancies, skills } = req.body;
    const recruiterUserID = req.user.UserID;

    if (!title || !vacancies) {
        return res.status(400).json({ error: "Title and vacancies are required." });
    }

    try {
        // Use OUTPUT INSERTED.JobID for more reliable identity retrieval across all drivers
        const result = await query(
            "INSERT INTO JobPostings (JobTitle, Description, Location, MinExperience, Vacancies, CreatedBy) " +
            "OUTPUT INSERTED.JobID as id " +
            "VALUES (?, ?, ?, ?, ?, ?)",
            [title, description, location, minExperience || 0, vacancies, recruiterUserID]
        );

        if (!result || result.length === 0) {
            throw new Error("Failed to retrieve new Job ID after insertion.");
        }

        const jobID = result[0].id;

        // Insert Skills if provided
        if (skills && Array.isArray(skills)) {
            for (const skill of skills) {
                // skill: { id: 1, isMandatory: 1, minProficiency: 5 }
                await query(
                    "INSERT INTO JobSkills (JobID, SkillID, IsMandatory, MinProficiency) VALUES (?, ?, ?, ?)",
                    [jobID, skill.id, skill.isMandatory ? 1 : 0, skill.minProficiency || 1]
                );
            }
        }

        res.status(201).json({ message: "Job posting created successfully.", jobID });
    } catch (err) {
        console.error("Create Job Error:", err.message);
        console.error("Stack Trace:", err.stack);
        res.status(500).json({ error: `Database Error: ${err.message}` });
    }
});

/**
 * @route   GET /api/jobs/:id
 * @desc    Get job details and required skills
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const job = await query("SELECT * FROM JobPostings WHERE JobID = ?", [req.params.id]);

        if (job.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        const skills = await query(
            "SELECT js.*, s.SkillName FROM JobSkills js JOIN Skills s ON js.SkillID = s.SkillID WHERE js.JobID = ?",
            [req.params.id]
        );

        res.json({ ...job[0], skills });
    } catch (err) {
        console.error("Get Job Detail Error:", err.message);
        res.status(500).json({ error: "Server error fetching job details." });
    }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Soft delete a job posting
 * @access  Private (Recruiter)
 */
router.delete('/:id', protect, authorize(2), async (req, res) => {
    try {
        await query("UPDATE JobPostings SET IsDeleted = 1, IsActive = 0 WHERE JobID = ?", [req.params.id]);
        res.json({ message: "Job posting deleted (archived)." });
    } catch (err) {
        console.error("Delete Job Error:", err.message);
        res.status(500).json({ error: "Failed to delete job posting." });
    }
});

/**
 * @route   GET /api/jobs/:id/matches
 * @desc    Get ranked candidate matches for a job using the advanced matching engine
 * @access  Private (Recruiter)
 */
router.get('/:id/matches', protect, authorize(2), async (req, res) => {
    try {
        const topN = req.query.topN || 10;

        // Execute the advanced matching stored procedure
        const matches = await query(
            "EXEC sp_AdvancedCandidateMatchingEnhanced @JobID = ?, @TopN = ?",
            [req.params.id, topN]
        );

        res.json(matches);
    } catch (err) {
        console.error("Matching Engine Error:", err.message);
        res.status(500).json({ error: "Matching engine execution failed." });
    }
});

/**
 * @route   GET /api/jobs/:id/applications
 * @desc    Get all applications for a specific job posting
 * @access  Private (Recruiter)
 */
router.get('/:id/applications', protect, authorize(2), async (req, res) => {
    try {
        const applications = await query(
            "SELECT a.*, c.FullName, c.Location as CandidateLocation, " +
            "s.StatusName, v.TotalMatchScore as MatchScore " +
            "FROM Applications a " +
            "JOIN Candidates c ON a.CandidateID = c.CandidateID " +
            "JOIN ApplicationStatus s ON a.StatusID = s.StatusID " +
            "LEFT JOIN vw_CandidateMatchScore v ON a.ApplicationID = v.ApplicationID " +
            "WHERE a.JobID = ? AND a.IsDeleted = 0 " +
            "ORDER BY a.AppliedDate DESC",
            [req.params.id]
        );
        res.json(applications);
    } catch (err) {
        console.error("Fetch Job Applications Error:", err.message);
        res.status(500).json({ error: "Failed to fetch job applications." });
    }
});

module.exports = router;
