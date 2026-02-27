const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');
const multer = require('multer');
const { processCandidateResume } = require('../pdfHelper');

// DEBUG: Test endpoint
router.get('/debug-test', (req, res) => {
    res.json({ message: 'Candidates router works!' });
});

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
 * @desc    Get all active jobs with basic matching and required skills
 * @access  Private (Candidate)
 * 
 * JobSkills columns: JobID, SkillID, IsMandatory (BIT), MinProficiency
 * Skills columns: SkillID, SkillName
 */
router.get('/discover', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        // Fetch jobs and calculate a basic score on the fly for discovery
        // Exclude jobs the candidate has already applied to
        const jobs = await query(
            "SELECT j.*, " +
            "(SELECT COUNT(*) FROM JobSkills js JOIN CandidateSkills cs ON js.SkillID = cs.SkillID " +
            " WHERE js.JobID = j.JobID AND cs.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)) as MatchedSkillsCount " +
            "FROM JobPostings j " +
            "WHERE j.IsActive = 1 AND j.IsDeleted = 0 " +
            "AND j.JobID NOT IN (SELECT JobID FROM Applications WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)) " +
            "ORDER BY j.CreatedAt DESC",
            [userID, userID]
        );

        // Try to get skills, but don't fail if it errors
        let skillsByJob = {};
        try {
            // Get candidate's skills with proficiency level for matching display
            const candidateSkills = await query(
                "SELECT cs.SkillID, s.SkillName, cs.ProficiencyLevel FROM CandidateSkills cs " +
                "JOIN Skills s ON cs.SkillID = s.SkillID " +
                "WHERE cs.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)",
                [userID]
            );
            // Create a map of skillID -> proficiency level
            const candidateSkillProficiency = {};
            candidateSkills.forEach(s => {
                candidateSkillProficiency[s.SkillID] = s.ProficiencyLevel;
            });
            const candidateSkillIds = new Set(candidateSkills.map(s => s.SkillID));

            // Fetch required skills for all jobs
            const jobIds = jobs.map(j => j.JobID);

            if (jobIds.length > 0) {
                const placeholders = jobIds.map(() => '?').join(',');
                const jobSkills = await query(
                    `SELECT js.JobID, js.SkillID, s.SkillName, js.IsMandatory, js.MinProficiency 
                    FROM JobSkills js 
                    JOIN Skills s ON js.SkillID = s.SkillID 
                    WHERE js.JobID IN (${placeholders})`,
                    jobIds
                );

                // Group skills by job ID
                for (const skill of jobSkills) {
                    if (!skillsByJob[skill.JobID]) {
                        skillsByJob[skill.JobID] = { mandatory: [], optional: [] };
                    }
                    const candidateProficiency = candidateSkillProficiency[skill.SkillID] || 0;
                    const meetsRequirement = candidateProficiency >= skill.MinProficiency;
                    const skillInfo = {
                        SkillName: skill.SkillName,
                        MinProficiency: skill.MinProficiency,
                        HasSkill: candidateSkillIds.has(skill.SkillID),
                        CandidateProficiencyLevel: candidateProficiency,
                        MeetsRequirement: meetsRequirement
                    };
                    if (skill.IsMandatory) {
                        skillsByJob[skill.JobID].mandatory.push(skillInfo);
                    } else {
                        skillsByJob[skill.JobID].optional.push(skillInfo);
                    }
                }
            }
        } catch (skillErr) {
            console.error("Skills fetch error (non-fatal):", skillErr.message);
            // Continue without skills data
        }

        // Attach skills to each job
        const jobsWithSkills = jobs.map(job => ({
            ...job,
            RequiredSkills: skillsByJob[job.JobID] || { mandatory: [], optional: [] }
        }));

        res.json(jobsWithSkills);
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
            "SELECT a.ApplicationID, a.JobID, a.AppliedDate, s.StatusName, " +
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
 * @route   POST /api/candidates/career-path/simulate
 * @desc    Simulate career path prediction for a target role
 * @access  Private (Candidate)
 */
router.post('/career-path/simulate', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { targetRole, years = 5 } = req.body;

    if (!targetRole) {
        return res.status(400).json({ error: "Target role is required." });
    }

    try {
        // Get CandidateID from UserID
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }
        const candidateID = candidate[0].CandidateID;

        // Call the stored procedure for career path prediction
        const result = await query(
            "EXEC sp_PredictCareerPath ?, ?, ?",
            [candidateID, targetRole, years]
        );

        res.json(result[0] || result);
    } catch (err) {
        console.error("Career Path Simulation Error:", err.message);
        res.status(500).json({ error: "Failed to simulate career path." });
    }
});

/**
 * @route   GET /api/candidates/career-path/roles
 * @desc    Get available career roles for simulation
 * @access  Private (Candidate)
 */
router.get('/career-path/roles', protect, authorize(3), async (req, res) => {
    try {
        // Get distinct roles from CareerPaths table
        const roles = await query(`
            SELECT DISTINCT ToRole AS RoleName
            FROM CareerPaths
            WHERE ToRole IS NOT NULL
            UNION
            SELECT DISTINCT JobTitle AS RoleName
            FROM JobPostings
            WHERE IsActive = 1 AND IsDeleted = 0
            ORDER BY RoleName
        `);
        res.json(roles.map(r => r.RoleName));
    } catch (err) {
        console.error("Fetch Career Roles Error:", err.message);
        res.status(500).json({ error: "Failed to fetch career roles." });
    }
});

/**
 * @route   POST /api/candidates/learning-path
 * @desc    Generate personalized learning path for the candidate
 * @access  Private (Candidate)
 */
