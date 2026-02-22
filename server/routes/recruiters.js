const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/recruiters/talent-pool
 * @desc    Get all candidates with integrated insights
 * @access  Private (Recruiter/Admin)
 */
router.get('/talent-pool', protect, authorize([1, 2]), async (req, res) => {
    try {
        const candidates = await query(`
            SELECT 
                c.CandidateID, 
                c.FullName, 
                c.Location, 
                c.YearsExperience,
                c.ReferralSource,
                ri.QualityScore as ResumeScore,
                gr.OverallRiskLevel as GhostingRisk,
                (SELECT STRING_AGG(s.SkillName, ', ') 
                 FROM CandidateSkills cs 
                 JOIN Skills s ON cs.SkillID = s.SkillID 
                 WHERE cs.CandidateID = c.CandidateID) as Skills
            FROM Candidates c
            LEFT JOIN ResumeInsights ri ON c.CandidateID = ri.CandidateID
            LEFT JOIN vw_GhostingRiskDashboard gr ON c.CandidateID = gr.CandidateID
            WHERE c.IsDeleted = 0
            ORDER BY c.FullName ASC
        `);
        res.json(candidates);
    } catch (err) {
        console.error("Talent Pool Fetch Error:", err.message);
        res.status(500).json({ error: "Failed to fetch talent pool." });
    }
});

/**
 * @route   POST /api/recruiters/search
 * @desc    Fuzzy search candidates by name
 * @access  Private (Recruiter/Admin)
 */
router.post('/search', protect, authorize([1, 2]), async (req, res) => {
    const { name, threshold } = req.body;
    if (!name) return res.status(400).json({ error: "Search name is required." });

    try {
        const results = await query(
            "EXEC sp_FuzzySearchCandidates ?, ?",
            [name, threshold || 0.85]
        );
        res.json(results);
    } catch (err) {
        console.error("Fuzzy Search Error:", err.message);
        res.status(500).json({ error: "Search failed." });
    }
});

module.exports = router;
