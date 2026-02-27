const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/analytics/stats
 * @desc    Global recruitment statistics for Hero Cards
 * @access  Private (Recruiter/Admin)
 */
router.get('/stats', protect, authorize([1, 2]), async (req, res) => {
    try {
        const results = await Promise.allSettled([
            query("SELECT COUNT(*) as total FROM Candidates"),
            query("SELECT COUNT(*) as total FROM vw_CandidateMatchScore WHERE TotalMatchScore > 80"),
            query("SELECT COUNT(*) as total FROM JobPostings WHERE IsActive = 1 AND IsDeleted = 0")
        ]);

        const stats = {
            totalPool: results[0].status === 'fulfilled' ? results[0].value[0].total : 0,
            topMatches: results[1].status === 'fulfilled' ? results[1].value[0].total : 0,
            openRoles: results[2].status === 'fulfilled' ? results[2].value[0].total : 0
        };

        res.json(stats);
    } catch (err) {
        console.error("Stats Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch dashboard statistics." });
    }
});

/**
 * @route   GET /api/analytics/funnel
 * @desc    Get application funnel conversion data
 * @access  Public (for demo)
 */
router.get('/funnel', async (req, res) => {
    try {
        const funnel = await query("SELECT * FROM vw_ApplicationFunnel");
        res.json(funnel);
    } catch (err) {
        console.error("Funnel Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch funnel data." });
    }
});

/**
 * @route   GET /api/analytics/utilization
 * @desc    Get vacancy utilization metrics
 * @access  Public (for demo)
 */
router.get('/utilization', async (req, res) => {
    try {
        const utilization = await query("SELECT * FROM vw_VacancyUtilization");
        res.json(utilization);
    } catch (err) {
        console.error("Utilization Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch vacancy utilization." });
    }
});

/**
 * @route   GET /api/analytics/per-job
 * @desc    Get hire rates per job
 * @access  Private (Recruiter/Admin)
 */
router.get('/per-job', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_HireRatePerJob");
        res.json(data);
    } catch (err) {
        console.error("Per-Job Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch job hire rates." });
    }
});

/**
 * @route   GET /api/analytics/bottlenecks
 * @desc    Get hiring bottleneck metrics
 * @access  Public (for demo)
 */
router.get('/bottlenecks', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_HiringBottlenecks");
        res.json(data);
    } catch (err) {
        console.error("Bottleneck Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch hiring bottlenecks." });
    }
});

/**
 * @route   GET /api/analytics/diversity
 * @desc    Get diversity analytics funnel (by Ethnicity)
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_DiversityAnalyticsFunnel");
        res.json(data);
    } catch (err) {
        console.error("Diversity Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch diversity data." });
    }
});

/**
 * @route   GET /api/analytics/diversity-gender
 * @desc    Get diversity by Gender
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity-gender', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_DiversityByGender");
        res.json(data);
    } catch (err) {
        console.error("Diversity Gender Error:", err.message);
        res.status(500).json({ error: "Failed to fetch gender diversity data." });
    }
});

/**
 * @route   GET /api/analytics/diversity-disability
 * @desc    Get diversity by Disability status
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity-disability', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_DiversityByDisability");
        res.json(data);
    } catch (err) {
        console.error("Diversity Disability Error:", err.message);
        res.status(500).json({ error: "Failed to fetch disability diversity data." });
    }
});

/**
 * @route   GET /api/analytics/diversity-veteran
 * @desc    Get diversity by Veteran status
 * @access  Public (for Admin Dashboard)
 */
router.get('/diversity-veteran', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_DiversityByVeteran");
        res.json(data);
    } catch (err) {
        console.error("Diversity Veteran Error:", err.message);
        res.status(500).json({ error: "Failed to fetch veteran diversity data." });
    }
});

/**
 * @route   GET /api/analytics/market
 * @desc    Get market intelligence dashboard data
 * @access  Public (for Admin Dashboard)
 */
router.get('/market', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_MarketIntelligenceDashboard");
        res.json(data);
    } catch (err) {
        console.error("Market Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch market intelligence." });
    }
});

/**
 * @route   GET /api/analytics/salary-transparency
 * @desc    Get salary transparency analytics
 * @access  Public (for Admin Dashboard)
 */
router.get('/salary-transparency', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_SalaryTransparency");
        res.json(data);
    } catch (err) {
        console.error("Salary Transparency Error:", err.message);
        res.status(500).json({ error: "Failed to fetch salary transparency data." });
    }
});

/**
 * @route   GET /api/analytics/remote-compatibility
 * @desc    Get remote work compatibility analytics
 * @access  Public (for Admin Dashboard)
 */