router.post('/learning-path', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { targetJobID } = req.body;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Use targetJobID directly if provided
        let jobID = targetJobID;

        // Fallback: pick any job if no jobID provided
        if (!jobID) {
            const anyJob = await query("SELECT TOP 1 JobID FROM JobPostings ORDER BY CreatedAt DESC");
            if (anyJob.length > 0) {
                jobID = anyJob[0].JobID;
            }
        }

        if (!jobID) {
            // No jobs exist - create a demo learning path directly
            const demoPath = [
                { SkillName: 'Java Fundamentals', Priority: 1, EstimatedHours: 20 },
                { SkillName: 'SQL Database Design', Priority: 2, EstimatedHours: 15 },
                { SkillName: 'Spring Boot Framework', Priority: 3, EstimatedHours: 25 },
                { SkillName: 'REST API Development', Priority: 4, EstimatedHours: 18 },
                { SkillName: 'Git Version Control', Priority: 5, EstimatedHours: 8 }
            ];
            return res.json(demoPath);
        }

        console.log("Generating learning path for CandidateID:", candidateID, "JobID:", jobID);

        // First, try to call the stored procedure
        try {
            await query("EXEC sp_GenerateLearningPath ?, ?", [candidateID, jobID]);
        } catch (spErr) {
            console.error("Stored Procedure Error:", spErr.message);
            // Continue - we'll generate manually if needed
        }

        // Fetch the newly created learning path
        let learningPath = await query(
            "SELECT * FROM PersonalizedLearningPaths WHERE CandidateID = ? ORDER BY CreatedAt DESC",
            [candidateID]
        );

        // If no learning path was created, generate one manually
        if (learningPath.length === 0) {
            // Get job requirements
            const jobSkills = await query(
                `SELECT s.SkillName, js.MinProficiency, js.IsMandatory
                 FROM JobSkills js
                 JOIN Skills s ON js.SkillID = s.SkillID
                 WHERE js.JobID = ?`,
                [jobID]
            );

            // Get candidate's current skills
            const candidateSkills = await query(
                `SELECT SkillID, ProficiencyLevel FROM CandidateSkills WHERE CandidateID = ?`,
                [candidateID]
            );

            // Create skill gap analysis
            const skillGaps = [];
            let priority = 1;

            for (const jobSkill of jobSkills) {
                const candSkill = candidateSkills.find(cs => cs.SkillID === jobSkill.SkillID);
                const currentLevel = candSkill ? candSkill.ProficiencyLevel : 0;
                const gap = jobSkill.MinProficiency - currentLevel;

                if (gap > 0) {
                    skillGaps.push({
                        SkillName: jobSkill.SkillName,
                        Priority: priority++,
                        EstimatedHours: gap * 4,
                        GapScore: gap,
                        CurrentLevel: currentLevel,
                        RequiredLevel: jobSkill.MinProficiency
                    });
                }
            }

            // If no gaps found, add some default skills
            if (skillGaps.length === 0) {
                skillGaps.push(
                    { SkillName: 'Advanced Java', Priority: 1, EstimatedHours: 20 },
                    { SkillName: 'System Design', Priority: 2, EstimatedHours: 15 },
                    { SkillName: 'Microservices', Priority: 3, EstimatedHours: 25 }
                );
            }

            learningPath = skillGaps;
        } else if (learningPath[0].SkillsGapAnalysis) {
            // Parse the SkillsGapAnalysis JSON
            try {
                const skillsGap = JSON.parse(learningPath[0].SkillsGapAnalysis);
                learningPath = skillsGap.map((skill, index) => ({
                    SkillName: skill.SkillName,
                    Priority: skill.Priority === 'High' ? 1 : (skill.Priority === 'Medium' ? 2 : 3),
                    EstimatedHours: skill.Gap ? skill.Gap * 4 : 8,
                    GapScore: skill.Gap,
                    CurrentLevel: skill.CurrentLevel,
                    RequiredLevel: skill.RequiredLevel
                }));
            } catch (e) {
                // Return as is if parsing fails
            }
        }

        res.json(learningPath);
    } catch (err) {
        console.error("Generate Learning Path Error:", err.message);
        // Return demo data on error
        const demoPath = [
            { SkillName: 'Java Fundamentals', Priority: 1, EstimatedHours: 20 },
            { SkillName: 'SQL Database Design', Priority: 2, EstimatedHours: 15 },
            { SkillName: 'Spring Boot Framework', Priority: 3, EstimatedHours: 25 }
        ];
        res.json(demoPath);
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

        // Parse the SkillsGapAnalysis JSON into skill items for frontend
        if (learningPath.length > 0 && learningPath[0].SkillsGapAnalysis) {
            try {
                const skillsGap = JSON.parse(learningPath[0].SkillsGapAnalysis);
                // Transform into frontend format
                const skillItems = skillsGap.map((skill, index) => ({
                    SkillName: skill.SkillName,
                    Priority: skill.Priority === 'High' ? 1 : (skill.Priority === 'Medium' ? 2 : 3),
                    EstimatedHours: skill.Gap * 4, // Estimate 4 hours per proficiency level gap
                    GapScore: skill.Gap,
                    CurrentLevel: skill.CurrentLevel,
                    RequiredLevel: skill.RequiredLevel
                }));
                return res.json(skillItems);
            } catch (parseErr) {
                console.error("Parse SkillsGap Error:", parseErr.message);
                // Return original data if parsing fails
                return res.json(learningPath);
            }
        }

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
 * @route   GET /api/candidates/leaderboard/global
 * @desc    Get global leaderboard with rankings for all candidates
 * @access  Private (Candidate)
 */
router.get('/leaderboard/global', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        // Get global leaderboard - using Points column (not TotalPoints)
        const globalLeaderboard = await query(
            "SELECT TOP 50 cg.GameID, cg.CandidateID, cg.Points, cg.Level, cg.Badges, " +
            "cg.StreakDays, cg.LeaderboardRank, cg.EngagementScore, " +
            "c.FullName, c.Location, " +
            "ROW_NUMBER() OVER (ORDER BY cg.Points DESC) AS GlobalRank " +
            "FROM CandidateGamification cg " +
            "JOIN Candidates c ON cg.CandidateID = c.CandidateID " +
            "WHERE cg.Points > 0 " +
            "ORDER BY cg.Points DESC"
        );

        // Get current user's rank
        const userRank = await query(
            "SELECT COUNT(*) + 1 AS UserRank FROM CandidateGamification " +
            "WHERE Points > (SELECT ISNULL(Points, 0) FROM CandidateGamification " +
            "WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?))",
            [userID]
        );

        res.json({
            globalRanking: globalLeaderboard,
            userRank: userRank[0]?.UserRank || 0
        });
    } catch (err) {
        console.error("Fetch Global Leaderboard Error:", err.message);
        res.status(500).json({ error: "Failed to fetch global leaderboard." });
    }
});

/**
 * @route   POST /api/candidates/gamification/daily-login
 * @desc    Record daily login and award streak points
 * @access  Private (Candidate)
 */
