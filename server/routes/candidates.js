const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/candidates/matches
 * @desc    Get matched jobs for the logged-in candidate (applied jobs with scores)
 * @access  Private (Candidate)
 */
router.get('/matches', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const matches = await query(
            "SELECT v.*, j.Location, j.MinExperience, j.Vacancies " +
            "FROM vw_CandidateMatchScore v " +
            "JOIN Candidates c ON v.CandidateID = c.CandidateID " +
            "JOIN JobPostings j ON v.JobID = j.JobID " +
            "WHERE c.UserID = ? AND j.IsActive = 1 AND j.IsDeleted = 0 " +
            "ORDER BY v.TotalMatchScore DESC",
            [userID]
        );
        res.json(matches);
    } catch (err) {
        console.error("Fetch Candidate Matches Error:", err.message);
        res.status(500).json({ error: "Failed to fetch matched opportunities." });
    }
});

/**
 * @route   GET /api/candidates/discover
 * @desc    Get all active jobs with basic matching (simplified)
 * @access  Private (Candidate)
 */
router.get('/discover', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        // Fetch jobs and calculate a basic score on the fly for discovery
        const jobs = await query(
            "SELECT j.*, " +
            "(SELECT COUNT(*) FROM JobSkills js JOIN CandidateSkills cs ON js.SkillID = cs.SkillID " +
            " WHERE js.JobID = j.JobID AND cs.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)) as MatchedSkillsCount " +
            "FROM JobPostings j " +
            "WHERE j.IsActive = 1 AND j.IsDeleted = 0 " +
            "ORDER BY j.CreatedAt DESC",
            [userID]
        );
        res.json(jobs);
    } catch (err) {
        console.error("Discover Jobs Error:", err.message);
        res.status(500).json({ error: "Failed to discover opportunities." });
    }
});

/**
 * @route   GET /api/candidates/applications
 * @desc    Get all applications for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/applications', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const apps = await query(
            "SELECT a.ApplicationID, a.AppliedDate, s.StatusName, " +
            "j.JobTitle, j.Location, j.Description, j.MinExperience, j.Vacancies, " +
            "a.RejectionReason, a.WithdrawalReason " +
            "FROM Applications a " +
            "JOIN Candidates c ON a.CandidateID = c.CandidateID " +
            "JOIN JobPostings j ON a.JobID = j.JobID " +
            "JOIN ApplicationStatus s ON a.StatusID = s.StatusID " +
            "WHERE c.UserID = ? AND a.IsDeleted = 0 " +
            "ORDER BY a.AppliedDate DESC",
            [userID]
        );
        res.json(apps);
    } catch (err) {
        console.error("Fetch Candidate Applications Error:", err.message);
        res.status(500).json({ error: "Failed to fetch applications." });
    }
});

/**
 * @route   GET /api/candidates/skills
 * @desc    Get the candidate's existing skills with proficiency levels
 * @access  Private (Candidate)
 */
router.get('/skills', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const skills = await query(
            "SELECT cs.SkillID, s.SkillName, cs.ProficiencyLevel " +
            "FROM CandidateSkills cs " +
            "JOIN Skills s ON cs.SkillID = s.SkillID " +
            "WHERE cs.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?) " +
            "ORDER BY cs.ProficiencyLevel DESC",
            [userID]
        );
        res.json(skills);
    } catch (err) {
        console.error("Fetch Candidate Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skills." });
    }
});

/**
 * @route   GET /api/candidates/interviews
 * @desc    Get interviews for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/interviews', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const interviews = await query(
            "SELECT * FROM vw_CandidateInterviews WHERE UserID = ? ORDER BY InterviewStart ASC",
            [userID]
        );
        res.json(interviews);
    } catch (err) {
        console.error("Fetch Candidate Interviews Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview schedule." });
    }
});

/**
 * @route   POST /api/candidates/confirm-interview
 * @desc    Confirm an interview slot
 * @access  Private (Candidate)
 */
router.post('/confirm-interview', protect, authorize(3), async (req, res) => {
    const { scheduleID } = req.body;
    const userID = req.user.UserID;
    try {
        await query("EXEC sp_ConfirmInterview ?, ?", [scheduleID, userID]);
        res.json({ message: "Interview confirmed successfully." });
    } catch (err) {
        console.error("Confirm Interview Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to confirm interview." });
    }
});

/**
 * @route   GET /api/candidates/assessments
 * @desc    Get available skill assessments for the candidate
 * @access  Private (Candidate)
 */
