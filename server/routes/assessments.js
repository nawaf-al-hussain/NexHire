const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

// ----------------------------------------------------
// [GET] /available
// Fetch all MicroAssessments matching Candidate's unverified skills
// ----------------------------------------------------
router.get('/available', protect, authorize([3]), async (req, res) => {
    try {
        const userID = req.user.UserID;

        // 1. Get CandidateID
        const candCheck = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candCheck.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateId = candCheck[0].CandidateID;

        // 2. Query available assessments for claimed (but unverified) skills
        // We look for CandidateSkills that don't have a passing SkillVerifications record
        const assessments = await query(`
            SELECT 
                ma.AssessmentID, 
                ma.SkillID, 
                s.SkillName,
                ma.AssessmentType, 
                ma.Title, 
                ma.Description, 
                ma.TimeLimit, 
                ma.PassingScore, 
                ma.QuestionsCount 
            FROM MicroAssessments ma
            JOIN Skills s ON ma.SkillID = s.SkillID
            JOIN CandidateSkills cs ON cs.SkillID = ma.SkillID AND cs.CandidateID = ?
            LEFT JOIN SkillVerifications sv ON sv.CandidateID = cs.CandidateID AND sv.SkillID = cs.SkillID AND sv.VerificationScore >= ma.PassingScore
            WHERE ma.IsActive = 1 AND sv.VerificationID IS NULL
        `, [candidateId]);

        res.json(assessments);
    } catch (err) {
        console.error("Error fetching available assessments:", err.message);
        res.status(500).json({ error: "Failed to fetch top assessments." });
    }
});

// ----------------------------------------------------
// [POST] /start
// Starts an assessment attempt, creating a row in AssessmentAttempts
// ----------------------------------------------------
router.post('/start', protect, authorize([3]), async (req, res) => {
    const { assessmentId } = req.body;
    try {
        const userID = req.user.UserID;

        const candCheck = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candCheck.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateId = candCheck[0].CandidateID;

        // Verify assessment exists
        const assessmentCheck = await query("SELECT * FROM MicroAssessments WHERE AssessmentID = ? AND IsActive = 1", [assessmentId]);
        if (assessmentCheck.length === 0) return res.status(404).json({ error: "Assessment not found or inactive." });

        // Insert new attempt record
        // Using OUTPUT inserted.AttemptID to return the ID directly
        const startResult = await query(`
            INSERT INTO AssessmentAttempts (CandidateID, AssessmentID, StartedAt, IsPassed)
            OUTPUT inserted.AttemptID
            VALUES (?, ?, GETDATE(), 0)
        `, [candidateId, assessmentId]);

        const attemptId = startResult[0].AttemptID;

        res.status(201).json({ success: true, attemptId, assessment: assessmentCheck[0] });
    } catch (err) {
        console.error("Error starting assessment:", err.message);
        res.status(500).json({ error: "Failed to start assessment." });
    }
});

// ----------------------------------------------------
// [POST] /submit
// Completes an attempt, calculates pass/fail, writes to SkillVerifications if passed
// ----------------------------------------------------
router.post('/submit', protect, authorize([3]), async (req, res) => {
    const { attemptId, score, timeSpentSeconds, details } = req.body;
    try {
        const userID = req.user.UserID;

        const candCheck = await query("SELECT CandidateID FROM Candidates WHERE UserID = ?", [userID]);
        if (candCheck.length === 0) return res.status(404).json({ error: "Candidate profile not found." });
        const candidateId = candCheck[0].CandidateID;

        // Ensure attempt exists and belongs to candidate
        const attemptCheck = await query(`
            SELECT a.*, m.PassingScore, m.SkillID
            FROM AssessmentAttempts a
            JOIN MicroAssessments m ON a.AssessmentID = m.AssessmentID
            WHERE a.AttemptID = ? AND a.CandidateID = ?
        `, [attemptId, candidateId]);

        if (attemptCheck.length === 0) {
            return res.status(404).json({ error: "Assessment attempt not found." });
        }

        const attemptInfo = attemptCheck[0];
        if (attemptInfo.CompletedAt != null) {
            return res.status(400).json({ error: "Assessment already completed." });
        }

        const isPassed = score >= attemptInfo.PassingScore ? 1 : 0;

        // 1. Update the attempts record
        await query(`
            UPDATE AssessmentAttempts 
            SET CompletedAt = GETDATE(), Score = ?, TimeSpentSeconds = ?, IsPassed = ?, Details = ?
            WHERE AttemptID = ?
        `, [score, timeSpentSeconds, isPassed, details, attemptId]);

        // 2. If passed, store it in SkillVerifications
        let verificationId = null;
        if (isPassed) {
            // Upsert / Insert logic for verification
            const verifyInsert = await query(`
                INSERT INTO SkillVerifications (CandidateID, SkillID, AssessmentID, VerificationMethod, VerificationScore, VerifiedAt, IsVerified)
                OUTPUT inserted.VerificationID
                VALUES (?, ?, ?, 'CodeTest', ?, GETDATE(), 1)
            `, [candidateId, attemptInfo.SkillID, attemptInfo.AssessmentID, score]);

            verificationId = verifyInsert[0].VerificationID;
        }

        res.status(200).json({ success: true, isPassed, verificationId });
    } catch (err) {
        console.error("Error submitting assessment:", err.message);
        require('fs').writeFileSync('submit_error.log', JSON.stringify({
            message: err.message,
            stack: err.stack,
            body: req.body,
            id: userID
        }, null, 2));
        res.status(500).json({ error: "Failed to submit assessment.", details: err.message });
    }
});

module.exports = router;