router.post('/gamification/daily-login', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;

    // Retry logic for deadlock handling
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
            if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
            const candidateID = candidate[0].CandidateID;

            // Check if already logged in today (with NOLOCK to avoid blocking)
            const today = new Date().toISOString().split('T')[0];
            const lastLogin = await query(
                "SELECT LastActivityDate FROM CandidateGamification WITH (NOLOCK) WHERE CandidateID = ?",
                [candidateID]
            );

            let streakBonus = 0;
            let isNewDay = true;

            if (lastLogin.length > 0 && lastLogin[0].LastActivityDate) {
                const lastLoginDate = new Date(lastLogin[0].LastActivityDate).toISOString().split('T')[0];
                if (lastLoginDate === today) {
                    isNewDay = false;
                }
            }

            // Only process if it's a new day
            if (isNewDay) {
                // Calculate streak bonus in a single atomic update
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                const lastLoginDate = lastLogin.length > 0 && lastLogin[0].LastActivityDate
                    ? new Date(lastLogin[0].LastActivityDate).toISOString().split('T')[0]
                    : null;

                if (lastLoginDate === yesterdayStr) {
                    // Consecutive day - increment streak
                    await query(`
                        UPDATE CandidateGamification 
                        SET StreakDays = StreakDays + 1, 
                            LastActivityDate = GETDATE(),
                            Points = Points + 10
                        WHERE CandidateID = ?
                    `, [candidateID]);
                    streakBonus = 5;
                } else if (lastLoginDate !== today) {
                    // Streak broken or first login - reset to 1
                    await query(`
                        UPDATE CandidateGamification 
                        SET StreakDays = 1, 
                            LastActivityDate = GETDATE(),
                            Points = Points + 10
                        WHERE CandidateID = ?
                    `, [candidateID]);
                }
            }

            // Get updated gamification data (with NOLOCK)
            const updatedData = await query(
                "SELECT * FROM CandidateGamification WITH (NOLOCK) WHERE CandidateID = ?",
                [candidateID]
            );

            return res.json({
                message: isNewDay ? "Daily login recorded!" : "Already logged in today",
                streakBonus: streakBonus,
                isNewDay: isNewDay,
                gamification: updatedData[0]
            });
        } catch (err) {
            // Check if it's a deadlock error (error number 1205)
            if (err.code === '1205' || err.message.includes('deadlock')) {
                retryCount++;
                console.log(`Deadlock detected, retry ${retryCount}/${maxRetries}`);
                if (retryCount < maxRetries) {
                    // Wait a bit before retrying
                    await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
                    continue;
                }
            }
            console.error("Daily Login Error:", err.message);
            return res.status(500).json({ error: "Failed to record daily login." });
        }
    }

    res.status(500).json({ error: "Failed to record daily login after retries." });
}
);

/**
 * @route   POST /api/candidates/gamification/profile-complete
 * @desc    Award points for completing profile
 * @access  Private (Candidate)
 */
router.post('/gamification/profile-complete', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Award points for profile completion
        try {
            await query("EXEC sp_AwardGamificationPoints ?, 'ProfileComplete'", [candidateID]);
        } catch (gErr) {
            console.error("Gamification Error:", gErr.message);
        }

        res.json({ message: "Profile completion points awarded!" });
    } catch (err) {
        console.error("Profile Complete Error:", err.message);
        res.status(500).json({ error: "Failed to award profile points." });
    }
});

/**
 * @route   POST /api/candidates/gamification/skill-verified
 * @desc    Award points when a skill is verified
 * @access  Private (Candidate)
 */
