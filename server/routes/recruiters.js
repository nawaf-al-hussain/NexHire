const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/recruiters/talent-pool
 * @desc    Get all candidates with integrated insights
 * @access  Private (Recruiter/Admin)
 * 
 * Returns: CandidateID, FullName, Location, YearsOfExperience, ResumeScore, GhostingRisk,
 *          Skills, GamificationPoints, GamificationLevel, StreakDays, RemotePreference, ReferralSource
 */
router.get('/talent-pool', protect, authorize([1, 2]), async (req, res) => {
    const { search, location, minExperience } = req.query;

    try {
        // Base query - using try-catch for each join to handle missing tables gracefully
        let queryStr = `
            SELECT 
                c.CandidateID, 
                c.FullName, 
                c.Location, 
                c.YearsOfExperience,
                (SELECT STRING_AGG(s.SkillName, ', ') 
                 FROM CandidateSkills cs 
                 JOIN Skills s ON cs.SkillID = s.SkillID 
                 WHERE cs.CandidateID = c.CandidateID) as Skills
            FROM Candidates c
            WHERE c.UserID IN (SELECT UserID FROM Users WHERE IsActive = 1)
        `;

        const params = [];

        // Search by name
        if (search) {
            queryStr += ` AND c.FullName LIKE ?`;
            params.push(`%${search}%`);
        }

        // Filter by location
        if (location) {
            queryStr += ` AND c.Location LIKE ?`;
            params.push(`%${location}%`);
        }

        // Filter by minimum experience
        if (minExperience) {
            queryStr += ` AND c.YearsOfExperience >= ?`;
            params.push(parseInt(minExperience));
        }

        queryStr += ` ORDER BY c.FullName ASC`;

        const candidates = await query(queryStr, params);

        // Get additional data separately to avoid join errors
        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];

            // Resume Score
            try {
                const rs = await query(`SELECT TOP 1 ResumeQualityScore FROM ResumeInsights WHERE CandidateID = ?`, [c.CandidateID]);
                c.ResumeScore = rs[0]?.ResumeQualityScore || 0;
            } catch { c.ResumeScore = 0; }

            // Ghosting Risk
            try {
                const gr = await query(`SELECT TOP 1 OverallRiskLevel FROM vw_GhostingRiskDashboard WHERE CandidateID = ?`, [c.CandidateID]);
                c.GhostingRisk = gr[0]?.OverallRiskLevel || 'Low';
            } catch { c.GhostingRisk = 'Low'; }

            // Gamification
            try {
                const gm = await query(`SELECT TOP 1 Points, Level, StreakDays FROM CandidateGamification WHERE CandidateID = ?`, [c.CandidateID]);
                c.GamificationPoints = gm[0]?.Points || 0;
                c.GamificationLevel = gm[0]?.Level || 1;
                c.StreakDays = gm[0]?.StreakDays || 0;
            } catch {
                c.GamificationPoints = 0;
                c.GamificationLevel = 1;
                c.StreakDays = 0;
            }

            // Remote Preference
            try {
                const rp = await query(`SELECT TOP 1 RemotePreference FROM CandidateLocationPreferences WHERE CandidateID = ?`, [c.CandidateID]);
                c.RemotePreference = rp[0]?.RemotePreference || null;
            } catch { c.RemotePreference = null; }

            // Referral Source - check if candidate was referred
            try {
                const rf = await query(`SELECT TOP 1 RelationshipType FROM ReferralNetwork WHERE ReferredCandidateID = ?`, [c.CandidateID]);
                c.ReferralSource = rf[0]?.RelationshipType || null;
            } catch { c.ReferralSource = null; }
        }

        res.json(candidates);
    } catch (err) {
        console.error("Talent Pool Fetch Error:", err.message);
        res.status(500).json({ error: `Failed to fetch talent pool: ${err.message}` });
    }
});

/**
 * @route   POST /api/recruiters/search
 * @desc    Search candidates by name - returns full candidate data
 * @access  Private (Recruiter/Admin)
 */