router.get('/remote-compatibility', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_RemoteCompatibilityMatrix");
        // Map column names for frontend chart compatibility
        // Chart expects: { Role, RemoteScore }
        // View returns: { JobTitle, OverallRemoteScore }
        const mapped = data.map(row => ({
            ...row,
            Role: row.JobTitle,
            RemoteScore: row.OverallRemoteScore
        }));
        res.json(mapped);
    } catch (err) {
        console.error("Remote Compatibility Error:", err.message);
        res.status(500).json({ error: "Failed to fetch remote compatibility data." });
    }
});

/**
 * @route   GET /api/analytics/career-path
 * @desc    Get career path insights (individual candidate data)
 * @access  Public (for Admin Dashboard)
 */
router.get('/career-path', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_CareerPathInsights");
        res.json(data);
    } catch (err) {
        console.error("Career Path Error:", err.message);
        res.status(500).json({ error: "Failed to fetch career path data." });
    }
});

/**
 * @route   GET /api/analytics/organizational-career
 * @desc    Get aggregated organizational career insights for Admin Dashboard
 * @access  Public (for Admin Dashboard)
 */
router.get('/organizational-career', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_OrganizationalCareerInsights");
        res.json(data);
    } catch (err) {
        console.error("Organizational Career Insights Error:", err.message);
        res.status(500).json({ error: "Failed to fetch organizational career data." });
    }
});

/**
 * @route   GET /api/analytics/referral-intelligence
 * @desc    Get referral intelligence analytics
 * @access  Public (for Admin Dashboard)
 */
router.get('/referral-intelligence', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_ReferralIntelligence");
        res.json(data);
    } catch (err) {
        console.error("Referral Intelligence Error:", err.message);
        res.status(500).json({ error: "Failed to fetch referral intelligence data." });
    }
});

/**
 * @route   GET /api/analytics/risk-alerts
 * @desc    Get silent rejections and ghosting risk alerts
 * @access  Public (for demo)
 */
router.get('/risk-alerts', async (req, res) => {
    try {
        const [silent, ghosting] = await Promise.all([
            query("SELECT TOP 5 * FROM vw_SilentRejections ORDER BY DaysInactive DESC"),
            query("SELECT TOP 5 * FROM vw_GhostingRiskDashboard WHERE OverallRiskLevel = 'High'")
        ]);

        res.json({
            silentRejections: silent,
            ghostingRisk: ghosting
        });
    } catch (err) {
        console.error("Risk Alerts Analytics Error:", err.message);
        res.status(500).json({ error: "Failed to fetch risk intelligence." });
    }
});

/**
 * @route   GET /api/analytics/system-stats
 * @desc    Get real-time recruitment statistics
 * @access  Private (Admin)
 */