router.post('/gamification/skill-verified', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Award points for skill verification
        try {
            await query("EXEC sp_AwardGamificationPoints ?, 'SkillVerified'", [candidateID]);
        } catch (gErr) {
            console.error("Gamification Error:", gErr.message);
        }

        res.json({ message: "Skill verification points awarded!" });
    } catch (err) {
        console.error("Skill Verified Error:", err.message);
        res.status(500).json({ error: "Failed to award skill verification points." });
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
    let { jobID, currentSalary, targetSalary } = req.body;

    // Parse jobID if it's a string (could be "JobID - Status" format from frontend)
    if (typeof jobID === 'string' && jobID.includes(' - ')) {
        jobID = jobID.split(' - ')[0];
    }
    jobID = parseInt(jobID);

    if (!jobID || isNaN(jobID)) {
        return res.status(400).json({ error: "Valid Job ID is required." });
    }

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        // Get job info - salary ranges are in JobSalaryRanges table, not JobPostings
        const jobInfo = await query(`
            SELECT j.JobID, j.JobTitle, j.Location, 
                   jsr.MinSalary, jsr.MaxSalary
            FROM JobPostings j
            LEFT JOIN JobSalaryRanges jsr ON j.JobID = jsr.JobID
            WHERE j.JobID = ?
        `, [jobID]);

        if (jobInfo.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        // Call stored procedure for negotiation strategy (only 3 params: CandidateID, JobID, InitialOffer)
        const initialOffer = parseFloat(currentSalary) || 0;
        const result = await query("EXEC sp_GenerateNegotiationStrategy ?, ?, ?",
            [candidateID, jobID, initialOffer]);

        // Add target salary info to response if provided
        const response = result[0] || result;
        if (targetSalary && response) {
            response.TargetSalary = targetSalary;
            response.GapToTarget = targetSalary - (response.RecommendedCounterOffer || initialOffer);
        }

        res.json(response);
    } catch (err) {
        console.error("Generate Negotiation Strategy Error:", err.message);
        res.status(500).json({ error: "Failed to generate negotiation strategy: " + err.message });
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
            `SELECT 
                PreferenceID, CandidateID, 
                PreferredLocations, 
                WillingToRelocate, 
                RemotePreference, 
                CommuteTimeMax, 
                LocationPriority, 
                LastUpdated
            FROM CandidateLocationPreferences WHERE CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)`,
            [userID]
        );
        if (prefs.length === 0) {
            // Return default preferences if none set
            return res.json([{
                RemotePreference: 'Hybrid',
                WillingToRelocate: 0,
                CommuteTimeMax: 60,
                PreferredLocations: '',
                LocationPriority: 5
            }]);
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
    const { workType, locations, openToRelocate, maxCommute, locationPriority } = req.body;

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candidate.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateID = candidate[0].CandidateID;

        const locationsStr = Array.isArray(locations) ? locations.join(', ') : (locations || '');

        // Map frontend workType to database RemotePreference values
        // Frontend: 'remote', 'hybrid', 'onsite' -> DB: 'Full', 'Hybrid', 'None'
        let remotePreference = 'Hybrid';
        if (workType === 'remote') remotePreference = 'Full';
        else if (workType === 'onsite') remotePreference = 'None';
        else remotePreference = 'Hybrid';

        // Check if preferences exist
        const existing = await query("SELECT * FROM CandidateLocationPreferences WHERE CandidateID = ?", [candidateID]);

        if (existing.length > 0) {
            await query(
                `UPDATE CandidateLocationPreferences 
                SET RemotePreference = ?, PreferredLocations = ?, WillingToRelocate = ?, CommuteTimeMax = ?, LocationPriority = ?, LastUpdated = GETDATE()
                WHERE CandidateID = ?`,
                [remotePreference, locationsStr, openToRelocate ? 1 : 0, maxCommute || 60, locationPriority || 5, candidateID]
            );
        } else {
            await query(
                `INSERT INTO CandidateLocationPreferences (CandidateID, RemotePreference, PreferredLocations, WillingToRelocate, CommuteTimeMax, LocationPriority)
                VALUES (?, ?, ?, ?, ?, ?)`,
                [candidateID, remotePreference, locationsStr, openToRelocate ? 1 : 0, maxCommute || 60, locationPriority || 5]
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
 * @desc    Get resume quality score and insights from ResumeInsights table
 * @access  Private (Candidate)
 */
router.get('/resume-score', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        // Query ResumeInsights table for stored score and factors
        const result = await query(`
            SELECT 
                ri.InsightID,
                ri.ResumeQualityScore,
                ri.EducationInstitutions,
                ri.Certifications,
                ri.TechnologiesMentioned,
                ri.YearsExperienceExtracted,
                ri.LeadershipTermsCount,
                ri.AchievementDensity,
                ri.ReadabilityScore,
                ri.KeywordsMatched,
                ri.ExtractedSkills AS RIExtractedSkills,
                ri.ProcessingStatus,
                ri.NLPProcessedAt,
                ri.ConfidenceScore,
                c.ResumeText,
                c.ExtractedSkills,
                c.YearsOfExperience
            FROM Candidates c
            LEFT JOIN ResumeInsights ri ON c.CandidateID = ri.CandidateID
            WHERE c.UserID = ?
        `, [userID]);

        if (result.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        const row = result[0];
        const resumeText = row.ResumeText || '';
        const extractedSkills = row.ExtractedSkills || '';

        // If ResumeInsights has data, use it
        if (row.InsightID && row.ResumeQualityScore !== null) {
            const factors = [];

            // Build factors from ResumeInsights data
            if (row.ReadabilityScore && row.ReadabilityScore >= 60) {
                factors.push({ factor: 'Good readability', points: Math.round(row.ReadabilityScore * 0.25) });
            } else {
                factors.push({ factor: 'Improve resume readability', points: 0 });
            }

            if (row.LeadershipTermsCount && row.LeadershipTermsCount > 0) {
                factors.push({ factor: 'Leadership terms detected', points: Math.min(20, row.LeadershipTermsCount * 5) });
            } else {
                factors.push({ factor: 'Add leadership achievements', points: 0 });
            }

            if (row.AchievementDensity && row.AchievementDensity >= 0.3) {
                factors.push({ factor: 'Strong achievement focus', points: Math.round(row.AchievementDensity * 50) });
            } else {
                factors.push({ factor: 'Add quantifiable achievements', points: 0 });
            }

            if (row.KeywordsMatched && row.KeywordsMatched >= 5) {
                factors.push({ factor: 'Good keyword optimization', points: Math.min(25, row.KeywordsMatched * 2) });
            } else {
                factors.push({ factor: 'Include more industry keywords', points: 0 });
            }

            res.json({
                overallScore: row.ResumeQualityScore,
                factors: factors,
                resumeText: resumeText.substring(0, 200) + (resumeText.length > 200 ? '...' : ''),
                extractedSkills: extractedSkills,
                technologiesMentioned: row.TechnologiesMentioned,
                certifications: row.Certifications,
                processingStatus: row.ProcessingStatus,
                lastAnalyzed: row.NLPProcessedAt,
                confidenceScore: row.ConfidenceScore
            });
        } else {
            // Fallback: Calculate simple score based on resume content
            let score = 0;
            const factors = [];

            // Length check
            if (resumeText.length > 500) { score += 20; factors.push({ factor: 'Good length', points: 20 }); }
            else { factors.push({ factor: 'Too short - add more details', points: 0 }); }

            // Skills check
            if (extractedSkills && extractedSkills.split(',').length > 3) { score += 30; factors.push({ factor: 'Skills section complete', points: 30 }); }
            else { factors.push({ factor: 'Add more technical skills', points: 0 }); }

            // Experience check
            if (row.YearsOfExperience > 2) { score += 25; factors.push({ factor: 'Strong experience', points: 25 }); }
            else { factors.push({ factor: 'Highlight your experience', points: 0 }); }

            // Format check
            if (resumeText.includes('Summary') || resumeText.includes('Objective')) { score += 25; factors.push({ factor: 'Professional format', points: 25 }); }
            else { factors.push({ factor: 'Add a professional summary', points: 0 }); }

            res.json({
                overallScore: Math.min(100, score),
                factors: factors,
                resumeText: resumeText.substring(0, 200) + (resumeText.length > 200 ? '...' : ''),
                extractedSkills: extractedSkills,
                processingStatus: 'Pending',
                lastAnalyzed: null
            });
        }
    } catch (err) {
        console.error("Fetch Resume Score Error:", err.message);
        res.status(500).json({ error: "Failed to analyze resume." });
    }
});

/**
 * @route   GET /api/candidates/invitations
 * @desc    Get all pending invitations for the candidate
 * @access  Private (Candidate)
 */
router.get('/invitations', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const invitations = await query(
            "SELECT a.ApplicationID, a.AppliedDate, j.JobTitle, j.Location, j.Description, j.JobID " +
            "FROM Applications a " +
            "JOIN Candidates c ON a.CandidateID = c.CandidateID " +
            "JOIN JobPostings j ON a.JobID = j.JobID " +
            "WHERE c.UserID = ? AND a.StatusID = 7 AND a.IsDeleted = 0 " +
            "ORDER BY a.AppliedDate DESC",
            [userID]
        );
        res.json(invitations);
    } catch (err) {
        console.error("Fetch Invitations Error:", err.message);
        res.status(500).json({ error: "Failed to fetch invitations." });
    }
});

/**
 * @route   POST /api/candidates/invitations/:id/respond
 * @desc    Accept or decline an interview/pipeline invitation
 * @access  Private (Candidate)
 */
router.post('/invitations/:id/respond', protect, authorize(3), async (req, res) => {
    const { action } = req.body; // 'accept' or 'decline'
    const applicationID = req.params.id;
    const userID = req.user.UserID;

    if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ error: "Invalid action. Must be 'accept' or 'decline'." });
    }

    try {
        const candidate = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        const candidateID = candidate[0].CandidateID;

        // Verify the application belongs to the candidate and is in 'Invited' state
        const app = await query(
            "SELECT StatusID FROM Applications WHERE ApplicationID = ? AND CandidateID = ?",
            [applicationID, candidateID]
        );

        if (app.length === 0) return res.status(404).json({ error: "Invitation not found." });
        if (app[0].StatusID !== 7) return res.status(400).json({ error: "This application is not in 'Invited' state." });

        const newStatus = action === 'accept' ? 1 : 6; // 1 = Applied, 6 = Withdrawn

        await query(
            "UPDATE Applications SET StatusID = ?, AppliedDate = GETDATE() WHERE ApplicationID = ?",
            [newStatus, applicationID]
        );

        res.json({ message: `Invitation ${action}ed successfully.` });
    } catch (err) {
        console.error("Invitation Respond Error:", err.message);
        res.status(500).json({ error: "Failed to respond to invitation." });
    }
});