router.get('/assessments', protect, authorize(3), async (req, res) => {
    try {
        const assessments = await query(
            "SELECT m.*, s.SkillName " +
            "FROM MicroAssessments m " +
            "JOIN Skills s ON m.SkillID = s.SkillID " +
            "WHERE m.IsActive = 1"
        );
        res.json(assessments);
    } catch (err) {
        console.error("Fetch Assessments Error:", err.message);
        res.status(500).json({ error: "Failed to fetch assessments." });
    }
});

/**
 * @route   POST /api/candidates/apply
 * @desc    Apply for a job
 * @access  Private (Candidate)
 */
router.get('/profile/skills', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const skills = await query(
            "SELECT * FROM vw_SkillVerificationStatus WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)",
            [userID]
        );
        res.json(skills);
    } catch (err) {
        console.error("Fetch Profile Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skills profile." });
    }
});

router.post('/apply', protect, authorize(3), async (req, res) => {
    console.log("=== /APPLY ENDPOINT HIT ===");
    console.log("Request Body:", req.body);
    const { jobID } = req.body;
    const userID = req.user.UserID;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Check if already applied
        const existing = await query("SELECT * FROM Applications WHERE CandidateID = ? AND JobID = ?", [candidateID, jobID]);
        if (existing.length > 0) return res.status(400).json({ error: "Already applied for this job." });

        // Insert application
        await query(
            "INSERT INTO Applications (CandidateID, JobID, StatusID) VALUES (?, ?, (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Applied'))",
            [candidateID, jobID]
        );

        // Award gamification points
        try {
            await query("EXEC sp_AwardGamificationPoints ?, 'Application'", [candidateID]);
        } catch (gErr) {
            console.error("Gamification Error:", gErr.message);
        }

        res.json({ message: "Application submitted successfully." });
    } catch (err) {
        console.error("Apply Job Error:", err.message);
        res.status(500).json({ error: "Failed to submit application." });
    }
});

/**
 * @route   POST /api/candidates/withdraw
 * @desc    Withdraw an application
 * @access  Private (Candidate)
 */
router.post('/withdraw', protect, authorize(3), async (req, res) => {
    const { applicationID, reason } = req.body;
    const userID = req.user.UserID;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        const candidateID = candidate[0].CandidateID;

        await query("EXEC sp_WithdrawApplication ?, ?, ?", [applicationID, candidateID, reason]);
        res.json({ message: "Application withdrawn successfully." });
    } catch (err) {
        console.error("Withdraw Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to withdraw application." });
    }
});

/**
 * @route   POST /api/candidates/skills
 * @desc    Add or update a skill
 * @access  Private (Candidate)
 */
router.post('/skills', protect, authorize(3), async (req, res) => {
    const { skillID, proficiencyLevel } = req.body;
    const userID = req.user.UserID;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        const candidateID = candidate[0].CandidateID;

        // Check if skill already exists
        const existing = await query("SELECT * FROM CandidateSkills WHERE CandidateID = ? AND SkillID = ?", [candidateID, skillID]);

        if (existing.length > 0) {
            await query("UPDATE CandidateSkills SET ProficiencyLevel = ? WHERE CandidateID = ? AND SkillID = ?", [proficiencyLevel, candidateID, skillID]);
        } else {
            await query("INSERT INTO CandidateSkills (CandidateID, SkillID, ProficiencyLevel) VALUES (?, ?, ?)", [candidateID, skillID, proficiencyLevel]);
        }

        res.json({ message: "Skill updated successfully." });
    } catch (err) {
        console.error("Skill Update Error:", err.message);
        res.status(500).json({ error: "Failed to update skill." });
    }
});

/**
 * @route   GET /api/candidates/career-path
 * @desc    Get career path insights for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/career-path', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const careerPath = await query(
            "SELECT * FROM vw_CareerPathInsights WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)",
            [userID]
        );
        res.json(careerPath);
    } catch (err) {
        console.error("Fetch Career Path Error:", err.message);
        res.status(500).json({ error: "Failed to fetch career path insights." });
    }
});

/**
 * @route   POST /api/candidates/learning-path
 * @desc    Generate personalized learning path for the candidate
 * @access  Private (Candidate)
 */