router.get('/system-stats', protect, authorize(1), async (req, res) => {
    try {
        // Get recruitment stats
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM Candidates) AS CandidateCount,
                (SELECT COUNT(*) FROM Users) AS UserCount,
                (SELECT COUNT(*) FROM JobPostings WHERE IsDeleted = 0 AND IsActive = 1) AS ActiveJobCount,
                (SELECT COUNT(*) FROM Applications WHERE IsDeleted = 0) AS TotalApplications,
                (SELECT COUNT(*) FROM InterviewSchedules) AS ScheduledInterviews,
                (SELECT COUNT(*) FROM Applications WHERE IsDeleted = 0 AND StatusID = 4) AS HiredCandidates
        `);

        res.json({
            candidates: stats[0]?.CandidateCount || 0,
            users: stats[0]?.UserCount || 0,
            activeJobs: stats[0]?.ActiveJobCount || 0,
            totalApplications: stats[0]?.TotalApplications || 0,
            scheduledInterviews: stats[0]?.ScheduledInterviews || 0,
            hiredCandidates: stats[0]?.HiredCandidates || 0
        });
    } catch (err) {
        console.error("System Stats Error:", err.message);
        res.json({
            candidates: 0,
            users: 0,
            activeJobs: 0,
            totalApplications: 0,
            scheduledInterviews: 0,
            hiredCandidates: 0
        });
    }
});

/**
 * @route   GET /api/analytics/all-users
 * @desc    Get all users with their roles
 * @access  Private (Admin)
 */
router.get('/all-users', protect, authorize(1), async (req, res) => {
    try {
        const users = await query(`
            SELECT u.UserID, u.Username, u.Email, u.RoleID, u.IsActive, r.RoleName
            FROM Users u
            LEFT JOIN Roles r ON u.RoleID = r.RoleID
            ORDER BY u.UserID
        `);
        res.json(users);
    } catch (err) {
        console.error("All Users Error:", err.message);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

/**
 * @route   GET /api/analytics/audit-logs
 * @desc    Get system audit logs
 * @access  Private (Admin)
 */
router.get('/audit-logs', protect, authorize(1), async (req, res) => {
    try {
        const logs = await query(`
            SELECT a.AuditID, a.TableName, a.RecordID, a.Operation, a.OldValue, a.NewValue, a.ChangedAt, u.Username as ChangedBy
            FROM AuditLog a
            LEFT JOIN Users u ON a.ChangedBy = u.UserID
            ORDER BY a.ChangedAt DESC
        `);
        res.json(logs);
    } catch (err) {
        console.error("Audit Logs Error:", err.message);
        res.status(500).json({ error: "Failed to fetch audit logs." });
    }
});

/**
 * @route   GET /api/analytics/bias-detection
 * @desc    Get bias detection analytics by location and experience
 * @access  Public (for demo)
 */
router.get('/bias-detection', async (req, res) => {
    try {
        const [location, experience] = await Promise.all([
            query("SELECT * FROM vw_Bias_Location"),
            query("SELECT * FROM vw_Bias_Experience")
        ]);
        res.json({ location, experience });
    } catch (err) {
        console.error("Bias Detection Error:", err.message);
        res.status(500).json({ error: "Failed to fetch bias detection data." });
    }
});

/**
 * @route   GET /api/analytics/time-to-hire
 * @desc    Get average time-to-hire metrics
 * @access  Private (Recruiter/Admin)
 */
router.get('/time-to-hire', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_AverageTimeToHire");
        res.json(data);
    } catch (err) {
        console.error("Time-to-Hire Error:", err.message);
        res.status(500).json({ error: "Failed to fetch time-to-hire metrics." });
    }
});

/**
 * @route   GET /api/analytics/interview-scores
 * @desc    Get interview score vs decision analysis
 * @access  Private (Recruiter/Admin)
 */
router.get('/interview-scores', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_InterviewScoreVsDecision");
        res.json(data);
    } catch (err) {
        console.error("Interview Scores Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview score data." });
    }
});

/* ==========================================================================
 * ADMIN DASHBOARD ANALYTICS - Phase 1 Enhancement Endpoints
 * ==========================================================================
 * Database Views and Their Columns:
 * 
 * 1. vw_InterviewerConsistency
 *    - InterviewerID, InterviewerName, InterviewsTaken, AvgScoreGiven, ScoreVariance
 *    Purpose: Detect scoring bias/consistency issues among interviewers
 * 
 * 2. vw_InterviewScoreVsDecision
 *    - ApplicationID, FullName, AvgInterviewScore, FinalStatus
 *    Purpose: Correlate interview scores with hiring decisions
 * 
 * 3. vw_RejectionAnalysis
 *    - RejectionReason, RejectionCount, RejectionPercent
 *    Purpose: Analyze rejection patterns and reasons
 * 
 * 4. vw_CandidateEngagement
 *    - CandidateID, FullName, InterviewsScheduled, ConfirmedInterviews, EngagementRate
 *    Purpose: Track candidate responsiveness and engagement
 * 
 * 5. vw_HireRatePerJob
 *    - JobID, JobTitle, TotalApplications, Hires, HireRatePercent
 *    Purpose: Application-to-hire conversion per job posting
 * 
 * 6. vw_TimeToHire
 *    - ApplicationID, FullName, DaysToHire
 *    Purpose: Individual candidate hiring timeline metrics
 * ==========================================================================
 */

/**
 * @route   GET /api/analytics/interviewer-consistency
 * @desc    Get interviewer consistency metrics for bias detection
 * @access  Private (Admin only)
 */
router.get('/interviewer-consistency', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_InterviewerConsistency");
        res.json(data);
    } catch (err) {
        console.error("Interviewer Consistency Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interviewer consistency data." });
    }
});

/**
 * @route   GET /api/analytics/interview-score-decision
 * @desc    Get interview score vs decision correlation data
 * @access  Private (Admin only)
 */
router.get('/interview-score-decision', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_InterviewScoreVsDecision");
        res.json(data);
    } catch (err) {
        console.error("Interview Score vs Decision Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview score vs decision data." });
    }
});

/**
 * @route   GET /api/analytics/rejection-analysis
 * @desc    Get rejection reason analysis breakdown
 * @access  Private (Admin/Recruiter)
 */
router.get('/rejection-analysis', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_RejectionAnalysis");
        res.json(data);
    } catch (err) {
        console.error("Rejection Analysis Error:", err.message);
        res.status(500).json({ error: "Failed to fetch rejection analysis." });
    }
});

/**
 * @route   GET /api/analytics/skill-gap
 * @desc    Get skill gap analysis
 * @access  Public (for demo)
 */
router.get('/skill-gap', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_SkillGapAnalysis");

        // Transform data to match frontend expectations
        // Frontend expects: { SkillName, GapScore, DemandRank }
        // View returns: { SkillName, JobsRequiringSkill, CandidatesWithSkill, SkillGap }

        if (data && data.length > 0) {
            // Calculate max values for normalization
            const maxJobs = Math.max(...data.map(d => d.JobsRequiringSkill || 0));
            const maxCandidates = Math.max(...data.map(d => d.CandidatesWithSkill || 0));

            // Sort by JobsRequiringSkill to determine demand rank
            const sortedByDemand = [...data].sort((a, b) => (b.JobsRequiringSkill || 0) - (a.JobsRequiringSkill || 0));

            // Create a map for quick rank lookup
            const demandRankMap = {};
            sortedByDemand.forEach((item, index) => {
                demandRankMap[item.SkillName] = index + 1;
            });

            // Transform the data
            const transformedData = data.map(item => {
                const jobsReq = item.JobsRequiringSkill || 0;
                const candidates = item.CandidatesWithSkill || 0;

                // Calculate GapScore: use demand-to-supply ratio when available
                // Higher ratio = higher gap = more demand than supply
                let gapScore;
                if (candidates > 0) {
                    // Ratio of jobs to candidates (more jobs per candidate = higher gap)
                    gapScore = Math.min(100, Math.round((jobsReq / candidates) * 50));
                } else if (jobsReq > 0) {
                    // No candidates have this skill but it's in demand = max gap
                    gapScore = 100;
                } else {
                    // Neither jobs nor candidates = no gap
                    gapScore = 0;
                }

                return {
                    SkillName: item.SkillName,
                    // Use calculated gap score
                    GapScore: gapScore,
                    // Demand rank based on jobs requiring the skill
                    DemandRank: demandRankMap[item.SkillName] || 0,
                    // Keep original values for reference
                    JobsRequiringSkill: jobsReq,
                    CandidatesWithSkill: candidates,
                    SkillGap: item.SkillGap
                };
            });

            // Sort by GapScore descending for the chart
            transformedData.sort((a, b) => b.GapScore - a.GapScore);

            res.json(transformedData);
        } else {
            res.json(data);
        }
    } catch (err) {
        console.error("Skill Gap Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skill gap analysis." });
    }
});

/**
 * @route   GET /api/analytics/candidate-engagement
 * @desc    Get candidate engagement and responsiveness metrics
 * @access  Private (Admin/Recruiter)
 */
router.get('/candidate-engagement', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_CandidateEngagement");
        res.json(data);
    } catch (err) {
        console.error("Candidate Engagement Error:", err.message);
        res.status(500).json({ error: "Failed to fetch candidate engagement data." });
    }
});

/**
 * @route   GET /api/analytics/hire-rate-per-job
 * @desc    Get application-to-hire conversion rate per job posting
 * @access  Private (Admin only)
 */
router.get('/hire-rate-per-job', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_HireRatePerJob");
        res.json(data);
    } catch (err) {
        console.error("Hire Rate Per Job Error:", err.message);
        res.status(500).json({ error: "Failed to fetch hire rate per job data." });
    }
});

/**
 * @route   GET /api/analytics/time-to-hire-individual
 * @desc    Get individual candidate time-to-hire metrics
 * @access  Private (Admin only)
 */
router.get('/time-to-hire-individual', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_TimeToHire ORDER BY DaysToHire DESC");
        res.json(data);
    } catch (err) {
        console.error("Time-to-Hire Individual Error:", err.message);
        res.status(500).json({ error: "Failed to fetch individual time-to-hire data." });
    }
});

/**
 * @route   GET /api/analytics/ghosting-detail
 * @desc    Get detailed ghosting risk data
 * @access  Private (Recruiter/Admin)
 */
router.get('/ghosting-detail', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_GhostingRiskDashboard ORDER BY OverallRiskScore DESC");
        res.json(data);
    } catch (err) {
        console.error("Ghosting Detail Error:", err.message);
        res.status(500).json({ error: "Failed to fetch ghosting data." });
    }
});

/**
 * @route   GET /api/analytics/skill-verification
 * @desc    Get skill verification status
 * @access  Private (Recruiter/Admin)
 */
router.get('/skill-verification', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_SkillVerificationStatus");
        res.json(data);
    } catch (err) {
        console.error("Skill Verification Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skill verification data." });
    }
});

/**
 * @route   GET /api/analytics/time-to-hire-detail
 * @desc    Get individual time-to-hire metrics
 * @access  Private (Recruiter/Admin)
 */
router.get('/time-to-hire-detail', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Query with all required fields for the frontend
        // Using simpler Source detection to avoid potential table issues
        const data = await query(`
            SELECT 
                a.ApplicationID,
                c.FullName AS CandidateName,
                j.JobTitle,
                a.AppliedDate,
                h.ChangedAt AS HiredDate,
                DATEDIFF(DAY, a.AppliedDate, h.ChangedAt) AS DaysToHire,
                'Hired' AS ApplicationStatus,
                'Direct' AS Source
            FROM Applications a
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            JOIN ApplicationStatusHistory h ON a.ApplicationID = h.ApplicationID
            WHERE h.ToStatusID = (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Hired')
            ORDER BY DaysToHire DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Time-to-Hire Detail Error:", err.message);
        res.status(500).json({ error: "Failed to fetch time-to-hire data." });
    }
});