/**
 * @route   GET /api/candidates/notifications
 * @desc    Get push notifications for the logged-in candidate
 * @access  Private (Candidate)
 * 
 * Actual PushNotifications columns: NotificationID, UserID, DeviceToken, Platform,
 * Title, Body, NotificationType, DataPayload, SentAt, DeliveredAt, ReadAt,
 * ClickedAt, CampaignID, IsSilent, Priority, ExpiresAt
 */
router.get('/notifications', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const notifications = await query(
            `SELECT 
                pn.NotificationID,
                pn.Title,
                pn.Body AS Message,
                pn.NotificationType,
                pn.SentAt AS CreatedAt,
                pn.ReadAt,
                CASE WHEN pn.ReadAt IS NOT NULL THEN 1 ELSE 0 END AS IsRead,
                pn.Priority
            FROM PushNotifications pn
            WHERE pn.UserID = ?
            ORDER BY pn.SentAt DESC`,
            [userID]
        );
        res.json(notifications);
    } catch (err) {
        console.error("Fetch Notifications Error:", err.message);
        res.status(500).json({ error: "Failed to fetch notifications." });
    }
});

/**
 * @route   POST /api/candidates/notifications/register-device
 * @desc    Register a device for push notifications
 * @access  Private (Candidate)
 */
router.post('/notifications/register-device', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { deviceToken, platform } = req.body;

    try {
        // Check if device already registered
        const existing = await query(
            "SELECT * FROM PushNotifications WHERE UserID = ? AND DeviceToken = ?",
            [userID, deviceToken]
        );

        if (existing.length > 0) {
            // Update existing device registration
            await query(
                "UPDATE PushNotifications SET Platform = ?, SentAt = GETDATE() WHERE UserID = ? AND DeviceToken = ?",
                [platform || 'web', userID, deviceToken]
            );
        } else {
            // Insert new device registration
            await query(
                "INSERT INTO PushNotifications (UserID, DeviceToken, Platform, NotificationType, Title, Body, SentAt, Priority) VALUES (?, ?, ?, 'DeviceRegistration', 'Device Registered', 'Push notifications enabled', GETDATE(), 'low')",
                [userID, deviceToken, platform || 'web']
            );
        }

        res.json({ message: "Device registered for notifications." });
    } catch (err) {
        console.error("Register Device Error:", err.message);
        res.status(500).json({ error: "Failed to register device." });
    }
});

/**
 * @route   POST /api/candidates/notifications/mark-read
 * @desc    Mark notifications as read
 * @access  Private (Candidate)
 */
router.post('/notifications/mark-read', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { notificationIDs } = req.body;

    try {
        if (notificationIDs && notificationIDs.length > 0) {
            const ids = notificationIDs.join(',');
            await query(
                `UPDATE PushNotifications SET ReadAt = GETDATE() 
                WHERE UserID = ? AND NotificationID IN (${ids})`,
                [userID]
            );
        } else {
            // Mark all as read
            await query(
                "UPDATE PushNotifications SET ReadAt = GETDATE() WHERE UserID = ? AND ReadAt IS NULL",
                [userID]
            );
        }

        res.json({ message: "Notifications marked as read." });
    } catch (err) {
        console.error("Mark Read Error:", err.message);
        res.status(500).json({ error: "Failed to mark notifications as read." });
    }
});

/**
 * @route   GET /api/candidates/skill-gap-analysis
 * @desc    Get skill gap analysis for the logged-in candidate
 * @access  Private (Candidate)
 * 
 * JobSkills columns: JobID, SkillID, IsMandatory, MinProficiency
 * CandidateSkills columns: CandidateID, SkillID, ProficiencyLevel
 * vw_SkillGapAnalysis columns: SkillName, JobsRequiringSkill, CandidatesWithSkill, SkillGap
 */
router.get('/skill-gap-analysis', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        // Build personalized skill gap using actual table columns
        const skillGaps = await query(
            `SELECT DISTINCT
                s.SkillID,
                s.SkillName,
                js.MinProficiency AS DemandLevel,
                ISNULL(cs.ProficiencyLevel, 0) AS ProficiencyLevel,
                js.MinProficiency - ISNULL(cs.ProficiencyLevel, 0) AS GapScore,
                CASE 
                    WHEN cs.ProficiencyLevel IS NULL THEN 'Critical Gap'
                    WHEN js.MinProficiency - ISNULL(cs.ProficiencyLevel, 0) >= 2 THEN 'Critical Gap'
                    WHEN js.MinProficiency > ISNULL(cs.ProficiencyLevel, 0) THEN 'Learning Opportunity'
                    ELSE 'Adequate'
                END AS GapCategory
            FROM Skills s
            JOIN JobSkills js ON s.SkillID = js.SkillID
            LEFT JOIN CandidateSkills cs ON s.SkillID = cs.SkillID 
                AND cs.CandidateID = (SELECT CandidateID FROM Candidates WHERE UserID = ?)
            WHERE js.IsMandatory = 1
            ORDER BY GapScore DESC`,
            [userID]
        );
        res.json(skillGaps);
    } catch (err) {
        console.error("Fetch Skill Gap Analysis Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skill gap analysis." });
    }
});

/**
 * @route   GET /api/candidates/skills-demand
 * @desc    Get market skill demand data for candidate's skills
 * @access  Private (Candidate)
 * 
 * MarketIntelligence columns: IntelID, SkillID, Location, DemandScore, SupplyScore,
 * SalaryTrend, AvgSalary, CompetitorHiringActivity, JobPostingsCount,
 * CandidateApplicationsCount, TimeToFillDays, LastUpdated, Source, Confidence
 */
router.get('/skills-demand', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const skillsDemand = await query(
            `SELECT 
                s.SkillID,
                s.SkillName,
                mi.DemandScore,
                mi.SupplyScore,
                mi.SalaryTrend AS TrendDirection,
                mi.AvgSalary
            FROM Skills s
            JOIN MarketIntelligence mi ON s.SkillID = mi.SkillID
            ORDER BY mi.DemandScore DESC`
        );
        res.json(skillsDemand);
    } catch (err) {
        console.error("Fetch Skills Demand Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skills demand data." });
    }
});

// ============================================
// CANDIDATE SENTIMENT TRACKING ENDPOINTS
// ============================================

