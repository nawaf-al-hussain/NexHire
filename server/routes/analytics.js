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
 * @desc    Get diversity analytics funnel
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
        res.json(data);
    } catch (err) {
        console.error("Remote Compatibility Error:", err.message);
        res.status(500).json({ error: "Failed to fetch remote compatibility data." });
    }
});

/**
 * @route   GET /api/analytics/career-path
 * @desc    Get career path insights
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

/**
 * @route   GET /api/analytics/interviewer-consistency
 * @desc    Get interviewer consistency metrics
 * @access  Private (Recruiter/Admin)
 */
router.get('/interviewer-consistency', protect, authorize([1, 2]), async (req, res) => {
    try {
        const data = await query("SELECT * FROM vw_InterviewerConsistency");
        res.json(data);
    } catch (err) {
        console.error("Interviewer Consistency Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interviewer consistency data." });
    }
});

/**
 * @route   GET /api/analytics/rejection-analysis
 * @desc    Get rejection reason analysis
 * @access  Private (Recruiter/Admin)
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
        res.json(data);
    } catch (err) {
        console.error("Skill Gap Error:", err.message);
        res.status(500).json({ error: "Failed to fetch skill gap analysis." });
    }
});

/**
 * @route   GET /api/analytics/candidate-engagement
 * @desc    Get candidate engagement scoring
 * @access  Private (Recruiter/Admin)
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
        const data = await query("SELECT * FROM vw_TimeToHire ORDER BY DaysToHire DESC");
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
 * @desc    Get GDPR consent status
 * @access  Private (Admin)
 */
router.get('/consent-status', protect, authorize(1), async (req, res) => {
    try {
        const data = await query("SELECT * FROM ConsentManagement");
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

module.exports = router;