/**
 * @route   GET /api/analytics/recruiter-performance
 * @desc    Get recruiter performance metrics
 * @access  Public (for demo)
 */
router.get('/recruiter-performance', async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_RecruiterPerformance");
        res.json(data);
    } catch (err) {
        console.error("Recruiter Performance Error:", err.message);
        res.status(500).json({ error: "Failed to fetch recruiter performance data." });
    }
});

/**
 * @route   GET /api/analytics/consent-status
 * @desc    Get GDPR consent status with candidate names
 * @access  Private (Admin)
 */
router.get('/consent-status', protect, authorize(1), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                cm.ConsentID,
                cm.CandidateID,
                c.FullName AS CandidateName,
                cm.ConsentType,
                cm.ConsentVersion,
                cm.IsActive,
                cm.GivenAt,
                cm.ExpiryDate,
                cm.RevokedAt,
                CASE 
                    WHEN cm.RevokedAt IS NOT NULL THEN 'Revoked'
                    WHEN cm.ExpiryDate < GETDATE() THEN 'Expired'
                    WHEN cm.IsActive = 1 THEN 'Active'
                    ELSE 'Revoked'
                END AS Status
            FROM ConsentManagement cm
            JOIN Candidates c ON cm.CandidateID = c.CandidateID
            ORDER BY cm.GivenAt DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Consent Status Error:", err.message);
        res.status(500).json({ error: "Failed to fetch consent data." });
    }
});