/**
 * @route   GET /api/candidates/:id/sentiment
 * @desc    Get sentiment history for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.get('/:id/sentiment', protect, authorize([1, 2]), async (req, res) => {
    const { id } = req.params;
    const { limit, interactionType } = req.query;

    try {
        const result = await query(
            `EXEC sp_GetCandidateSentimentHistory @CandidateID = ?, @Limit = ?, @InteractionType = ?`,
            [id, limit || 50, interactionType || null]
        );

        // The stored procedure returns two result sets
        // First is the history, second is the summary
        const history = result[0] || [];
        const summary = result[1]?.[0] || {
            TotalInteractions: 0,
            AvgSentimentScore: 0,
            AvgConfidence: 0,
            TotalRedFlags: 0,
            TotalPositiveIndicators: 0
        };

        res.json({ history, summary });
    } catch (err) {
        console.error("Fetch Sentiment Error:", err.message);
        res.status(500).json({ error: "Failed to fetch sentiment data." });
    }
});

/**
 * @route   POST /api/candidates/:id/sentiment
 * @desc    Add a new sentiment analysis for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.post('/:id/sentiment', protect, authorize([1, 2]), async (req, res) => {
    const { id } = req.params;
    const { interactionType, rawText, interactionDate } = req.body;

    if (!interactionType || !rawText) {
        return res.status(400).json({ error: "InteractionType and rawText are required." });
    }

    try {
        const result = await query(
            `EXEC sp_AnalyzeCandidateSentiment @CandidateID = ?, @InteractionType = ?, @RawText = ?, @InteractionDate = ?`,
            [id, interactionType, rawText, interactionDate || null]
        );

        res.status(201).json({
            message: "Sentiment analysis completed.",
            result: result[0]
        });
    } catch (err) {
        console.error("Sentiment Analysis Error:", err.message);
        res.status(500).json({ error: err.message || "Failed to analyze sentiment." });
    }
});

/**
 * @route   GET /api/candidates/:id/sentiment/summary
 * @desc    Get aggregated sentiment summary for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.get('/:id/sentiment/summary', protect, authorize([1, 2]), async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(`
            SELECT 
                COUNT(*) AS TotalInteractions,
                ISNULL(AVG(SentimentScore), 0) AS AvgSentimentScore,
                ISNULL(AVG(Confidence), 0) AS AvgConfidence,
                ISNULL(SUM(RedFlagsDetected), 0) AS TotalRedFlags,
                ISNULL(SUM(PositiveIndicators), 0) AS TotalPositiveIndicators,
                ISNULL(MAX(SentimentScore), 0) AS HighestScore,
                ISNULL(MIN(SentimentScore), 0) AS LowestScore,
                (SELECT TOP 1 CommunicationStyle 
                 FROM CandidateSentiment 
                 WHERE CandidateID = ? 
                 GROUP BY CommunicationStyle 
                 ORDER BY COUNT(*) DESC) AS DominantCommunicationStyle,
                (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = ? AND InteractionType = 'Email') AS EmailCount,
                (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = ? AND InteractionType = 'Interview') AS InterviewCount,
                (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = ? AND InteractionType = 'Call') AS CallCount,
                (SELECT COUNT(*) FROM CandidateSentiment WHERE CandidateID = ? AND InteractionType = 'Chat') AS ChatCount
            FROM CandidateSentiment
            WHERE CandidateID = ?
        `, [id, id, id, id, id, id]);

        res.json(result[0]);
    } catch (err) {
        console.error("Fetch Sentiment Summary Error:", err.message);
        res.status(500).json({ error: "Failed to fetch sentiment summary." });
    }
});

/**
 * @route   GET /api/candidates/profile/extracted-skills
 * @desc    Get skills extracted from resume
 * @access  Private (Candidate)
 */
router.get('/profile/extracted-skills', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const result = await query(
            "SELECT ExtractedSkills, ResumeText, YearsOfExperience FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        const { ExtractedSkills, ResumeText, YearsOfExperience } = result[0];

        // Parse ExtractedSkills from "Java:40,React:35,SQL:25" format
        let skills = [];
        if (ExtractedSkills) {
            skills = ExtractedSkills.split(',').map(s => {
                const [skillName, confidence] = s.split(':');
                return {
                    skillName: skillName?.trim(),
                    confidence: parseInt(confidence) || 0,
                    source: 'Resume'
                };
            }).filter(s => s.skillName);
        }

        res.json({
            skills,
            resumeTextLength: ResumeText?.length || 0,
            extractedYearsExperience: YearsOfExperience
        });
    } catch (err) {
        console.error("Fetch Extracted Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch extracted skills." });
    }
});

/**
 * @route   GET /api/candidates/profile
 * @desc    Get full candidate profile including consent and notification preferences
 * @access  Private (Candidate)
 */
router.get('/profile', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        // Get candidate basic info
        const candidate = await query(
            `SELECT c.*, u.Email, u.Username, u.LastLogin 
             FROM Candidates c 
             JOIN Users u ON c.UserID = u.UserID 
             WHERE c.UserID = ?`,
            [userID]
        );

        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }

        const c = candidate[0];

        // Get consent records (wrapped in try-catch for DB compatibility)
        let consents = [];
        try {
            const result = await query(
                `SELECT ConsentType, IsActive AS IsGranted, ExpiryDate FROM ConsentManagement WHERE CandidateID = ?`,
                [c.CandidateID]
            );
            consents = result || [];
        } catch (err) {
            console.log("ConsentManagement table not available:", err.message);
        }

        // Get notification preferences (wrapped in try-catch for DB compatibility)
        let notifications = [];
        try {
            const result = await query(
                `SELECT NotificationType, Platform FROM PushNotifications WHERE UserID = ?`,
                [userID]
            );
            notifications = result || [];
        } catch (err) {
            console.log("PushNotifications table not available:", err.message);
        }

        // Calculate profile completion score
        let filledFields = 0;
        const totalFields = 8; // FullName, Location, YearsOfExperience, LinkedInURL, Timezone, PreferredLocations, ResumeText, Skills
        if (c.FullName) filledFields++;
        if (c.Location) filledFields++;
        if (c.YearsOfExperience > 0) filledFields++;
        if (c.LinkedInURL) filledFields++;
        if (c.Timezone) filledFields++;
        if (c.PreferredLocations) filledFields++;
        if (c.ResumeText) filledFields++;

        const profileCompletionScore = Math.round((filledFields / totalFields) * 100);

        res.json({
            candidateID: c.CandidateID,
            fullName: c.FullName,
            email: c.Email,
            username: c.Username,
            location: c.Location,
            yearsOfExperience: c.YearsOfExperience,
            preferredLocations: c.PreferredLocations,
            linkedInURL: c.LinkedInURL,
            timezone: c.Timezone,
            lastLogin: c.LastLogin,
            profileCompletionScore,
            consents: consents || [],
            notifications: notifications || []
        });
    } catch (err) {
        console.error("Fetch Profile Error:", err.message);
        res.status(500).json({ error: "Failed to fetch profile." });
    }
});

/**
 * @route   GET /api/candidates/profile/extracted-skills
 * @desc    Get skills extracted from resume
 * @access  Private (Candidate)
 */