router.post('/learning-path', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { targetRole } = req.body;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Resolve targetRole to a JobID
        let jobID = null;
        if (targetRole) {
            const jobs = await query(
                "SELECT TOP 1 JobID FROM JobPostings WHERE JobTitle LIKE ? AND IsActive = 1 AND IsDeleted = 0 ORDER BY CreatedAt DESC",
                [`%${targetRole}%`]
            );
            if (jobs.length > 0) {
                jobID = jobs[0].JobID;
            } else {
                // Fallback: pick any active job if no exact match
                const anyJob = await query("SELECT TOP 1 JobID FROM JobPostings WHERE IsActive = 1 AND IsDeleted = 0 ORDER BY CreatedAt DESC");
                if (anyJob.length > 0) jobID = anyJob[0].JobID;
            }
        }

        if (!jobID) {
            return res.status(400).json({ error: "No suitable jobs found to generate learning path from." });
        }

        // Call the stored procedure to generate learning path with the resolved JobID
        const result = await query("EXEC sp_GenerateLearningPath ?, ?", [candidateID, jobID]);
        res.json(result);
    } catch (err) {
        console.error("Generate Learning Path Error:", err.message);
        res.status(500).json({ error: "Failed to generate learning path." });
    }
});

/**
 * @route   GET /api/candidates/learning-path
 * @desc    Get existing learning path for the candidate
 * @access  Private (Candidate)
 */
router.get('/learning-path', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const learningPath = await query(
            "SELECT * FROM PersonalizedLearningPaths WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?) ORDER BY CreatedAt DESC",
            [userID]
        );
        res.json(learningPath);
    } catch (err) {
        console.error("Fetch Learning Path Error:", err.message);
        res.status(500).json({ error: "Failed to fetch learning path." });
    }
});

/**
 * @route   GET /api/candidates/leaderboard
 * @desc    Get gamification leaderboard - points, levels, badges
 * @access  Private (Candidate)
 */
router.get('/leaderboard', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const leaderboard = await query(
            "SELECT * FROM CandidateGamification WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)",
            [userID]
        );
        res.json(leaderboard);
    } catch (err) {
        console.error("Fetch Leaderboard Error:", err.message);
        res.status(500).json({ error: "Failed to fetch leaderboard data." });
    }
});

/**
 * @route   GET /api/candidates/interview-prep
 * @desc    Get interview preparation materials for candidate's applications
 * @access  Private (Candidate)
 */
router.get('/interview-prep', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const prepMaterials = await query(
            "SELECT * FROM InterviewPrepMaterials WHERE IsActive = 1 ORDER BY DifficultyLevel ASC"
        );
        res.json(prepMaterials);
    } catch (err) {
        console.error("Fetch Interview Prep Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview prep materials." });
    }
});

/**
 * @route   POST /api/candidates/interview-prep/generate
 * @desc    Generate personalized interview prep for a specific job
 * @access  Private (Candidate)
 */
router.post('/interview-prep/generate', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { jobID, applicationID } = req.body;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Get job details for generating prep
        const job = await query("SELECT JobTitle, Description FROM JobPostings WHERE JobID = ?", [jobID]);
        if (job.length === 0) return res.status(404).json({ error: "Job not found." });

        // Call stored procedure to generate prep
        const result = await query("EXEC sp_GenerateInterviewPrep ?, ?", [candidateID, jobID]);
        res.json(result);
    } catch (err) {
        console.error("Generate Interview Prep Error:", err.message);
        res.status(500).json({ error: "Failed to generate interview prep." });
    }
});

/**
 * @route   GET /api/candidates/salary-coach
 * @desc    Get salary negotiation coaching for candidate
 * @access  Private (Candidate)
 */
router.get('/salary-coach', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const salaryData = await query(
            "SELECT * FROM SalaryBenchmarks WHERE IsActive = 1 ORDER BY AvgSalary DESC"
        );
        res.json(salaryData);
    } catch (err) {
        console.error("Fetch Salary Coach Error:", err.message);
        res.status(500).json({ error: "Failed to fetch salary data." });
    }
});

/**
 * @route   POST /api/candidates/salary-coach/negotiate
 * @desc    Generate salary negotiation strategy
 * @access  Private (Candidate)
 */