/**
 * @route   GET /api/analytics/vacancy-overview
 * @desc    Get vacancy utilization overview for admin
 * @access  Private (Admin)
 */
router.get('/vacancy-overview', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_VacancyUtilization");
        res.json(data);
    } catch (err) {
        console.error("Vacancy Overview Error:", err.message);
        res.status(500).json({ error: "Failed to fetch vacancy data." });
    }
});

/**
 * @route   POST /api/analytics/predict-hire-success
 * @desc    Predict hiring success probability for an application using Rules-Based AI
 * @access  Private (Recruiter/Admin)
 * @params  { applicationId: number }
 */
router.post('/predict-hire-success', protect, authorize([1, 2]), async (req, res) => {
    try {
        const { applicationId } = req.body;

        if (!applicationId) {
            return res.status(400).json({ error: "Application ID is required." });
        }

        // Call the stored procedure for Rules-Based AI prediction
        const result = await query(`EXEC sp_PredictHireSuccess ?`, [applicationId]);

        if (result && result.length > 0) {
            res.json({
                success: true,
                prediction: {
                    successProbability: result[0].SuccessProbabilityPercent,
                    confidenceLevel: result[0].ConfidenceLevel,
                    factors: {
                        skillMatch: result[0].SkillMatchPercent,
                        experienceMatch: result[0].ExperienceMatchPercent,
                        interviewScore: result[0].InterviewScorePercent,
                        responseEngagement: result[0].ResponseEngagementPercent,
                        historicalSuccess: result[0].HistoricalSuccessRate
                    }
                }
            });
        } else {
            res.status(404).json({ error: "Could not generate prediction for this application." });
        }
    } catch (err) {
        console.error("Predict Hire Success Error:", err.message);
        res.status(500).json({ error: "Failed to predict hire success." });
    }
});

/**
 * @route   GET /api/analytics/applications-for-prediction
 * @desc    Get list of applications eligible for success prediction
 * @access  Private (Recruiter/Admin)
 */