router.get('/profile/extracted-skills', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    try {
        const result = await query(
            "SELECT ExtractedSkills, ResumeText, YearsOfExperience FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        const { ExtractedSkills, ResumeText, YearsOfExperience } = result[0];

        // Parse ExtractedSkills from "Java:40,React:35,SQL:25" format
        let skills = [];
        if (ExtractedSkills) {
            skills = ExtractedSkills.split(',').map(s => {
                const [skillName, confidence] = s.split(':');
                return {
                    skillName: skillName?.trim(),
                    confidence: parseInt(confidence) || 0,
                    source: 'Resume'
                };
            }).filter(s => s.skillName);
        }

        res.json({
            skills,
            resumeTextLength: ResumeText?.length || 0,
            extractedYearsExperience: YearsOfExperience
        });
    } catch (err) {
        console.error("Fetch Extracted Skills Error:", err.message);
        res.status(500).json({ error: "Failed to fetch extracted skills." });
    }
});

/**
 * @route   PUT /api/candidates/profile
 * @desc    Update candidate profile
 * @access  Private (Candidate)
 */
router.put('/profile', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { fullName, location, yearsOfExperience, preferredLocations, linkedInURL, timezone } = req.body;

    try {
        const candidate = await query(
            "SELECT CandidateID FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }

        await query(
            `UPDATE Candidates 
             SET FullName = ?, Location = ?, YearsOfExperience = ?, 
                 PreferredLocations = ?, LinkedInURL = ?, Timezone = ?
             WHERE UserID = ?`,
            [fullName, location, yearsOfExperience || 0, preferredLocations, linkedInURL, timezone, userID]
        );

        res.json({ success: true, message: "Profile updated successfully." });
    } catch (err) {
        console.error("Update Profile Error:", err.message);
        res.status(500).json({ error: "Failed to update profile." });
    }
});

/**
 * @route   PUT /api/candidates/profile/consent
 * @desc    Update consent preferences
 * @access  Private (Candidate)
 */
router.put('/profile/consent', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { consentType, isGranted } = req.body;

    try {
        const candidate = await query(
            "SELECT CandidateID FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (candidate.length === 0) {
            return res.status(404).json({ error: "Candidate profile not found." });
        }

        const candidateID = candidate[0].CandidateID;

        // Check if consent table exists (wrapped in try-catch for DB compatibility)
        try {
            // Check if consent exists
            const existing = await query(
                "SELECT ConsentID FROM ConsentManagement WHERE CandidateID = ? AND ConsentType = ?",
                [candidateID, consentType]
            );

            if (existing.length > 0) {
                await query(
                    `UPDATE ConsentManagement SET IsActive = ?, GivenAt = GETDATE(), ExpiryDate = DATEADD(YEAR, 1, GETDATE()) 
                     WHERE CandidateID = ? AND ConsentType = ?`,
                    [isGranted ? 1 : 0, candidateID, consentType]
                );
            } else {
                await query(
                    `INSERT INTO ConsentManagement (CandidateID, ConsentType, IsActive, GivenAt, ExpiryDate, ConsentVersion) 
                     VALUES (?, ?, ?, GETDATE(), DATEADD(YEAR, 1, GETDATE()), 1)`,
                    [candidateID, consentType, isGranted ? 1 : 0]
                );
            }
            res.json({ success: true, message: "Consent preferences updated." });
        } catch (tableErr) {
            console.log("ConsentManagement table not available:", tableErr.message);
            res.json({ success: true, message: "Consent preferences saved (feature unavailable in current DB)." });
        }
    } catch (err) {
        console.error("Update Consent Error:", err.message);
        res.status(500).json({ error: "Failed to update consent." });
    }
});

// ============================================================================
// DOCUMENT UPLOAD ROUTES
// ============================================================================

// Configure multer for memory storage (store as buffer for VARBINARY)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Allowed: PDF, DOCX, JPG, PNG'));
        }
    }
});

/**
 * @route   POST /api/candidates/documents/upload
 * @desc    Upload a document (resume, cover letter, certificate)
 * @access  Private (Candidate)
 */