router.post('/salary-coach/negotiate', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { jobID, currentSalary, targetSalary } = req.body;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Get job salary range
        const jobSalary = await query("SELECT JobTitle, SalaryMin, SalaryMax FROM JobPostings WHERE JobID = ?", [jobID]);

        // Call stored procedure for negotiation strategy
        const result = await query("EXEC sp_GenerateNegotiationStrategy ?, ?, ?, ?",
            [candidateID, jobID, currentSalary || 0, targetSalary || 0]);
        res.json(result);
    } catch (err) {
        console.error("Generate Negotiation Strategy Error:", err.message);
        res.status(500).json({ error: "Failed to generate negotiation strategy." });
    }
});

/**
 * @route   GET /api/candidates/location-preferences
 * @desc    Get candidate's location preferences
 * @access  Private (Candidate)
 */
router.get('/location-preferences', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const prefs = await query(
            "SELECT * FROM CandidateLocationPreferences WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)",
            [userID]
        );
        if (prefs.length === 0) {
            // Return default preferences if none set
            return res.json([{ WorkType: 'hybrid', OpenToRelocate: 0, MaxCommuteMinutes: 60, PreferredLocations: '' }]);
        }
        res.json(prefs);
    } catch (err) {
        console.error("Fetch Location Preferences Error:", err.message);
        res.status(500).json({ error: "Failed to fetch location preferences." });
    }
});

/**
 * @route   POST /api/candidates/location-preferences
 * @desc    Save candidate's location preferences
 * @access  Private (Candidate)
 */
router.post('/location-preferences', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { workType, locations, openToRelocate, maxCommute, timezone } = req.body;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        const locationsStr = Array.isArray(locations) ? locations.join(', ') : (locations || '');

        // Check if preferences exist
        const existing = await query("SELECT * FROM CandidateLocationPreferences WHERE CandidateID = ?", [candidateID]);

        if (existing.length > 0) {
            await query(
                `UPDATE CandidateLocationPreferences 
                SET WorkType = ?, PreferredLocations = ?, OpenToRelocate = ?, MaxCommuteMinutes = ?, Timezone = ?, UpdatedAt = GETDATE()
                WHERE CandidateID = ?`,
                [workType || 'hybrid', locationsStr, openToRelocate ? 1 : 0, maxCommute || 60, timezone || 'UTC', candidateID]
            );
        } else {
            await query(
                `INSERT INTO CandidateLocationPreferences (CandidateID, WorkType, PreferredLocations, OpenToRelocate, MaxCommuteMinutes, Timezone)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [candidateID, workType || 'hybrid', locationsStr, openToRelocate ? 1 : 0, maxCommute || 60, timezone || 'UTC']
            );
        }

        res.json({ message: "Location preferences saved successfully." });
    } catch (err) {
        console.error("Save Location Preferences Error:", err.message);
        res.status(500).json({ error: "Failed to save location preferences." });
    }
});

/**
 * @route   GET /api/candidates/resume-score
 * @desc    Get resume quality score and insights
 * @access  Private (Candidate)
 */
router.get('/resume-score', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const candidate = await query(
            "SELECT ResumeText, ExtractedSkills, YearsOfExperience FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (candidate.length === 0) return res.status(404).json({ error: "Candidate not found." });

        const resumeText = candidate[0].ResumeText || '';
        const extractedSkills = candidate[0].ExtractedSkills || '';

        // Calculate simple score based on resume content
        let score = 0;
        const factors = [];

        // Length check
        if (resumeText.length > 500) { score += 20; factors.push({ factor: 'Good length', points: 20 }); }
        else { factors.push({ factor: 'Too short - add more details', points: 0 }); }

        // Skills check
        if (extractedSkills && extractedSkills.split(',').length > 3) { score += 30; factors.push({ factor: 'Skills section complete', points: 30 }); }
        else { factors.push({ factor: 'Add more technical skills', points: 0 }); }

        // Experience check
        if (candidate[0].YearsOfExperience > 2) { score += 25; factors.push({ factor: 'Strong experience', points: 25 }); }
        else { factors.push({ factor: 'Highlight your experience', points: 0 }); }

        // Format check
        if (resumeText.includes('Summary') || resumeText.includes('Objective')) { score += 25; factors.push({ factor: 'Professional format', points: 25 }); }
        else { factors.push({ factor: 'Add a professional summary', points: 0 }); }

        res.json({
            overallScore: Math.min(100, score),
            factors: factors,
            resumeText: resumeText.substring(0, 200) + '...',
            extractedSkills: extractedSkills
        });
    } catch (err) {
        console.error("Fetch Resume Score Error:", err.message);
        res.status(500).json({ error: "Failed to analyze resume." });
    }
});

module.exports = router;