router.get('/applications-for-prediction', protect, authorize([1, 2]), async (req, res) => {
    try {
        // MatchScore is from vw_CandidateMatchScore, not Applications table
        const data = await query(`
            SELECT 
                a.ApplicationID,
                a.CandidateID,
                c.FullName AS CandidateName,
                j.JobID,
                j.JobTitle,
                a.StatusID,
                s.StatusName,
                ISNULL(m.TotalMatchScore, 0) AS MatchScore,
                c.YearsOfExperience,
                j.MinExperience,
                a.AppliedDate
            FROM Applications a
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
            LEFT JOIN vw_CandidateMatchScore m ON a.CandidateID = m.CandidateID AND a.JobID = m.JobID
            WHERE a.IsDeleted = 0
                AND a.StatusID IN (1, 2, 3, 7)
            ORDER BY a.AppliedDate DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Applications for Prediction Error:", err.message);
        console.error("Full error:", err);
        res.status(500).json({ error: "Failed to fetch applications.", details: err.message });
    }
});

/**
 * @route   GET /api/analytics/hire-success-predictions
 * @desc    Get all stored hire success predictions
 * @access  Private (Recruiter/Admin)
 */
router.get('/hire-success-predictions', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                p.PredictionID,
                p.CandidateID,
                c.FullName AS CandidateName,
                j.JobTitle,
                p.SuccessProbability,
                p.KeyFactors,
                c.YearsOfExperience,
                a.StatusID,
                s.StatusName,
                CASE 
                    WHEN p.SuccessProbability >= 0.8 THEN 'High'
                    WHEN p.SuccessProbability >= 0.6 THEN 'Medium'
                    ELSE 'Low'
                END AS ConfidenceLevel
            FROM AI_Predictions p
            JOIN Candidates c ON p.CandidateID = c.CandidateID
            JOIN JobPostings j ON p.JobID = j.JobID
            LEFT JOIN Applications a ON p.ApplicationID = a.ApplicationID
            LEFT JOIN ApplicationStatus s ON a.StatusID = s.StatusID
            ORDER BY p.PredictionID DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Hire Success Predictions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch predictions." });
    }
});

/**
 * @route   POST /api/analytics/predict-onboarding-success
 * @desc    Predict onboarding success for a hired candidate using sp_PredictOnboardingSuccess
 * @access  Private (Recruiter/Admin)
 * @params  { candidateId: number, jobId: number }
 */
router.post('/predict-onboarding-success', protect, authorize([1, 2]), async (req, res) => {
    try {
        const { candidateId, jobId } = req.body;

        if (!candidateId || !jobId) {
            return res.status(400).json({ error: "Candidate ID and Job ID are required." });
        }

        // Call the stored procedure for onboarding success prediction
        const result = await query(`EXEC sp_PredictOnboardingSuccess ?, ?`, [candidateId, jobId]);

        if (result && result.length > 0) {
            res.json({
                success: true,
                prediction: {
                    successProbability: result[0].SuccessProbability,
                    riskLevel: result[0].RiskLevel,
                    riskFactors: result[0].RiskFactors,
                    recommendations: result[0].Recommendations,
                    predictedRetentionMonths: result[0].PredictedRetentionMonths
                }
            });
        } else {
            res.status(404).json({ error: "Could not generate onboarding prediction." });
        }
    } catch (err) {
        console.error("Predict Onboarding Success Error:", err.message);
        res.status(500).json({ error: "Failed to predict onboarding success." });
    }
});

/**
 * @route   GET /api/analytics/hired-candidates
 * @desc    Get list of hired candidates eligible for onboarding prediction
 * @access  Private (Recruiter/Admin)
 */
router.get('/hired-candidates', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                a.ApplicationID,
                a.CandidateID,
                c.FullName AS CandidateName,
                j.JobID,
                j.JobTitle,
                a.StatusID,
                s.StatusName,
                h.ChangedAt AS HiredDate,
                DATEDIFF(DAY, h.ChangedAt, GETDATE()) AS DaysSinceHired,
                c.YearsOfExperience,
                rc.OverallRemoteScore
            FROM Applications a
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            JOIN ApplicationStatus s ON a.StatusID = s.StatusID
            JOIN ApplicationStatusHistory h ON a.ApplicationID = h.ApplicationID
            LEFT JOIN RemoteCompatibility rc ON c.CandidateID = rc.CandidateID
            WHERE a.StatusID = 4
                AND h.ToStatusID = 4
                AND a.IsDeleted = 0
            ORDER BY h.ChangedAt DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Hired Candidates Error:", err.message);
        res.status(500).json({ error: "Failed to fetch hired candidates." });
    }
});

/**
 * @route   GET /api/analytics/onboarding-predictions
 * @desc    Get all stored onboarding predictions
 * @access  Private (Recruiter/Admin)
 */
router.get('/onboarding-predictions', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT 
                op.PredictionID,
                op.CandidateID,
                c.FullName AS CandidateName,
                j.JobTitle,
                op.SuccessProbability,
                op.RiskLevel,
                op.RiskFactors,
                op.Recommendations,
                op.PredictedRetentionMonths,
                op.PredictedAt
            FROM OnboardingPredictions op
            JOIN Candidates c ON op.CandidateID = c.CandidateID
            JOIN JobPostings j ON op.JobID = j.JobID
            ORDER BY op.PredictedAt DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Onboarding Predictions Error:", err.message);
        // Table might not exist yet, return empty array
        res.json([]);
    }
});

/**
 * @route   GET /api/analytics/sentiment-trends
 * @desc    Get sentiment trends across all candidates
 * @access  Private (Recruiter/Admin)
 */
router.get('/sentiment-trends', protect, authorize([1, 2]), async (req, res) => {
    try {
        // Get overall sentiment statistics
        const overallStats = await query(`
            SELECT 
                COUNT(*) AS TotalInteractions,
                ISNULL(AVG(SentimentScore), 0) AS AvgSentimentScore,
                ISNULL(AVG(Confidence), 0) AS AvgConfidence,
                ISNULL(SUM(RedFlagsDetected), 0) AS TotalRedFlags,
                ISNULL(SUM(PositiveIndicators), 0) AS TotalPositiveIndicators
            FROM CandidateSentiment
        `);

        // Get sentiment by interaction type
        const byType = await query(`
            SELECT 
                InteractionType,
                COUNT(*) AS Count,
                AVG(SentimentScore) AS AvgSentiment,
                AVG(Confidence) AS AvgConfidence
            FROM CandidateSentiment
            GROUP BY InteractionType
            ORDER BY Count DESC
        `);

        // Get sentiment trend over time (last 30 days)
        const trend = await query(`
            SELECT 
                CAST(InteractionDate AS DATE) AS Date,
                COUNT(*) AS InteractionCount,
                AVG(SentimentScore) AS AvgSentiment
            FROM CandidateSentiment
            WHERE InteractionDate >= DATEADD(day, -30, GETDATE())
            GROUP BY CAST(InteractionDate AS DATE)
            ORDER BY Date DESC
        `);

        // Get candidates with declining sentiment (at-risk)
        const atRisk = await query(`
            SELECT TOP 10
                c.CandidateID,
                c.FullName,
                AVG(cs.SentimentScore) AS AvgSentiment,
                SUM(cs.RedFlagsDetected) AS RedFlags,
                MAX(cs.InteractionDate) AS LastInteraction
            FROM CandidateSentiment cs
            JOIN Candidates c ON cs.CandidateID = c.CandidateID
            WHERE cs.InteractionDate >= DATEADD(day, -14, GETDATE())
            GROUP BY c.CandidateID, c.FullName
            HAVING AVG(cs.SentimentScore) < 0
            ORDER BY AvgSentiment ASC
        `);

        // Get communication style distribution
        const styleDistribution = await query(`
            SELECT 
                CommunicationStyle,
                COUNT(*) AS Count,
                AVG(SentimentScore) AS AvgSentiment
            FROM CandidateSentiment
            WHERE CommunicationStyle IS NOT NULL
            GROUP BY CommunicationStyle
            ORDER BY Count DESC
        `);

        res.json({
            overall: overallStats[0],
            byType,
            trend,
            atRisk,
            styleDistribution
        });
    } catch (err) {
        console.error("Sentiment Trends Error:", err.message);
        res.status(500).json({ error: "Failed to fetch sentiment trends." });
    }
});

/**
 * @route   GET /api/analytics/sentiment-at-risk
 * @desc    Get candidates with declining sentiment (at-risk for disengagement)
 * @access  Private (Recruiter/Admin)
 */
router.get('/sentiment-at-risk', protect, authorize([1, 2]), async (req, res) => {
    try {
        const atRiskCandidates = await query(`
            SELECT 
                c.CandidateID,
                c.FullName,
                c.Location,
                c.YearsOfExperience,
                COUNT(cs.SentimentID) AS TotalInteractions,
                AVG(cs.SentimentScore) AS AvgSentimentScore,
                SUM(cs.RedFlagsDetected) AS TotalRedFlags,
                SUM(cs.PositiveIndicators) AS TotalPositiveIndicators,
                MAX(cs.InteractionDate) AS LastInteraction,
                MIN(cs.SentimentScore) AS LowestScore,
                MAX(cs.SentimentScore) AS HighestScore,
                -- Calculate sentiment trend (recent vs older)
                CASE 
                    WHEN AVG(CASE WHEN cs.InteractionDate >= DATEADD(day, -7, GETDATE()) THEN cs.SentimentScore ELSE NULL END) <
                         AVG(CASE WHEN cs.InteractionDate < DATEADD(day, -7, GETDATE()) THEN cs.SentimentScore ELSE NULL END)
                    THEN 'Declining'
                    ELSE 'Stable'
                END AS Trend
            FROM CandidateSentiment cs
            JOIN Candidates c ON cs.CandidateID = c.CandidateID
            GROUP BY c.CandidateID, c.FullName, c.Location, c.YearsOfExperience
            HAVING AVG(cs.SentimentScore) < 0.2 OR SUM(cs.RedFlagsDetected) > 2
            ORDER BY AvgSentimentScore ASC
        `);

        res.json(atRiskCandidates);
    } catch (err) {
        console.error("At-Risk Candidates Error:", err.message);
        res.status(500).json({ error: "Failed to fetch at-risk candidates." });
    }
});

/**
 * @route   GET /api/analytics/diversity-goals
 * @desc    Get all diversity goals
 * @access  Private (Admin/Recruiter)
 */
router.get('/diversity-goals', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT dg.GoalID, dg.MetricType, dg.TargetPercentage, dg.CurrentPercentage, 
                   dg.StartDate, dg.EndDate, dg.IsActive, u.Username as RecruiterName
            FROM DiversityGoals dg
            LEFT JOIN Recruiters r ON dg.RecruiterID = r.RecruiterID
            LEFT JOIN Users u ON r.UserID = u.UserID
            ORDER BY dg.StartDate DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Diversity Goals Error:", err.message);
        res.status(500).json({ error: "Failed to fetch diversity goals." });
    }
});

/**
 * @route   POST /api/analytics/diversity-goals
 * @desc    Create a new diversity goal
 * @access  Private (Admin/Recruiter)
 */
router.post('/diversity-goals', protect, authorize([1, 2]), async (req, res) => {
    try {
        const { metricType, targetPercentage, startDate, endDate } = req.body;
        const userID = req.user.UserID;

        // Get recruiter ID (nullable for Admins who might not have a recruiter record)
        let recruiterID = null;
        const recruiter = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [userID]);
        if (recruiter.length > 0) {
            recruiterID = recruiter[0].RecruiterID;
        }

        const result = await query(`
            INSERT INTO DiversityGoals (RecruiterID, MetricType, TargetPercentage, CurrentPercentage, StartDate, EndDate, IsActive)
            OUTPUT inserted.GoalID
            VALUES (?, ?, ?, 0, ?, ?, 1)
        `, [recruiterID, metricType, targetPercentage, startDate, endDate]);

        res.status(201).json({
            success: true,
            goalId: result[0].GoalID,
            message: "Diversity goal created successfully."
        });
    } catch (err) {
        console.error("Create Diversity Goal Error:", err.message);
        res.status(500).json({ error: "Failed to create diversity goal." });
    }
});

/**
 * @route   GET /api/analytics/bias-logs
 * @desc    Get bias detection logs
 * @access  Private (Admin/Recruiter)
 */
router.get('/bias-logs', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query(`
            SELECT bdl.DetectionID, bdl.DetectionType, bdl.Severity, bdl.Details, 
                   bdl.SuggestedActions, bdl.DetectedAt, bdl.ResolvedAt, bdl.IsResolved,
                   u.Username as RecruiterName
            FROM BiasDetectionLogs bdl
            LEFT JOIN Recruiters r ON bdl.RecruiterID = r.RecruiterID
            LEFT JOIN Users u ON r.UserID = u.UserID
            ORDER BY bdl.DetectedAt DESC
        `);
        res.json(data);
    } catch (err) {
        console.error("Bias Logs Error:", err.message);
        res.status(500).json({ error: "Failed to fetch bias logs." });
    }
});

/**
 * @route   PUT /api/analytics/bias-logs/:id/resolve
 * @desc    Mark a bias log as resolved
 * @access  Private (Admin)
 */
router.put('/bias-logs/:id/resolve', protect, authorize(1), async (req, res) => {
    try {
        const { id } = req.params;

        await query(`
            UPDATE BiasDetectionLogs 
            SET IsResolved = 1, ResolvedAt = GETDATE()
            WHERE DetectionID = ?
        `, [id]);

        res.json({ success: true, message: "Bias log marked as resolved." });
    } catch (err) {
        console.error("Resolve Bias Log Error:", err.message);
        res.status(500).json({ error: "Failed to resolve bias log." });
    }
});

module.exports = router;