router.post('/documents/upload', protect, authorize(3), upload.single('file'), async (req, res) => {
    const userID = req.user.UserID;
    const { documentType } = req.body;

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (!documentType || !['Resume', 'CoverLetter', 'Certificate'].includes(documentType)) {
        return res.status(400).json({ error: 'Invalid document type. Must be Resume, CoverLetter, or Certificate.' });
    }

    try {
        // Get candidate ID
        const candidateResult = await query(
            "SELECT CandidateID FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const candidateID = candidateResult[0].CandidateID;
        const fileBuffer = req.file.buffer;
        const fileName = req.file.originalname;

        let result = {
            success: true,
            documentType
        };

        // If Resume, store in Candidates table and process with CLR
        if (documentType === 'Resume') {
            // Update or insert resume in Candidates table
            const existingResume = await query(
                "SELECT ResumeFile FROM Candidates WHERE CandidateID = ?",
                [candidateID]
            );

            if (existingResume.length > 0 && existingResume[0].ResumeFile) {
                // Replace existing resume - update directly
                await query(
                    "UPDATE Candidates SET ResumeFile = ?, ResumeFileName = ?, ResumeText = NULL, ExtractedSkills = NULL WHERE CandidateID = ?",
                    [fileBuffer, fileName, candidateID]
                );
            } else {
                // Insert new resume
                await query(
                    "UPDATE Candidates SET ResumeFile = ?, ResumeFileName = ? WHERE CandidateID = ?",
                    [fileBuffer, fileName, candidateID]
                );
            }

            // Process resume with Node.js (pdf-parse) instead of CLR
            try {
                const processResult = await processCandidateResume(candidateID);

                if (processResult.success) {
                    result.resumeProcessed = true;
                    result.resumeTextLength = processResult.textLength;
                    result.extractedSkills = processResult.extractedSkills;
                } else {
                    console.log("Resume processing failed:", processResult.error);
                    result.resumeProcessed = false;
                }
            } catch (procErr) {
                console.log("Resume processing error:", procErr.message);
                result.resumeProcessed = false;
            }
        }

        // Insert metadata into CandidateDocuments table
        try {
            // Check if document type already exists and delete
            const existingDoc = await query(
                "SELECT DocumentID FROM CandidateDocuments WHERE CandidateID = ? AND DocumentType = ?",
                [candidateID, documentType]
            );

            if (existingDoc.length > 0) {
                // Delete existing document metadata (resume binary stays in Candidates table)
                await query(
                    "DELETE FROM CandidateDocuments WHERE CandidateID = ? AND DocumentType = ?",
                    [candidateID, documentType]
                );
            }

            // Insert new document metadata (FilePath can be NULL since we're storing in DB)
            await query(
                "INSERT INTO CandidateDocuments (CandidateID, DocumentType, FilePath, UploadedAt) VALUES (?, ?, ?, GETDATE())",
                [candidateID, documentType, fileName]
            );
        } catch (docErr) {
            console.log("CandidateDocuments table not available:", docErr.message);
        }

        result.message = `${documentType} uploaded successfully.`;
        res.status(201).json(result);

    } catch (err) {
        console.error("Document Upload Error:", err.message);
        res.status(500).json({ error: "Failed to upload document." });
    }
});

/**
 * @route   GET /api/candidates/documents
 * @desc    Get all documents for the logged-in candidate
 * @access  Private (Candidate)
 */
router.get('/documents', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;

    try {
        // Get candidate ID
        const candidateResult = await query(
            "SELECT CandidateID FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const candidateID = candidateResult[0].CandidateID;

        // Get documents from CandidateDocuments table
        let documents = [];
        try {
            documents = await query(
                "SELECT DocumentID, DocumentType, FilePath, UploadedAt FROM CandidateDocuments WHERE CandidateID = ? ORDER BY UploadedAt DESC",
                [candidateID]
            );
        } catch (docErr) {
            console.log("CandidateDocuments table not available:", docErr.message);
        }

        // Also check if resume exists in Candidates table
        const resumeInfo = await query(
            "SELECT ResumeFileName, ResumeText, ExtractedSkills FROM Candidates WHERE CandidateID = ?",
            [candidateID]
        );

        if (resumeInfo[0]?.ResumeFileName) {
            // Check if Resume already in documents list
            const hasResume = documents.some(d => d.DocumentType === 'Resume');
            if (!hasResume) {
                documents.unshift({
                    DocumentType: 'Resume',
                    FilePath: resumeInfo[0].ResumeFileName,
                    UploadedAt: null,
                    isFromCandidates: true
                });
            }
        }

        res.json(documents);
    } catch (err) {
        console.error("Get Documents Error:", err.message);
        res.status(500).json({ error: "Failed to fetch documents." });
    }
});

/**
 * @route   GET /api/candidates/documents/resume/download
 * @desc    Download the candidate's resume
 * @access  Private (Candidate)
 */
router.get('/documents/resume/download', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;

    try {
        const candidateResult = await query(
            "SELECT CandidateID, ResumeFile, ResumeFileName FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const { ResumeFile, ResumeFileName } = candidateResult[0];

        if (!ResumeFile) {
            return res.status(404).json({ error: 'No resume found.' });
        }

        // Determine content type from filename
        let contentType = 'application/octet-stream';
        if (ResumeFileName?.endsWith('.pdf')) contentType = 'application/pdf';
        else if (ResumeFileName?.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${ResumeFileName}"`);
        res.send(ResumeFile);
    } catch (err) {
        console.error("Download Resume Error:", err.message);
        res.status(500).json({ error: "Failed to download resume." });
    }
});

/**
 * @route   DELETE /api/candidates/documents/:documentType
 * @desc    Delete a document
 * @access  Private (Candidate)
 */
router.delete('/documents/:documentType', protect, authorize(3), async (req, res) => {
    const userID = req.user.UserID;
    const { documentType } = req.params;

    if (!['Resume', 'CoverLetter', 'Certificate'].includes(documentType)) {
        return res.status(400).json({ error: 'Invalid document type.' });
    }

    try {
        const candidateResult = await query(
            "SELECT CandidateID FROM Candidates WHERE UserID = ?",
            [userID]
        );

        if (candidateResult.length === 0) {
            return res.status(404).json({ error: 'Candidate profile not found.' });
        }

        const candidateID = candidateResult[0].CandidateID;

        // If Resume, clear from Candidates table
        if (documentType === 'Resume') {
            await query(
                "UPDATE Candidates SET ResumeFile = NULL, ResumeFileName = NULL, ResumeText = NULL, ExtractedSkills = NULL WHERE CandidateID = ?",
                [candidateID]
            );
        }

        // Delete from CandidateDocuments table
        try {
            await query(
                "DELETE FROM CandidateDocuments WHERE CandidateID = ? AND DocumentType = ?",
                [candidateID, documentType]
            );
        } catch (docErr) {
            console.log("CandidateDocuments table not available:", docErr.message);
        }

        res.json({ success: true, message: `${documentType} deleted successfully.` });
    } catch (err) {
        console.error("Delete Document Error:", err.message);
        res.status(500).json({ error: "Failed to delete document." });
    }
});

// ============================================================================
// RECRUITER: VIEW CANDIDATE DOCUMENTS
// ============================================================================

/**
 * @route   GET /api/candidates/:candidateId/documents
 * @desc    Get documents for a specific candidate (Recruiter/Admin only)
 * @access  Private (Recruiter/Admin)
 */
router.get('/:candidateId/documents', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const userID = req.user.UserID;

    try {
        // Verify recruiter exists
        const recruiterCheck = await query(
            "SELECT RecruiterID FROM Recruiters WHERE UserID = ?",
            [userID]
        );

        // Get candidate's documents
        let documents = [];
        try {
            documents = await query(
                "SELECT DocumentID, DocumentType, FilePath, UploadedAt FROM CandidateDocuments WHERE CandidateID = ? ORDER BY UploadedAt DESC",
                [candidateId]
            );
        } catch (docErr) {
            console.log("CandidateDocuments table not available:", docErr.message);
        }

        // Check if resume exists
        const resumeInfo = await query(
            "SELECT ResumeFileName FROM Candidates WHERE CandidateID = ?",
            [candidateId]
        );

        if (resumeInfo[0]?.ResumeFileName) {
            const hasResume = documents.some(d => d.DocumentType === 'Resume');
            if (!hasResume) {
                documents.unshift({
                    DocumentType: 'Resume',
                    FilePath: resumeInfo[0].ResumeFileName,
                    UploadedAt: null
                });
            }
        }

        res.json(documents);
    } catch (err) {
        console.error("Get Candidate Documents Error:", err.message);
        res.status(500).json({ error: "Failed to fetch candidate documents." });
    }
});

/**
 * @route   GET /api/candidates/:candidateId/documents/resume/download
 * @desc    Download a candidate's resume (Recruiter/Admin only)
 * @access  Private (Recruiter/Admin)
 */
router.get('/:candidateId/documents/resume/download', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;

    try {
        const resumeData = await query(
            "SELECT ResumeFile, ResumeFileName FROM Candidates WHERE CandidateID = ?",
            [candidateId]
        );

        if (resumeData.length === 0 || !resumeData[0].ResumeFile) {
            return res.status(404).json({ error: 'Resume not found.' });
        }

        const { ResumeFile, ResumeFileName } = resumeData[0];

        // Determine content type
        let contentType = 'application/octet-stream';
        if (ResumeFileName?.endsWith('.pdf')) contentType = 'application/pdf';
        else if (ResumeFileName?.endsWith('.docx')) contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${ResumeFileName}"`);
        res.send(ResumeFile);
    } catch (err) {
        console.error("Download Candidate Resume Error:", err.message);
        res.status(500).json({ error: "Failed to download resume." });
    }
});

module.exports = router;