router.post('/search', protect, authorize([1, 2]), async (req, res) => {
    const { name, useFuzzy, threshold } = req.body;
    if (!name) return res.status(400).json({ error: "Search name is required." });

    try {
        let candidateIDs = [];

        if (useFuzzy) {
            // Try fuzzy search with stored procedure
            try {
                console.log("Running fuzzy search:", name, "threshold:", threshold || 0.6);
                const fuzzyResults = await query(
                    "EXEC sp_FuzzySearchCandidates @SearchName=?, @Threshold=?",
                    [name, threshold || 0.85]
                );
                console.log("Fuzzy results:", fuzzyResults);
                candidateIDs = fuzzyResults.map(r => r.CandidateID);
            } catch (fuzzyErr) {
                console.log("Fuzzy SP failed, using LIKE:", fuzzyErr.message);
                // Fallback to LIKE
                const likeResults = await query(`
                    SELECT CandidateID FROM Candidates WHERE FullName LIKE ?
                `, [`%${name}%`]);
                candidateIDs = likeResults.map(r => r.CandidateID);
            }
        } else {
            // Regular LIKE search
            const likeResults = await query(`
                SELECT CandidateID FROM Candidates WHERE FullName LIKE ?
            `, [`%${name}%`]);
            candidateIDs = likeResults.map(r => r.CandidateID);
        }

        if (candidateIDs.length === 0) {
            return res.json([]);
        }

        // Get full candidate data for matched IDs
        const placeholders = candidateIDs.map(() => '?').join(',');
        const candidates = await query(`
            SELECT 
                c.CandidateID, 
                c.FullName, 
                c.Location, 
                c.YearsOfExperience,
                (SELECT STRING_AGG(s.SkillName, ', ') 
                 FROM CandidateSkills cs 
                 JOIN Skills s ON cs.SkillID = s.SkillID 
                 WHERE cs.CandidateID = c.CandidateID) as Skills
            FROM Candidates c
            WHERE c.CandidateID IN (${placeholders})
        `, candidateIDs);

        // Get additional data for each candidate
        for (let i = 0; i < candidates.length; i++) {
            const c = candidates[i];
            try {
                const rs = await query(`SELECT TOP 1 ResumeQualityScore FROM ResumeInsights WHERE CandidateID = ?`, [c.CandidateID]);
                c.ResumeScore = rs[0]?.ResumeQualityScore || 0;
            } catch { c.ResumeScore = 0; }
            try {
                const gr = await query(`SELECT TOP 1 OverallRiskLevel FROM vw_GhostingRiskDashboard WHERE CandidateID = ?`, [c.CandidateID]);
                c.GhostingRisk = gr[0]?.OverallRiskLevel || 'Low';
            } catch { c.GhostingRisk = 'Low'; }
            try {
                const gm = await query(`SELECT TOP 1 Points, Level, StreakDays FROM CandidateGamification WHERE CandidateID = ?`, [c.CandidateID]);
                c.GamificationPoints = gm[0]?.Points || 0;
                c.GamificationLevel = gm[0]?.Level || 1;
                c.StreakDays = gm[0]?.StreakDays || 0;
            } catch { c.GamificationPoints = 0; c.GamificationLevel = 1; c.StreakDays = 0; }
            try {
                const rp = await query(`SELECT TOP 1 RemotePreference FROM CandidateLocationPreferences WHERE CandidateID = ?`, [c.CandidateID]);
                c.RemotePreference = rp[0]?.RemotePreference || null;
            } catch { c.RemotePreference = null; }
            try {
                const rf = await query(`SELECT TOP 1 RelationshipType FROM ReferralNetwork WHERE ReferredCandidateID = ?`, [c.CandidateID]);
                c.ReferralSource = rf[0]?.RelationshipType || null;
            } catch { c.ReferralSource = null; }
        }

        console.log("Search found:", candidates.length, "candidates");
        res.json(candidates);
    } catch (err) {
        console.error("Search Error:", err.message);
        res.status(500).json({ error: "Search failed: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/initiate-pipeline
 * @desc    Invite a candidate to join a job's pipeline (creates application in 'Invited' state)
 * @access  Private (Recruiter)
 */
router.post('/initiate-pipeline', protect, authorize(2), async (req, res) => {
    const { jobID, candidateID } = req.body;

    if (!jobID || !candidateID) {
        return res.status(400).json({ error: "Job ID and Candidate ID are required." });
    }

    try {
        // 1. Check if application already exists
        const existing = await query(
            "SELECT StatusID FROM Applications WHERE JobID = ? AND CandidateID = ? AND IsDeleted = 0",
            [jobID, candidateID]
        );

        if (existing.length > 0) {
            const status = existing[0].StatusID;
            // If already applied (1), screening (2), interview (3), or hired (4), return error
            if ([1, 2, 3, 4].includes(status)) {
                return res.status(400).json({ error: "Candidate is already in the pipeline for this job." });
            }
            // If invited (7), screening (2), interview (3), or hired (4), return error
            if (status === 7) {
                return res.status(400).json({ error: "Candidate has already been invited to this job." });
            }
            // If rejected (5) or withdrawn (6), we allow "Re-inviting" by updating the record
            await query(
                "UPDATE Applications SET StatusID = 7, AppliedDate = GETDATE() WHERE JobID = ? AND CandidateID = ?",
                [jobID, candidateID]
            );
        } else {
            // 2. Create new application in 'Invited' (ID 7) state
            await query(
                "INSERT INTO Applications (JobID, CandidateID, StatusID) VALUES (?, ?, 7)",
                [jobID, candidateID]
            );
        }

        res.status(201).json({ message: "Invitation sent successfully. Candidate notified." });
    } catch (err) {
        console.error("Initiate Pipeline Error:", err.message);
        res.status(500).json({ error: `Failed to initiate pipeline: ${err.message}` });
    }
});

/**
 * @route   GET /api/recruiters/engagement
 * @desc    Get candidate engagement scoring - interview confirmations vs scheduled, engagement rate
 * @access  Private (Recruiter/Admin)
 * 
 * Uses vw_CandidateEngagement view
 */
router.get('/engagement', protect, authorize([1, 2]), async (req, res) => {
    try {
        const engagement = await query(`
            SELECT * FROM vw_CandidateEngagement
            ORDER BY EngagementRate DESC
        `);
        res.json(engagement);
    } catch (err) {
        console.error("Fetch Engagement Error:", err.message);
        res.status(500).json({ error: "Failed to fetch engagement data." });
    }
});

/**
 * @route   GET /api/recruiters/platform-sync
 * @desc    Get external platform sync status
 * @access  Private (Recruiter/Admin)
 * 
 * ExternalPlatformSync columns: SyncID, Platform, CandidateID, JobID, ProfileURL, JobURL,
 * LastSyncedAt, SyncStatus, DataRetrieved, EndorsementCount, ConnectionCount, PlatformReputationScore
 */
router.get('/platform-sync', protect, authorize([1, 2]), async (req, res) => {
    try {
        const platformSync = await query(`
            SELECT 
                eps.SyncID,
                eps.Platform,
                eps.CandidateID,
                c.FullName,
                eps.JobID,
                j.JobTitle,
                eps.ProfileURL,
                eps.JobURL,
                eps.LastSyncedAt,
                eps.SyncStatus,
                eps.EndorsementCount,
                eps.ConnectionCount,
                eps.PlatformReputationScore,
                eps.ErrorMessage
            FROM ExternalPlatformSync eps
            LEFT JOIN Candidates c ON eps.CandidateID = c.CandidateID
            LEFT JOIN JobPostings j ON eps.JobID = j.JobID
            ORDER BY eps.LastSyncedAt DESC
        `);
        res.json(platformSync);
    } catch (err) {
        console.error("Fetch Platform Sync Error:", err.message);
        res.status(500).json({ error: "Failed to fetch platform sync data." });
    }
});

/**
 * @route   POST /api/recruiters/platform-sync
 * @desc    Trigger sync to external platform (LinkedIn, Indeed, Glassdoor)
 * @access  Private (Recruiter/Admin)
 */
router.post('/platform-sync', protect, authorize([1, 2]), async (req, res) => {
    const { platform, candidateID, jobID, syncDirection } = req.body;

    if (!platform || !syncDirection) {
        return res.status(400).json({ error: "Platform and syncDirection are required." });
    }

    try {
        // Insert sync request (actual sync would be handled by background service)
        const result = await query(`
            INSERT INTO ExternalPlatformSync 
            (Platform, CandidateID, JobID, SyncDirection, SyncStatus, NextSyncAttempt)
            VALUES (?, ?, ?, ?, 'Pending', DATEADD(MINUTE, 5, GETDATE()))
        `, [platform, candidateID || null, jobID || null, syncDirection]);

        res.status(201).json({
            message: `Sync to ${platform} queued successfully.`,
            syncStatus: "Pending"
        });
    } catch (err) {
        console.error("Platform Sync Error:", err.message);
        res.status(500).json({ error: "Failed to initiate platform sync." });
    }
});

/**
 * @route   POST /api/recruiters/screening/run
 * @desc    Run automated screening for applications to a job
 * @access  Private (Recruiter/Admin)
 * 
 * ScreeningBotDecisions columns: DecisionID, ApplicationID, Decision, Confidence, CriteriaEvaluated, 
 * Score, ThresholdUsed, ModelVersion, DecisionDate, HumanOverride, OverrideReason, FinalDecision
 */
router.post('/screening/run', protect, authorize([1, 2]), async (req, res) => {
    const { jobID, threshold } = req.body;

    if (!jobID) {
        return res.status(400).json({ error: "JobID is required." });
    }

    const thresholdVal = threshold || 70;

    try {
        // Get all applications for the job with status Applied (1)
        const applications = await query(`
            SELECT a.ApplicationID, a.CandidateID, a.JobID, c.FullName, c.YearsOfExperience, c.ExtractedSkills,
                   j.MinExperience
            FROM Applications a
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            WHERE a.JobID = ? AND a.StatusID = 1 AND a.IsDeleted = 0
        `, [jobID]);

        console.log(`Found ${applications.length} applications to screen for job ${jobID}`);

        const results = [];

        for (const app of applications) {
            try {
                // Try stored procedure first
                try {
                    await query("EXEC sp_AutoScreenApplicationEnhanced ?, ?", [app.ApplicationID, thresholdVal]);
                } catch (spErr) {
                    console.log(`SP failed for app ${app.ApplicationID}, using inline logic:`, spErr.message);
                    // Fallback: inline screening logic
                    const candidateSkills = await query(`
                        SELECT cs.SkillID, cs.ProficiencyLevel, js.MinProficiency, js.IsMandatory
                        FROM CandidateSkills cs
                        JOIN JobSkills js ON cs.SkillID = js.SkillID
                        WHERE js.JobID = ? AND cs.CandidateID = ?
                    `, [app.JobID, app.CandidateID]);

                    let score = 0;
                    let maxScore = 0;
                    let mandatoryMet = 0;
                    let mandatoryTotal = 0;
                    const criteria = [];

                    // Get mandatory skills count
                    const mandatorySkills = await query(`
                        SELECT COUNT(*) as cnt FROM JobSkills WHERE JobID = ? AND IsMandatory = 1
                    `, [app.JobID]);
                    mandatoryTotal = mandatorySkills[0]?.cnt || 0;

                    // Calculate score based on skills
                    for (const skill of candidateSkills) {
                        maxScore += 10;
                        if (skill.ProficiencyLevel >= skill.MinProficiency) {
                            score += 10;
                            if (skill.IsMandatory) mandatoryMet++;
                            criteria.push(`${skill.SkillID}: meets requirement (L${skill.ProficiencyLevel} >= L${skill.MinProficiency})`);
                        } else {
                            score += Math.max(0, skill.ProficiencyLevel);
                            criteria.push(`${skill.SkillID}: partial match (L${skill.ProficiencyLevel} < L${skill.MinProficiency})`);
                        }
                    }

                    // Add experience score
                    if (app.YearsOfExperience >= app.MinExperience) {
                        score += 20;
                        criteria.push(`Experience: meets requirement (${app.YearsOfExperience} >= ${app.MinExperience})`);
                    } else {
                        criteria.push(`Experience: below requirement (${app.YearsOfExperience} < ${app.MinExperience})`);
                    }
                    maxScore += 20;

                    // Calculate percentage
                    const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

                    // Determine decision
                    let decision = 'ManualReview';
                    if (finalScore >= thresholdVal && mandatoryMet === mandatoryTotal) {
                        decision = 'Pass';
                    } else if (finalScore < thresholdVal / 2) {
                        decision = 'Fail';
                    }

                    // Insert decision
                    await query(`
                        INSERT INTO ScreeningBotDecisions 
                        (ApplicationID, Decision, Confidence, CriteriaEvaluated, Score, ThresholdUsed, ModelVersion, DecisionDate)
                        VALUES (?, ?, ?, ?, ?, ?, 'InlineV1', GETDATE())
                    `, [app.ApplicationID, decision, finalScore / 100, JSON.stringify(criteria), finalScore, thresholdVal]);
                }

                // Get the screening decision
                const decision = await query(`
                    SELECT TOP 1 * FROM ScreeningBotDecisions 
                    WHERE ApplicationID = ? ORDER BY DecisionDate DESC
                `, [app.ApplicationID]);

                console.log(`Screening result for app ${app.ApplicationID}:`, decision[0]);

                results.push({
                    applicationID: app.ApplicationID,
                    candidateName: app.FullName,
                    yearsExperience: app.YearsOfExperience,
                    screeningResult: decision[0] || null
                });
            } catch (screenErr) {
                console.error("Screening Error for app:", app.ApplicationID, screenErr.message);
                results.push({
                    applicationID: app.ApplicationID,
                    candidateName: app.FullName,
                    yearsExperience: app.YearsOfExperience,
                    screeningResult: null,
                    error: screenErr.message
                });
            }
        }

        res.json({
            message: `Screening completed for ${results.length} applications.`,
            results: results
        });
    } catch (err) {
        console.error("Run Screening Error:", err.message);
        res.status(500).json({ error: "Failed to run screening: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/screening/decisions
 * @desc    Get screening decisions for a job
 * @access  Private (Recruiter/Admin)
 */
router.get('/screening/decisions', protect, authorize([1, 2]), async (req, res) => {
    const { jobID } = req.query;

    try {
        let queryStr = `
            SELECT 
                sbd.*,
                a.ApplicationID,
                c.CandidateID,
                c.FullName,
                j.JobID,
                j.JobTitle,
                s.StatusName AS CurrentStatus
            FROM ScreeningBotDecisions sbd
            JOIN Applications a ON sbd.ApplicationID = a.ApplicationID
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            JOIN ApplicationStatus s ON a.StatusID = s.StatusID
        `;

        let params = [];
        if (jobID) {
            queryStr += ` WHERE j.JobID = ?`;
            params.push(jobID);
        }

        queryStr += ` ORDER BY sbd.DecisionDate DESC`;

        const decisions = await query(queryStr, params);
        res.json(decisions);
    } catch (err) {
        console.error("Fetch Screening Decisions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch screening decisions." });
    }
});

/**
 * @route   POST /api/recruiters/screening/override
 * @desc    Override a screening decision (human override)
 * @access  Private (Recruiter/Admin)
 */
router.post('/screening/override', protect, authorize([1, 2]), async (req, res) => {
    const { decisionID, overrideReason, finalDecision } = req.body;

    if (!decisionID || !finalDecision) {
        return res.status(400).json({ error: "DecisionID and FinalDecision are required." });
    }

    try {
        await query(`
            UPDATE ScreeningBotDecisions 
            SET HumanOverride = 1, OverrideReason = ?, FinalDecision = ?
            WHERE DecisionID = ?
        `, [overrideReason || 'Manual override', finalDecision, decisionID]);

        // Also update the application status based on final decision
        let newStatusID = 1; // Default to Applied
        if (finalDecision === 'Pass') newStatusID = 2; // Screening
        else if (finalDecision === 'Fail') newStatusID = 5; // Rejected
        else if (finalDecision === 'ManualReview') newStatusID = 1; // Stay in Applied

        await query(`
            UPDATE Applications 
            SET StatusID = ?, RejectionReason = 'screening override: ' + ?
            WHERE ApplicationID = (
                SELECT ApplicationID FROM ScreeningBotDecisions WHERE DecisionID = ?
            )
        `, [newStatusID, overrideReason || 'No reason provided', decisionID]);

        res.json({ message: "Screening decision overridden successfully." });
    } catch (err) {
        console.error("Override Screening Error:", err.message);
        res.status(500).json({ error: "Failed to override screening decision." });
    }
});

/**
 * @route   POST /api/recruiters/screening/advance
 * @desc    Advance passed candidates to next stage (Screening or Interview)
 * @access  Private (Recruiter/Admin)
 */
router.post('/screening/advance', protect, authorize([1, 2]), async (req, res) => {
    const { applicationIDs, targetStage } = req.body; // targetStage: 'Screening' or 'Interview'

    if (!applicationIDs || !Array.isArray(applicationIDs) || applicationIDs.length === 0) {
        return res.status(400).json({ error: "ApplicationIDs array is required." });
    }

    if (!targetStage || !['Screening', 'Interview'].includes(targetStage)) {
        return res.status(400).json({ error: "Target stage must be 'Screening' or 'Interview'." });
    }

    const newStatusID = targetStage === 'Screening' ? 2 : 3;

    try {
        const results = [];

        for (const applicationID of applicationIDs) {
            // Get current status
            const current = await query(`
                SELECT a.StatusID, s.StatusName FROM Applications a
                JOIN ApplicationStatus s ON a.StatusID = s.StatusID
                WHERE a.ApplicationID = ?
            `, [applicationID]);

            if (current.length === 0) {
                results.push({ applicationID, success: false, error: "Application not found" });
                continue;
            }

            const currentStatusID = current[0].StatusID;

            // Can only advance from Applied(1) or Screening(2)
            if (currentStatusID !== 1 && currentStatusID !== 2) {
                results.push({
                    applicationID,
                    success: false,
                    error: `Cannot advance from ${current[0].StatusName} status`
                });
                continue;
            }

            // Check if already at or past target stage
            if (targetStage === 'Screening' && currentStatusID >= 2) {
                results.push({ applicationID, success: false, error: "Already at Screening stage" });
                continue;
            }
            if (targetStage === 'Interview' && currentStatusID >= 3) {
                results.push({ applicationID, success: false, error: "Already at Interview stage" });
                continue;
            }

            // Update status
            await query(`
                UPDATE Applications 
                SET StatusID = ?, StatusChangedAt = GETDATE()
                WHERE ApplicationID = ?
            `, [newStatusID, applicationID]);

            // Record in history
            await query(`
                INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, ChangedAt, Notes)
                VALUES (?, ?, ?, ?, GETDATE(), 'Advanced from Screening Bot')
            `, [applicationID, currentStatusID, newStatusID, req.user.UserID]);

            results.push({
                applicationID,
                success: true,
                message: `Advanced to ${targetStage}`
            });
        }

        const successCount = results.filter(r => r.success).length;
        res.json({
            message: `Advanced ${successCount} of ${applicationIDs.length} candidates to ${targetStage}.`,
            results: results
        });
    } catch (err) {
        console.error("Advance Screening Error:", err.message);
        res.status(500).json({ error: "Failed to advance candidates: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/screening/reject
 * @desc    Reject candidates directly from screening results
 * @access  Private (Recruiter/Admin)
 */
router.post('/screening/reject', protect, authorize([1, 2]), async (req, res) => {
    const { applicationIDs, reason } = req.body;

    if (!applicationIDs || !Array.isArray(applicationIDs) || applicationIDs.length === 0) {
        return res.status(400).json({ error: "ApplicationIDs array is required." });
    }

    try {
        const results = [];

        for (const applicationID of applicationIDs) {
            // Get current status
            const current = await query(`
                SELECT a.StatusID, s.StatusName FROM Applications a
                JOIN ApplicationStatus s ON a.StatusID = s.StatusID
                WHERE a.ApplicationID = ?
            `, [applicationID]);

            if (current.length === 0) {
                results.push({ applicationID, success: false, error: "Application not found" });
                continue;
            }

            const currentStatusID = current[0].StatusID;

            // Can only reject from Applied(1), Screening(2), or Interview(3)
            if (currentStatusID > 3) {
                results.push({
                    applicationID,
                    success: false,
                    error: `Cannot reject from ${current[0].StatusName} status`
                });
                continue;
            }

            // Update status to Rejected(5)
            await query(`
                UPDATE Applications 
                SET StatusID = 5, StatusChangedAt = GETDATE(), RejectionReason = ?
                WHERE ApplicationID = ?
            `, [reason || 'Rejected from Screening Bot', applicationID]);

            // Record in history
            await query(`
                INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, ChangedAt, Notes)
                VALUES (?, ?, 5, ?, GETDATE(), 'Rejected from Screening Bot')
            `, [applicationID, currentStatusID, req.user.UserID]);

            results.push({
                applicationID,
                success: true,
                message: "Rejected"
            });
        }

        const successCount = results.filter(r => r.success).length;
        res.json({
            message: `Rejected ${successCount} of ${applicationIDs.length} candidates.`,
            results: results
        });
    } catch (err) {
        console.error("Reject Screening Error:", err.message);
        res.status(500).json({ error: "Failed to reject candidates: " + err.message });
    }
});

// =========================================
// MARKET ALERTS - Personalized for Recruiter
// =========================================
router.get('/market-alerts', protect, authorize(2), async (req, res) => {
    const userID = req.user.UserID;

    try {
        // Get RecruiterID from UserID
        const recruiterCheck = await query("SELECT RecruiterID, Department FROM Recruiters WHERE UserID = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Not a recruiter." });
        }
        const recruiterId = recruiterCheck[0].RecruiterID;
        const recruiterLocation = recruiterCheck[0].Department;

        // Try stored procedure first
        try {
            const spResult = await query("EXEC sp_GenerateMarketAlerts ?", [recruiterId]);
            if (spResult && spResult.length > 0) {
                return res.json(spResult);
            }
        } catch (spErr) {
            console.log("SP failed, using fallback query:", spErr.message);
        }

        // Fallback: Query MarketIntelligence directly for recruiter's location
        let alerts = [];

        if (recruiterLocation) {
            alerts = await query(`
                SELECT 
                    CASE WHEN mi.SalaryTrend IN ('Rising','Falling') THEN 'Salary Alert' ELSE 'Demand Alert' END AS AlertType,
                    mi.SkillID,
                    s.SkillName,
                    mi.Location,
                    mi.DemandScore,
                    mi.SupplyScore,
                    mi.DemandScore - mi.SupplyScore AS ImbalanceScore,
                    mi.SalaryTrend,
                    mi.AvgSalary,
                    CONCAT('Alert for ', s.SkillName, ' in ', mi.Location, ': Trend is ', mi.SalaryTrend,
                           '. Avg: ', FORMAT(mi.AvgSalary,'N2'), '. Imbalance: ', (mi.DemandScore - mi.SupplyScore)) AS Description,
                    CASE
                        WHEN (mi.DemandScore - mi.SupplyScore) > 30 THEN 5
                        WHEN (mi.DemandScore - mi.SupplyScore) > 15 THEN 3
                        ELSE 2
                    END AS Severity,
                    GETDATE() AS TriggeredAt,
                    DATEADD(DAY, 30, GETDATE()) AS ExpiresAt
                FROM MarketIntelligence mi
                JOIN Skills s ON mi.SkillID = s.SkillID
                WHERE mi.Location = ?
                  AND mi.LastUpdated > DATEADD(DAY, -14, GETDATE())
                ORDER BY Severity DESC
            `, [recruiterLocation]);
        }

        // If still no alerts, get general market data
        if (alerts.length === 0) {
            alerts = await query(`
                SELECT TOP 20
                    CASE WHEN mi.SalaryTrend IN ('Rising','Falling') THEN 'Salary Alert' ELSE 'Demand Alert' END AS AlertType,
                    mi.SkillID,
                    s.SkillName,
                    mi.Location,
                    mi.DemandScore,
                    mi.SupplyScore,
                    mi.DemandScore - mi.SupplyScore AS ImbalanceScore,
                    mi.SalaryTrend,
                    mi.AvgSalary,
                    CONCAT('Market Alert for ', s.SkillName, ' in ', mi.Location, ': Trend is ', mi.SalaryTrend,
                           '. Avg: ', FORMAT(mi.AvgSalary,'N2')) AS Description,
                    CASE
                        WHEN (mi.DemandScore - mi.SupplyScore) > 30 THEN 5
                        WHEN (mi.DemandScore - mi.SupplyScore) > 15 THEN 3
                        ELSE 2
                    END AS Severity,
                    GETDATE() AS TriggeredAt,
                    DATEADD(DAY, 30, GETDATE()) AS ExpiresAt
                FROM MarketIntelligence mi
                JOIN Skills s ON mi.SkillID = s.SkillID
                WHERE mi.LastUpdated > DATEADD(DAY, -14, GETDATE())
                ORDER BY mi.DemandScore DESC, Severity DESC
            `);
        }

        res.json(alerts);
    } catch (err) {
        console.error("Market Alerts Error:", err.message);
        res.status(500).json({ error: "Failed to fetch market alerts: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/candidate-profile/:candidateId
 * @desc    Get comprehensive candidate profile data for modal
 * @access  Private (Recruiter/Admin)
 * 
 * Aggregates data from multiple sources:
 * - Basic info (Candidates table)
 * - Resume Insights (ResumeInsights table)
 * - Skill Verification Status (vw_SkillVerificationStatus view)
 * - Engagement Metrics (vw_CandidateEngagement view)
 * - Ghosting Risk (vw_GhostingRiskDashboard view)
 * - Remote Compatibility (vw_RemoteCompatibilityMatrix view)
 * - Career Path Insights (vw_CareerPathInsights view)
 * - Gamification (CandidateGamification table)
 * - Predictions (AI_Predictions table)
 * - Blockchain Verifications (BlockchainVerifications table)
 */
router.get('/candidate-profile/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;

    if (!candidateId) {
        return res.status(400).json({ error: "Candidate ID is required." });
    }

    try {
        const profile = {
            basicInfo: null,
            resumeInsights: null,
            skillVerification: [],
            engagement: null,
            ghostingRisk: null,
            remoteCompatibility: null,
            careerPath: null,
            gamification: null,
            predictions: [],
            blockchainVerifications: [],
            applications: [],
            interviews: []
        };

        // 1. Basic Info
        try {
            const basic = await query(`
                SELECT 
                    c.CandidateID,
                    c.FullName,
                    c.Location,
                    c.YearsOfExperience,
                    c.ResumeText,
                    c.ExtractedSkills,
                    c.CreatedAt,
                    u.Email,
                    u.Username
                FROM Candidates c
                LEFT JOIN Users u ON c.UserID = u.UserID
                WHERE c.CandidateID = ?
            `, [candidateId]);
            profile.basicInfo = basic[0] || null;
        } catch (err) {
            console.log("Basic info error:", err.message);
        }

        // 2. Resume Insights
        try {
            const resume = await query(`
                SELECT
                    ResumeQualityScore,
                    EducationInstitutions,
                    Certifications,
                    TechnologiesMentioned AS TechStack,
                    LeadershipTermsCount AS LeadershipExperience,
                    NLPProcessedAt AS LastAnalyzedAt
                FROM ResumeInsights
                WHERE CandidateID = ?
            `, [candidateId]);
            profile.resumeInsights = resume[0] || null;
        } catch (err) {
            console.log("Resume insights error:", err.message);
        }

        // 3. Skill Verification Status
        try {
            const skills = await query(`
                SELECT 
                    SkillName,
                    ClaimedLevel,
                    VerificationScore,
                    VerificationMethod,
                    VerifiedAt,
                    ExpiryDate,
                    VerificationStatus,
                    ValidityStatus
                FROM vw_SkillVerificationStatus
                WHERE CandidateID = ?
            `, [candidateId]);
            profile.skillVerification = skills || [];
        } catch (err) {
            console.log("Skill verification error:", err.message);
        }

        // 4. Engagement Metrics
        try {
            const engagement = await query(`
                SELECT 
                    InterviewsScheduled,
                    ConfirmedInterviews,
                    EngagementRate
                FROM vw_CandidateEngagement
                WHERE CandidateID = ?
            `, [candidateId]);
            profile.engagement = engagement[0] || null;
        } catch (err) {
            console.log("Engagement error:", err.message);
        }

        // 5. Ghosting Risk
        try {
            const ghosting = await query(`
                SELECT TOP 1
                    CandidateGhostingScore,
                    OverallRiskScore,
                    OverallRiskLevel,
                    AvgResponseTime,
                    TotalCommunications
                FROM vw_GhostingRiskDashboard
                WHERE CandidateID = ?
            `, [candidateId]);
            profile.ghostingRisk = ghosting[0] || null;
        } catch (err) {
            console.log("Ghosting risk error:", err.message);
        }

        // 6. Remote Compatibility
        try {
            const remote = await query(`
                SELECT TOP 1
                    OverallRemoteScore,
                    TimezoneAlignment,
                    WorkspaceQuality AS WorkspaceScore,
                    CommunicationPreference AS CommunicationScore,
                    SelfMotivationScore
                FROM vw_RemoteCompatibilityMatrix
                WHERE CandidateID = ?
            `, [candidateId]);
            profile.remoteCompatibility = remote[0] || null;
        } catch (err) {
            console.log("Remote compatibility error:", err.message);
        }

        // 7. Career Path Insights
        try {
            const career = await query(`
                SELECT TOP 1
                    TargetRole,
                    TransitionProbability,
                    TopSkills AS SkillsNeeded,
                    AvgTransitionMonths AS EstimatedMonths,
                    CurrentReadinessScore
                FROM vw_CareerPathInsights
                WHERE CandidateID = ?
            `, [candidateId]);
            profile.careerPath = career[0] || null;
        } catch (err) {
            console.log("Career path error:", err.message);
        }

        // 8. Gamification
        try {
            const gamification = await query(`
                SELECT 
                    Points,
                    Level,
                    Badges,
                    StreakDays,
                    EngagementScore
                FROM CandidateGamification
                WHERE CandidateID = ?
            `, [candidateId]);
            profile.gamification = gamification[0] || null;
        } catch (err) {
            console.log("Gamification error:", err.message);
        }

        // 9. AI Predictions
        try {
            const predictions = await query(`
                SELECT 
                    p.JobID,
                    j.JobTitle,
                    p.SuccessProbability,
                    p.KeyFactors,
                    p.PredictionDate AS PredictedAt
                FROM AI_Predictions p
                LEFT JOIN JobPostings j ON p.JobID = j.JobID
                WHERE p.CandidateID = ?
                ORDER BY p.PredictionDate DESC
            `, [candidateId]);
            profile.predictions = predictions || [];
        } catch (err) {
            console.log("Predictions error:", err.message);
        }

        // 10. Blockchain Verifications
        try {
            const blockchain = await query(`
                SELECT 
                    CredentialType,
                    CredentialHash,
                    BlockchainTransactionID AS TransactionID,
                    Network,
                    VerifiedAt,
                    CASE WHEN VerificationStatus = 'Verified' THEN 1 ELSE 0 END AS IsVerified
                FROM BlockchainVerifications
                WHERE CandidateID = ?
                ORDER BY VerifiedAt DESC
            `, [candidateId]);
            profile.blockchainVerifications = blockchain || [];
        } catch (err) {
            console.log("Blockchain verifications error:", err.message);
        }

        // 11. Recent Applications
        try {
            const applications = await query(`
                SELECT TOP 10
                    a.ApplicationID,
                    j.JobTitle,
                    j.Location AS JobLocation,
                    s.StatusName,
                    a.AppliedDate,
                    NULL AS MatchScore
                FROM Applications a
                JOIN JobPostings j ON a.JobID = j.JobID
                JOIN ApplicationStatus s ON a.StatusID = s.StatusID
                WHERE a.CandidateID = ? AND a.IsDeleted = 0
                ORDER BY a.AppliedDate DESC
            `, [candidateId]);
            profile.applications = applications || [];
        } catch (err) {
            console.log("Applications error:", err.message);
        }

        // 12. Interviews
        try {
            const interviews = await query(`
                SELECT 
                    i.ScheduleID,
                    j.JobTitle,
                    u.Username AS RecruiterName,
                    i.InterviewStart,
                    i.InterviewEnd,
                    i.CandidateConfirmed,
                    CASE 
                        WHEN i.InterviewStart < GETDATE() THEN 'Past'
                        ELSE 'Upcoming'
                    END AS TimeStatus
                FROM InterviewSchedules i
                JOIN Applications a ON i.ApplicationID = a.ApplicationID
                JOIN JobPostings j ON a.JobID = j.JobID
                JOIN Recruiters r ON i.RecruiterID = r.RecruiterID
                JOIN Users u ON r.UserID = u.UserID
                WHERE a.CandidateID = ?
                ORDER BY i.InterviewStart DESC
            `, [candidateId]);
            profile.interviews = interviews || [];
        } catch (err) {
            console.log("Interviews error:", err.message);
        }

        res.json(profile);
    } catch (err) {
        console.error("Candidate Profile Error:", err.message);
        res.status(500).json({ error: "Failed to fetch candidate profile: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/referral-intelligence
 * @desc    Get comprehensive referral intelligence dashboard data
 * @access  Private (Recruiter/Admin)
 * 
 * Returns:
 * - Summary stats (total referrals, success rate, pending, etc.)
 * - Top referrers leaderboard
 * - Recent referrals with outcomes
 * - Referral suggestions (candidates who can refer others)
 * - Network strength analysis
 */
router.get('/referral-intelligence', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = {
            summary: null,
            topReferrers: [],
            recentReferrals: [],
            referralSuggestions: [],
            networkAnalysis: [],
            outcomeBreakdown: []
        };

        // 1. Summary Stats
        try {
            const summary = await query(`
                SELECT 
                    COUNT(*) AS TotalReferrals,
                    SUM(CASE WHEN HireResult = 1 THEN 1 ELSE 0 END) AS SuccessfulHires,
                    SUM(CASE WHEN HireResult IS NULL THEN 1 ELSE 0 END) AS PendingReferrals,
                    CAST(SUM(CASE WHEN HireResult = 1 THEN 1 ELSE 0 END) * 100.0 / 
                         NULLIF(COUNT(CASE WHEN HireResult IS NOT NULL THEN 1 END), 0) AS DECIMAL(5,2)) AS SuccessRate,
                    AVG(CAST(QualityScore AS FLOAT)) AS AvgQualityScore,
                    SUM(CASE WHEN BonusAmount IS NOT NULL THEN BonusAmount ELSE 0 END) AS TotalBonusPaid,
                    COUNT(DISTINCT ReferrerID) AS ActiveReferrers
                FROM ReferralNetwork
            `);
            data.summary = summary[0] || null;
        } catch (err) {
            console.log("Summary error:", err.message);
        }

        // 2. Top Referrers Leaderboard
        try {
            const topReferrers = await query(`
                SELECT TOP 10
                    c.CandidateID AS ReferrerID,
                    c.FullName AS ReferrerName,
                    rp.TotalReferrals,
                    rp.SuccessfulReferrals,
                    rp.ConversionRate,
                    rp.AvgQualityScore,
                    rp.TotalBonusEarned
                FROM ReferralPerformance rp
                JOIN Candidates c ON rp.ReferrerID = c.CandidateID
                ORDER BY rp.SuccessfulReferrals DESC, rp.TotalReferrals DESC
            `);
            data.topReferrers = topReferrers || [];
        } catch (err) {
            console.log("Top referrers error:", err.message);
        }

        // 3. Recent Referrals with Outcomes
        try {
            const recentReferrals = await query(`
                SELECT TOP 20
                    r.ReferralID,
                    c1.FullName AS ReferrerName,
                    c2.FullName AS ReferredCandidateName,
                    j.JobTitle,
                    r.RelationshipType,
                    r.ReferralStrength,
                    r.ReferralDate,
                    r.HireResult,
                    r.QualityScore,
                    r.BonusAmount,
                    CASE 
                        WHEN r.HireResult = 1 THEN 'Successful'
                        WHEN r.HireResult = 0 THEN 'Unsuccessful'
                        ELSE 'Pending'
                    END AS Outcome,
                    ns.ConnectionStrength,
                    ns.TrustLevel
                FROM ReferralNetwork r
                JOIN Candidates c1 ON r.ReferrerID = c1.CandidateID
                JOIN Candidates c2 ON r.ReferredCandidateID = c2.CandidateID
                JOIN JobPostings j ON r.JobID = j.JobID
                LEFT JOIN NetworkStrength ns ON r.ReferrerID = ns.CandidateID 
                    AND r.ReferredCandidateID = ns.ConnectionID
                ORDER BY r.ReferralDate DESC
            `);
            data.recentReferrals = recentReferrals || [];
        } catch (err) {
            console.log("Recent referrals error:", err.message);
        }

        // 4. Referral Suggestions (using sp_SuggestReferrals)
        try {
            // Get a sample of candidates who could refer
            const suggestions = await query(`
                SELECT TOP 10
                    c.CandidateID,
                    c.FullName,
                    c.Location,
                    c.YearsOfExperience,
                    (SELECT COUNT(*) FROM NetworkStrength ns WHERE ns.CandidateID = c.CandidateID) AS NetworkSize,
                    (SELECT STRING_AGG(s.SkillName, ', ') 
                     FROM CandidateSkills cs 
                     JOIN Skills s ON cs.SkillID = s.SkillID 
                     WHERE cs.CandidateID = c.CandidateID) AS Skills
                FROM Candidates c
                WHERE EXISTS (
                    SELECT 1 FROM NetworkStrength ns WHERE ns.CandidateID = c.CandidateID
                )
                ORDER BY (SELECT COUNT(*) FROM NetworkStrength ns WHERE ns.CandidateID = c.CandidateID) DESC
            `);
            data.referralSuggestions = suggestions || [];
        } catch (err) {
            console.log("Referral suggestions error:", err.message);
        }

        // 5. Network Strength Analysis
        try {
            const networkAnalysis = await query(`
                SELECT 
                    c.CandidateID,
                    c.FullName,
                    COUNT(ns.ConnectionID) AS TotalConnections,
                    AVG(CAST(ns.ConnectionStrength AS FLOAT)) AS AvgConnectionStrength,
                    SUM(CASE WHEN ns.ConnectionStrength >= 8 THEN 1 ELSE 0 END) AS HighTrustConnections,
                    MAX(ns.LastInteraction) AS LastNetworkInteraction
                FROM Candidates c
                JOIN NetworkStrength ns ON c.CandidateID = ns.CandidateID
                GROUP BY c.CandidateID, c.FullName
                HAVING COUNT(ns.ConnectionID) >= 1
                ORDER BY TotalConnections DESC
            `);
            data.networkAnalysis = networkAnalysis || [];
        } catch (err) {
            console.log("Network analysis error:", err.message);
        }

        // 6. Outcome Breakdown by Relationship Type
        try {
            const outcomeBreakdown = await query(`
                SELECT 
                    RelationshipType,
                    COUNT(*) AS TotalReferrals,
                    SUM(CASE WHEN HireResult = 1 THEN 1 ELSE 0 END) AS Successful,
                    SUM(CASE WHEN HireResult = 0 THEN 1 ELSE 0 END) AS Unsuccessful,
                    SUM(CASE WHEN HireResult IS NULL THEN 1 ELSE 0 END) AS Pending,
                    AVG(CAST(QualityScore AS FLOAT)) AS AvgQualityScore
                FROM ReferralNetwork
                GROUP BY RelationshipType
                ORDER BY TotalReferrals DESC
            `);
            data.outcomeBreakdown = outcomeBreakdown || [];
        } catch (err) {
            console.log("Outcome breakdown error:", err.message);
        }

        res.json(data);
    } catch (err) {
        console.error("Referral Intelligence Error:", err.message);
        res.status(500).json({ error: "Failed to fetch referral intelligence: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/referral-suggestions/:jobId
 * @desc    Get referral suggestions for a specific job using sp_SuggestReferrals stored procedure
 * @access  Private (Recruiter/Admin)
 * 
 * Returns potential referrers with their network connections and fit scores for the specified job
 */
router.get('/referral-suggestions/:jobId', protect, authorize([1, 2]), async (req, res) => {
    const { jobId } = req.params;

    if (!jobId) {
        return res.status(400).json({ error: "Job ID is required." });
    }

    try {
        // Call the stored procedure sp_SuggestReferrals
        const suggestions = await query("EXEC sp_SuggestReferrals @JobID = ?", [parseInt(jobId)]);

        // Parse the PotentialReferrals JSON field if it exists
        const processedSuggestions = suggestions.map(s => ({
            ...s,
            PotentialReferrals: s.PotentialReferrals ? JSON.parse(s.PotentialReferrals) : []
        }));

        res.json(processedSuggestions);
    } catch (err) {
        console.error("Referral Suggestions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch referral suggestions: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/send-reminder
 * @desc    Send a reminder to a candidate - creates a notification (matches notification trigger schema)
 * @access  Private (Recruiter/Admin)
 */
router.post('/send-reminder', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, jobId, message } = req.body;

    if (!candidateId || !message) {
        return res.status(400).json({ error: "Candidate ID and message are required." });
    }

    try {
        // Get candidate info
        const candidateResult = await query(
            "SELECT CandidateID, UserID, FullName FROM Candidates WHERE CandidateID = ?",
            [candidateId]
        );

        if (!candidateResult || candidateResult.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        const candidate = candidateResult[0];
        const candidateUserId = candidate.UserID;
        const candidateName = candidate.FullName;

        // Check if candidate has a UserID (required for notifications)
        if (!candidateUserId) {
            return res.status(400).json({ error: "Candidate does not have a linked user account." });
        }

        // Insert notification using the same schema as the triggers (UserID, Title, Body, NotificationType, SentAt, DataPayload)
        const dataPayload = jobId ? `{"applicationId": ${jobId}}` : null;

        await query(`
            INSERT INTO PushNotifications (UserID, Title, Body, NotificationType, SentAt, DataPayload)
            VALUES (?, 'Follow-up Reminder', ?, 'Reminder', GETDATE(), ?)
        `, [candidateUserId, message, dataPayload]);

        res.status(201).json({
            message: "Reminder sent successfully!",
            candidateName: candidateName
        });
    } catch (err) {
        console.error("Send Reminder Error:", err.message);
        res.status(500).json({ error: "Failed to send reminder: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/background-checks/:candidateId
 * @desc    Get background checks for a candidate
 * @access  Private (Recruiter/Admin)
 * 
 * Returns: CheckID, CandidateID, FullName, CheckType, Vendor, Status, Result, RiskLevel, 
 *          InitiatedAt, CompletedAt, Findings, ReportURL, Cost, TurnaroundDays
 */
router.get('/background-checks/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const { checkType, status } = req.query;

    try {
        let queryStr = `
            SELECT 
                bc.CheckID,
                bc.CandidateID,
                c.FullName,
                bc.CheckType,
                bc.Vendor,
                bc.RequestID,
                bc.Status,
                bc.Result,
                bc.Findings,
                bc.RiskLevel,
                bc.InitiatedAt,
                bc.CompletedAt,
                bc.ReportURL,
                bc.Cost,
                bc.TurnaroundDays,
                bc.Notes,
                bc.ComplianceVerified
            FROM BackgroundChecks bc
            JOIN Candidates c ON bc.CandidateID = c.CandidateID
            WHERE bc.CandidateID = ?
        `;

        const params = [candidateId];

        if (checkType) {
            queryStr += ` AND bc.CheckType = ?`;
            params.push(checkType);
        }

        if (status) {
            queryStr += ` AND bc.Status = ?`;
            params.push(status);
        }

        queryStr += ` ORDER BY bc.InitiatedAt DESC`;

        const checks = await query(queryStr, params);
        res.json(checks);
    } catch (err) {
        console.error("Background Checks Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch background checks: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/background-checks
 * @desc    Initiate a new background check for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.post('/background-checks', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, checkType, vendor, notes } = req.body;

    if (!candidateId || !checkType) {
        return res.status(400).json({ error: "Candidate ID and Check Type are required." });
    }

    // Validate check type
    const validTypes = ['Criminal', 'Education', 'Employment', 'Credit', 'Reference', 'Drug'];
    if (!validTypes.includes(checkType)) {
        return res.status(400).json({ error: `Invalid check type. Must be one of: ${validTypes.join(', ')}` });
    }

    try {
        // Generate a unique request ID
        const requestID = `BC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const result = await query(`
            INSERT INTO BackgroundChecks (CandidateID, CheckType, Vendor, RequestID, Status, Notes)
            VALUES (?, ?, ?, ?, 'Requested', ?)
        `, [candidateId, checkType, vendor || 'Internal', requestID, notes]);

        res.status(201).json({
            message: "Background check initiated successfully.",
            checkId: result.insertId,
            requestId: requestID,
            status: "Requested"
        });
    } catch (err) {
        console.error("Initiate Background Check Error:", err.message);
        res.status(500).json({ error: "Failed to initiate background check: " + err.message });
    }
});

/**
 * @route   PUT /api/recruiters/background-checks/:checkId
 * @desc    Update background check status (for vendor webhook or manual update)
 * @access  Private (Recruiter/Admin)
 */
router.put('/background-checks/:checkId', protect, authorize([1, 2]), async (req, res) => {
    const { checkId } = req.params;
    const { status, result, findings, riskLevel, reportURL, cost, turnaroundDays, notes } = req.body;

    if (!status) {
        return res.status(400).json({ error: "Status is required." });
    }

    // Validate status
    const validStatuses = ['Requested', 'InProgress', 'Completed', 'Failed', 'Cleared', 'Adverse'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const updateFields = [];
        const updateParams = [];

        if (status) {
            updateFields.push('Status = ?');
            updateParams.push(status);
        }
        if (result) {
            updateFields.push('Result = ?');
            updateParams.push(result);
        }
        if (findings !== undefined) {
            updateFields.push('Findings = ?');
            updateParams.push(findings);
        }
        if (riskLevel) {
            updateFields.push('RiskLevel = ?');
            updateParams.push(riskLevel);
        }
        if (reportURL) {
            updateFields.push('ReportURL = ?');
            updateParams.push(reportURL);
        }
        if (cost) {
            updateFields.push('Cost = ?');
            updateParams.push(cost);
        }
        if (turnaroundDays) {
            updateFields.push('TurnaroundDays = ?');
            updateParams.push(turnaroundDays);
        }
        if (notes) {
            updateFields.push('Notes = ?');
            updateParams.push(notes);
        }
        if (status === 'Completed' || status === 'Cleared' || status === 'Adverse') {
            updateFields.push('CompletedAt = GETDATE()');
        }

        updateParams.push(checkId);

        await query(`
            UPDATE BackgroundChecks 
            SET ${updateFields.join(', ')}
            WHERE CheckID = ?
        `, updateParams);

        res.json({
            message: "Background check updated successfully.",
            checkId: parseInt(checkId),
            status: status
        });
    } catch (err) {
        console.error("Update Background Check Error:", err.message);
        res.status(500).json({ error: "Failed to update background check: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/background-checks-dashboard
 * @desc    Get background check dashboard with summary stats
 * @access  Private (Recruiter/Admin)
 */
router.get('/background-checks-dashboard', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Summary stats
        const summary = await query(`
            SELECT 
                COUNT(*) AS TotalChecks,
                SUM(CASE WHEN Status = 'Requested' THEN 1 ELSE 0 END) AS Pending,
                SUM(CASE WHEN Status = 'InProgress' THEN 1 ELSE 0 END) AS InProgress,
                SUM(CASE WHEN Status = 'Completed' OR Status = 'Cleared' THEN 1 ELSE 0 END) AS Completed,
                SUM(CASE WHEN Status = 'Failed' OR Status = 'Adverse' THEN 1 ELSE 0 END) AS Failed,
                SUM(CASE WHEN Result = 'Clear' THEN 1 ELSE 0 END) AS Cleared,
                SUM(CASE WHEN Result = 'Adverse' THEN 1 ELSE 0 END) AS Adverse,
                SUM(CASE WHEN Result = 'Consider' THEN 1 ELSE 0 END) AS Consider,
                AVG(CAST(Cost AS FLOAT)) AS AvgCost,
                AVG(CAST(TurnaroundDays AS FLOAT)) AS AvgTurnaroundDays,
                SUM(CAST(Cost AS FLOAT)) AS TotalCost
            FROM BackgroundChecks
        `);

        // Checks by type
        const byType = await query(`
            SELECT 
                CheckType,
                COUNT(*) AS Count,
                SUM(CASE WHEN Status = 'Completed' OR Status = 'Cleared' THEN 1 ELSE 0 END) AS Completed
            FROM BackgroundChecks
            GROUP BY CheckType
            ORDER BY Count DESC
        `);

        // Recent checks
        const recent = await query(`
            SELECT TOP 10
                bc.CheckID,
                bc.CandidateID,
                c.FullName,
                bc.CheckType,
                bc.Status,
                bc.Result,
                bc.RiskLevel,
                bc.InitiatedAt,
                bc.CompletedAt
            FROM BackgroundChecks bc
            JOIN Candidates c ON bc.CandidateID = c.CandidateID
            ORDER BY bc.InitiatedAt DESC
        `);

        res.json({
            summary: summary[0] || {},
            byType: byType || [],
            recent: recent || []
        });
    } catch (err) {
        console.error("Background Checks Dashboard Error:", err.message);
        res.status(500).json({ error: "Failed to fetch background checks dashboard: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/blockchain-verifications/:candidateId
 * @desc    Get blockchain verifications for a candidate
 * @access  Private (Recruiter/Admin)
 */
router.get('/blockchain-verifications/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const { credentialType, status } = req.query;

    try {
        let queryStr = `
            SELECT 
                bv.VerificationID,
                bv.CandidateID,
                c.FullName,
                bv.CredentialType,
                bv.IssuingAuthority,
                bv.CredentialHash,
                bv.BlockchainTransactionID,
                bv.BlockNumber,
                bv.Network,
                bv.VerifiedAt,
                bv.IsImmutable,
                bv.VerificationCost,
                bv.VerificationStatus,
                bv.LastChecked,
                bv.Metadata
            FROM BlockchainVerifications bv
            JOIN Candidates c ON bv.CandidateID = c.CandidateID
            WHERE bv.CandidateID = ?
        `;

        const params = [candidateId];

        if (credentialType) {
            queryStr += ` AND bv.CredentialType = ?`;
            params.push(credentialType);
        }

        if (status) {
            queryStr += ` AND bv.VerificationStatus = ?`;
            params.push(status);
        }

        queryStr += ` ORDER BY bv.LastChecked DESC`;

        const verifications = await query(queryStr, params);
        res.json(verifications);
    } catch (err) {
        console.error("Blockchain Verifications Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch blockchain verifications: " + err.message });
    }
});

/**
 * @route   POST /api/recruiters/blockchain-verifications
 * @desc    Submit a new credential for blockchain verification
 * @access  Private (Recruiter/Admin)
 */
router.post('/blockchain-verifications', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, credentialType, issuingAuthority, metadata } = req.body;

    if (!candidateId || !credentialType || !issuingAuthority) {
        return res.status(400).json({ error: "Candidate ID, Credential Type, and Issuing Authority are required." });
    }

    // Validate credential type
    const validTypes = ['Degree', 'Certificate', 'Employment', 'Identity'];
    if (!validTypes.includes(credentialType)) {
        return res.status(400).json({ error: `Invalid credential type. Must be one of: ${validTypes.join(', ')}` });
    }

    try {
        // Generate SHA-256 hash of the credential (simulated)
        const credentialData = `${candidateId}-${credentialType}-${issuingAuthority}-${Date.now()}`;
        const crypto = require('crypto');
        const credentialHash = crypto.createHash('sha256').update(credentialData).digest('hex');

        // Generate a mock blockchain transaction ID
        const transactionID = `0x${credentialHash.substring(0, 16)}...${credentialHash.substring(credentialHash.length - 8)}`;

        const result = await query(`
            INSERT INTO BlockchainVerifications 
            (CandidateID, CredentialType, IssuingAuthority, CredentialHash, BlockchainTransactionID, Network, VerificationStatus, Metadata)
            VALUES (?, ?, ?, ?, ?, 'Ethereum', 'Pending', ?)
        `, [candidateId, credentialType, issuingAuthority, credentialHash, transactionID, metadata || null]);

        res.status(201).json({
            message: "Credential submitted for blockchain verification.",
            verificationId: result.insertId,
            credentialHash: credentialHash,
            transactionId: transactionID,
            status: "Pending"
        });
    } catch (err) {
        console.error("Submit Blockchain Verification Error:", err.message);
        res.status(500).json({ error: "Failed to submit blockchain verification: " + err.message });
    }
});

/**
 * @route   PUT /api/recruiters/blockchain-verifications/:verificationId
 * @desc    Update blockchain verification status (for webhook or manual update)
 * @access  Private (Recruiter/Admin)
 */
router.put('/blockchain-verifications/:verificationId', protect, authorize([1, 2]), async (req, res) => {
    const { verificationId } = req.params;
    const { verificationStatus, blockchainTransactionID, blockNumber, metadata } = req.body;

    if (!verificationStatus) {
        return res.status(400).json({ error: "Verification status is required." });
    }

    // Validate status
    const validStatuses = ['Pending', 'Verified', 'Failed', 'Expired'];
    if (!validStatuses.includes(verificationStatus)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    try {
        const updateFields = [];
        const updateParams = [];

        if (verificationStatus) {
            updateFields.push('VerificationStatus = ?');
            updateParams.push(verificationStatus);
        }
        if (blockchainTransactionID) {
            updateFields.push('BlockchainTransactionID = ?');
            updateParams.push(blockchainTransactionID);
        }
        if (blockNumber) {
            updateFields.push('BlockNumber = ?');
            updateParams.push(blockNumber);
        }
        if (metadata) {
            updateFields.push('Metadata = ?');
            updateParams.push(metadata);
        }
        if (verificationStatus === 'Verified') {
            updateFields.push('VerifiedAt = GETDATE()');
            updateFields.push('IsImmutable = 1');
        }

        updateFields.push('LastChecked = GETDATE()');
        updateParams.push(verificationId);

        await query(`
            UPDATE BlockchainVerifications 
            SET ${updateFields.join(', ')}
            WHERE VerificationID = ?
        `, updateParams);

        res.json({
            message: "Blockchain verification updated successfully.",
            verificationId: parseInt(verificationId),
            status: verificationStatus
        });
    } catch (err) {
        console.error("Update Blockchain Verification Error:", err.message);
        res.status(500).json({ error: "Failed to update blockchain verification: " + err.message });
    }
});

/**
 * @route   GET /api/recruiters/blockchain-dashboard
 * @desc    Get blockchain verification dashboard with summary stats
 * @access  Private (Recruiter/Admin)
 */
router.get('/blockchain-dashboard', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Check if table exists
        let tableExists = false;
        try {
            await query("SELECT 1 FROM BlockchainVerifications WHERE 1=0");
            tableExists = true;
        } catch (tableErr) {
            tableExists = false;
        }

        if (!tableExists) {
            // Return empty data if table doesn't exist
            return res.json({
                summary: {
                    TotalVerifications: 0,
                    Pending: 0,
                    Verified: 0,
                    Failed: 0,
                    Degrees: 0,
                    Certificates: 0,
                    Employment: 0,
                    Identity: 0,
                    TotalCost: 0,
                    AvgCost: 0
                },
                byType: [],
                recent: []
            });
        }

        // Summary stats
        const summary = await query(`
            SELECT 
                COUNT(*) AS TotalVerifications,
                SUM(CASE WHEN VerificationStatus = 'Pending' THEN 1 ELSE 0 END) AS Pending,
                SUM(CASE WHEN VerificationStatus = 'Verified' THEN 1 ELSE 0 END) AS Verified,
                SUM(CASE WHEN VerificationStatus = 'Failed' THEN 1 ELSE 0 END) AS Failed,
                SUM(CASE WHEN CredentialType = 'Degree' THEN 1 ELSE 0 END) AS Degrees,
                SUM(CASE WHEN CredentialType = 'Certificate' THEN 1 ELSE 0 END) AS Certificates,
                SUM(CASE WHEN CredentialType = 'Employment' THEN 1 ELSE 0 END) AS Employment,
                SUM(CASE WHEN CredentialType = 'Identity' THEN 1 ELSE 0 END) AS Identity,
                SUM(CAST(VerificationCost AS FLOAT)) AS TotalCost,
                AVG(CAST(VerificationCost AS FLOAT)) AS AvgCost
            FROM BlockchainVerifications
        `);

        // Verifications by type
        const byType = await query(`
            SELECT 
                CredentialType,
                COUNT(*) AS Count,
                SUM(CASE WHEN VerificationStatus = 'Verified' THEN 1 ELSE 0 END) AS Verified
            FROM BlockchainVerifications
            GROUP BY CredentialType
            ORDER BY Count DESC
        `);

        // Recent verifications
        const recent = await query(`
            SELECT TOP 10
                bv.VerificationID,
                bv.CandidateID,
                c.FullName,
                bv.CredentialType,
                bv.IssuingAuthority,
                bv.VerificationStatus,
                bv.VerifiedAt,
                bv.BlockchainTransactionID,
                bv.Network
            FROM BlockchainVerifications bv
            JOIN Candidates c ON bv.CandidateID = c.CandidateID
            ORDER BY bv.LastChecked DESC
        `);

        res.json({
            summary: summary[0] || {},
            byType: byType || [],
            recent: recent || []
        });
    } catch (err) {
        console.error("Blockchain Dashboard Error:", err.message);
        // Return empty data on error instead of 500
        res.json({
            summary: {
                TotalVerifications: 0,
                Pending: 0,
                Verified: 0,
                Failed: 0,
                Degrees: 0,
                Certificates: 0,
                Employment: 0,
                Identity: 0,
                TotalCost: 0,
                AvgCost: 0
            },
            byType: [],
            recent: []
        });
    }
});

/**
 * @route   GET /api/recruiters/ranking-history/:candidateId
 * @desc    Get ranking history for a candidate across all jobs
 * @access  Private (Recruiter/Admin)
 * 
 * Returns: HistoryID, JobID, JobTitle, MatchScore, CalculatedAt
 */
router.get('/ranking-history/:candidateId', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId } = req.params;
    const { jobId } = req.query;

    try {
        let queryStr = `
            SELECT 
                crh.HistoryID,
                crh.CandidateID,
                crh.JobID,
                jp.JobTitle,
                crh.MatchScore,
                crh.CalculatedAt
            FROM CandidateRankingHistory crh
            LEFT JOIN JobPostings jp ON crh.JobID = jp.JobID
            WHERE crh.CandidateID = ?
        `;
        const params = [parseInt(candidateId)];

        // Optionally filter by specific job
        if (jobId) {
            queryStr += ` AND crh.JobID = ?`;
            params.push(parseInt(jobId));
        }

        queryStr += ` ORDER BY crh.CalculatedAt DESC`;

        const history = await query(queryStr, params);

        // Calculate statistics
        let stats = {
            totalRankings: history.length,
            avgScore: 0,
            highestScore: 0,
            lowestScore: 100,
            scoreTrend: 'stable' // 'improving', 'declining', 'stable'
        };

        if (history.length > 0) {
            const scores = history.map(h => h.MatchScore || 0);
            stats.avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2);
            stats.highestScore = Math.max(...scores);
            stats.lowestScore = Math.min(...scores);

            // Calculate trend (compare recent 3 to previous 3)
            if (history.length >= 6) {
                const recent = history.slice(0, 3);
                const previous = history.slice(3, 6);
                const recentAvg = recent.reduce((a, b) => a + (b.MatchScore || 0), 0) / 3;
                const previousAvg = previous.reduce((a, b) => a + (b.MatchScore || 0), 0) / 3;

                if (recentAvg > previousAvg + 5) {
                    stats.scoreTrend = 'improving';
                } else if (recentAvg < previousAvg - 5) {
                    stats.scoreTrend = 'declining';
                }
            }
        }

        res.json({
            history,
            stats
        });
    } catch (err) {
        console.error("Ranking History Fetch Error:", err.message);
        res.status(500).json({ error: `Failed to fetch ranking history: ${err.message}` });
    }
});

/**
 * @route   POST /api/recruiters/ranking-history
 * @desc    Save a candidate ranking (call sp_SaveCandidateRanking)
 * @access  Private (Recruiter/Admin)
 * 
 * Body: { candidateId, jobId, matchScore }
 */
router.post('/ranking-history', protect, authorize([1, 2]), async (req, res) => {
    const { candidateId, jobId, matchScore } = req.body;

    if (!candidateId || !jobId || matchScore === undefined) {
        return res.status(400).json({ error: "candidateId, jobId, and matchScore are required." });
    }

    try {
        await query(
            `EXEC sp_SaveCandidateRanking ?, ?, ?`,
            [parseInt(candidateId), parseInt(jobId), parseFloat(matchScore)]
        );

        res.status(201).json({
            success: true,
            message: "Ranking saved successfully.",
            data: { candidateId, jobId, matchScore }
        });
    } catch (err) {
        console.error("Save Ranking Error:", err.message);
        res.status(500).json({ error: `Failed to save ranking: ${err.message}` });
    }
});

/**
 * @route   GET /api/recruiters/ranking-history/job/:jobId
 * @desc    Get ranking history for all candidates for a specific job
 * @access  Private (Recruiter/Admin)
 * 
 * Returns: HistoryID, CandidateID, FullName, MatchScore, CalculatedAt
 */
router.get('/ranking-history/job/:jobId', protect, authorize([1, 2]), async (req, res) => {
    const { jobId } = req.params;

    try {
        const history = await query(`
            SELECT 
                crh.HistoryID,
                crh.CandidateID,
                c.FullName,
                crh.JobID,
                jp.JobTitle,
                crh.MatchScore,
                crh.CalculatedAt
            FROM CandidateRankingHistory crh
            LEFT JOIN Candidates c ON crh.CandidateID = c.CandidateID
            LEFT JOIN JobPostings jp ON crh.JobID = jp.JobID
            WHERE crh.JobID = ?
            ORDER BY crh.MatchScore DESC, crh.CalculatedAt DESC
        `, [parseInt(jobId)]);

        res.json(history);
    } catch (err) {
        console.error("Job Ranking History Fetch Error:", err.message);
        res.status(500).json({ error: `Failed to fetch job ranking history: ${err.message}` });
    }
});

module.exports = router;
