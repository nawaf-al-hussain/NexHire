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
            SELECT i.ScheduleID, i.InterviewStart, i.InterviewEnd, i.CandidateConfirmed, 
                   c.FullName as CandidateName, j.JobTitle, a.ApplicationID,
                   CASE WHEN i.InterviewStart > GETDATE() THEN 'Upcoming' ELSE 'Completed' END AS Status,
                   DATEDIFF(MINUTE, i.InterviewStart, i.InterviewEnd) AS Duration,
                   'Video Call' AS Platform
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

/**
 * @route   POST /api/interviews/feedback
 * @desc    Submit interview feedback with scores and comments
 * @access  Private (Recruiter)
 * 
 * InterviewFeedback table columns:
 * - FeedbackID (INT, identity)
 * - ApplicationID (INT, FK)
 * - InterviewerID (INT, FK from Users)
 * - TechnicalScore (INT, 1-10)
 * - CommunicationScore (INT, 1-10)
 * - CultureFitScore (INT, 1-10)
 * - Comments (NVARCHAR, optional)
 * - SentimentScore (FLOAT, calculated by CLR trigger)
 * - CreatedAt (DATETIME, default GETDATE())
 */
router.post('/feedback', protect, authorize(2), async (req, res) => {
    const { applicationId, technicalScore, communicationScore, cultureFitScore, comments } = req.body;
    const userID = req.user.UserID;

    // Validate required fields
    if (!applicationId || !technicalScore || !communicationScore || !cultureFitScore) {
        return res.status(400).json({ error: "Missing required fields: applicationId, technicalScore, communicationScore, cultureFitScore." });
    }

    // Validate score ranges (1-10)
    const scores = [technicalScore, communicationScore, cultureFitScore];
    if (scores.some(s => s < 1 || s > 10 || !Number.isInteger(s))) {
        return res.status(400).json({ error: "Scores must be integers between 1 and 10." });
    }

    try {
        // Get RecruiterID from UserID
        const recruiterCheck = await query("SELECT RecruiterID, UserID FROM Recruiters WHERE UserID = ?", [userID]);
        if (recruiterCheck.length === 0) {
            console.error("Feedback Error: User not registered as recruiter. UserID:", userID);
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // InterviewerID should be the UserID (not RecruiterID) per the FK constraint
        const interviewerId = recruiterCheck[0].UserID;  // Use UserID for InterviewerID FK
        console.log("Submitting feedback - UserID:", userID, "InterviewerID:", interviewerId, "RecruiterID:", recruiterCheck[0].RecruiterID);

        // Verify application exists and is at Interview stage
        const appCheck = await query(`
            SELECT a.ApplicationID, a.StatusID, s.StatusName 
            FROM Applications a
            JOIN ApplicationStatus s ON a.StatusID = s.StatusID
            WHERE a.ApplicationID = ?
        `, [applicationId]);

        if (appCheck.length === 0) {
            return res.status(404).json({ error: "Application not found." });
        }

        // Only allow feedback for applications at Interview stage (3)
        if (appCheck[0].StatusID !== 3) {
            return res.status(400).json({ error: `Cannot submit feedback. Application is at "${appCheck[0].StatusName}" stage (requires Interview stage).` });
        }

        // Insert feedback - use SCOPE_IDENTITY() instead of OUTPUT clause
        // (SQL Server doesn't allow OUTPUT clause when table has enabled triggers)
        await query(`
            INSERT INTO InterviewFeedback (ApplicationID, InterviewerID, TechnicalScore, CommunicationScore, CultureFitScore, Comments)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [applicationId, interviewerId, technicalScore, communicationScore, cultureFitScore, comments || null]);

        // Get the inserted ID using SCOPE_IDENTITY
        const idResult = await query("SELECT SCOPE_IDENTITY() AS FeedbackID");
        const feedbackId = idResult[0].FeedbackID;

        console.log("Feedback submitted successfully. FeedbackID:", feedbackId);

        res.status(201).json({
            success: true,
            message: "Interview feedback submitted successfully.",
            feedbackId: feedbackId
        });
    } catch (err) {
        console.error("Submit Feedback Error:", err.message);
        res.status(500).json({ error: "Failed to submit interview feedback." });
    }
});

/**
 * @route   GET /api/interviews/feedback/:applicationId
 * @desc    Get all feedback for a specific application
 * @access  Private (Recruiter)
 */
router.get('/feedback/:applicationId', protect, authorize(2), async (req, res) => {
    const { applicationId } = req.params;

    try {
        const feedback = await query(`
            SELECT f.FeedbackID, f.TechnicalScore, f.CommunicationScore, f.CultureFitScore, 
                   f.Comments, f.SentimentScore, f.CreatedAt,
                   u.Username as InterviewerName,
                   c.FullName as CandidateName,
                   j.JobTitle
            FROM InterviewFeedback f
            JOIN Users u ON f.InterviewerID = u.UserID
            JOIN Applications a ON f.ApplicationID = a.ApplicationID
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            WHERE f.ApplicationID = ?
            ORDER BY f.CreatedAt DESC
        `, [applicationId]);

        // Calculate average scores
        if (feedback.length > 0) {
            const avgScores = feedback.reduce((acc, f) => {
                acc.technical += f.TechnicalScore;
                acc.communication += f.CommunicationScore;
                acc.culture += f.CultureFitScore;
                return acc;
            }, { technical: 0, communication: 0, culture: 0 });

            const count = feedback.length;
            feedback.averageScores = {
                technical: (avgScores.technical / count).toFixed(1),
                communication: (avgScores.communication / count).toFixed(1),
                cultureFit: (avgScores.culture / count).toFixed(1),
                overall: ((avgScores.technical + avgScores.communication + avgScores.culture) / (count * 3)).toFixed(1)
            };
        }

        res.json(feedback);
    } catch (err) {
        console.error("Fetch Feedback Error:", err.message);
        res.status(500).json({ error: "Failed to fetch interview feedback." });
    }
});

/**
 * @route   POST /api/interviews/transcription
 * @desc    Create a new transcription record for an interview
 * @access  Private (Recruiter)
 * 
 * InterviewTranscriptions table columns (actual):
 * - TranscriptionID (INT, identity)
 * - ScheduleID (INT, FK)
 * - InterviewID (INT, nullable)
 * - AudioFileURL (NVARCHAR)
 * - VideoFileURL (NVARCHAR)
 * - TranscriptionText (NVARCHAR)
 * - SpeakerDiarization (NVARCHAR)
 * - SentimentBySegment (NVARCHAR)
 * - ConfidenceScore (DECIMAL)
 * - ProcessingStatus (VARCHAR)
 * - ProcessedAt (DATETIME)
 * - CreatedAt (DATETIME)
 */
router.post('/transcription', protect, authorize(2), async (req, res) => {
    const { scheduleId, videoFileUrl } = req.body;
    const userID = req.user.UserID;

    if (!scheduleId) {
        return res.status(400).json({ error: "Missing required field: scheduleId." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // Verify schedule exists
        const scheduleCheck = await query(`
            SELECT i.ScheduleID, i.ApplicationID, c.FullName as CandidateName, j.JobTitle
            FROM InterviewSchedules i
            JOIN Applications a ON i.ApplicationID = a.ApplicationID
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            WHERE i.ScheduleID = ?
        `, [scheduleId]);

        if (scheduleCheck.length === 0) {
            return res.status(404).json({ error: "Interview schedule not found." });
        }

        // Insert transcription record
        const result = await query(`
            INSERT INTO InterviewTranscriptions (ScheduleID, AudioFileURL, ProcessingStatus)
            OUTPUT inserted.TranscriptionID
            VALUES (?, ?, 'Pending')
        `, [scheduleId, videoFileUrl || null]);

        res.status(201).json({
            success: true,
            message: "Transcription record created. Upload video to process.",
            transcriptionId: result[0].TranscriptionID,
            candidateName: scheduleCheck[0].CandidateName,
            jobTitle: scheduleCheck[0].JobTitle
        });
    } catch (err) {
        console.error("Create Transcription Error:", err.message);
        res.status(500).json({ error: "Failed to create transcription record." });
    }
});

/**
 * @route   GET /api/interviews/transcription/:scheduleId
 * @desc    Get transcription for a specific interview schedule
 * @access  Private (Recruiter)
 */
router.get('/transcription/:scheduleId', protect, authorize(2), async (req, res) => {
    const { scheduleId } = req.params;

    try {
        const transcription = await query(`
            SELECT t.TranscriptionID, t.ScheduleID, t.AudioFileURL, t.TranscriptionText, 
                   t.SpeakerDiarization, t.SentimentBySegment, t.ConfidenceScore, t.ProcessingStatus, t.ProcessedAt, t.CreatedAt,
                   c.FullName as CandidateName, j.JobTitle
            FROM InterviewTranscriptions t
            JOIN InterviewSchedules i ON t.ScheduleID = i.ScheduleID
            JOIN Applications a ON i.ApplicationID = a.ApplicationID
            JOIN Candidates c ON a.CandidateID = c.CandidateID
            JOIN JobPostings j ON a.JobID = j.JobID
            WHERE t.ScheduleID = ?
            ORDER BY t.CreatedAt DESC
        `, [scheduleId]);

        res.json(transcription);
    } catch (err) {
        console.error("Fetch Transcription Error:", err.message);
        res.status(500).json({ error: "Failed to fetch transcription." });
    }
});

/**
 * @route   POST /api/interviews/transcription/:transcriptionId/process
 * @desc    Process transcription - extract topics, sentiment, filler words (simulated AI)
 * @access  Private (Recruiter)
 */
router.post('/transcription/:transcriptionId/process', protect, authorize(2), async (req, res) => {
    const { transcriptionId } = req.params;
    const { transcriptionText } = req.body;

    if (!transcriptionText) {
        return res.status(400).json({ error: "Missing required field: transcriptionText." });
    }

    try {
        // Simulate AI processing
        const fillerWords = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally'];
        const words = transcriptionText.toLowerCase().split(/\s+/);
        let fillerCount = 0;

        words.forEach(word => {
            if (fillerWords.some(fw => word.includes(fw))) {
                fillerCount++;
            }
        });

        // Extract key topics (simple keyword extraction) - store in SpeakerDiarization
        const jobKeywords = ['javascript', 'react', 'node', 'python', 'sql', 'aws', 'docker', 'kubernetes', 'agile', 'scrum', 'leadership', 'team', 'project', 'management', 'design', 'testing', 'debugging'];
        const foundTopics = jobKeywords.filter(topic => transcriptionText.toLowerCase().includes(topic));
        const keyTopics = foundTopics.length > 0 ? foundTopics.join(', ') : 'General Discussion';

        // Generate action items based on common patterns - we'll add to transcription as notes
        const actionItems = [];
        if (transcriptionText.toLowerCase().includes('follow up')) actionItems.push('Follow up with candidate');
        if (transcriptionText.toLowerCase().includes('schedule')) actionItems.push('Schedule next round');
        if (transcriptionText.toLowerCase().includes('reference')) actionItems.push('Check references');
        if (transcriptionText.toLowerCase().includes('offer')) actionItems.push('Prepare offer');
        if (actionItems.length === 0) actionItems.push('Review candidate fit');

        // Calculate sentiment (simplified)
        const positiveWords = ['great', 'excellent', 'good', 'strong', 'impressive', 'qualified', 'experience', 'skill'];
        const negativeWords = ['concern', 'weak', 'lack', 'problem', 'issue', 'struggle', 'difficult'];

        let sentimentScore = 0;
        positiveWords.forEach(w => { if (transcriptionText.toLowerCase().includes(w)) sentimentScore += 0.1; });
        negativeWords.forEach(w => { if (transcriptionText.toLowerCase().includes(w)) sentimentScore -= 0.1; });
        sentimentScore = Math.max(-1, Math.min(1, sentimentScore));

        // Determine sentiment label
        let sentimentLabel = 'Neutral';
        if (sentimentScore >= 0.5) sentimentLabel = 'Very Positive';
        else if (sentimentScore >= 0.2) sentimentLabel = 'Positive';
        else if (sentimentScore >= -0.2) sentimentLabel = 'Neutral';
        else if (sentimentScore >= -0.5) sentimentLabel = 'Negative';
        else sentimentLabel = 'Very Negative';

        // Build speaker diarization with key topics and action items
        const speakerDiarization = JSON.stringify({
            keyTopics: keyTopics,
            actionItems: actionItems.join('; '),
            fillerWordCount: fillerCount,
            sentiment: sentimentLabel
        });

        // Update transcription record - only use columns that exist in DB
        await query(`
            UPDATE InterviewTranscriptions 
            SET TranscriptionText = ?, 
                SpeakerDiarization = ?,
                SentimentBySegment = ?,
                ConfidenceScore = ?,
                ProcessingStatus = 'Completed',
                ProcessedAt = GETDATE()
            WHERE TranscriptionID = ?
        `, [transcriptionText, speakerDiarization, sentimentLabel, parseFloat(sentimentScore.toFixed(2)), transcriptionId]);

        res.json({
            success: true,
            message: "Transcription processed successfully.",
            analysis: {
                keyTopics,
                actionItems: actionItems.join('; '),
                fillerWordCount: fillerCount,
                sentimentScore: sentimentScore.toFixed(2)
            }
        });
    } catch (err) {
        console.error("Process Transcription Error:", err.message);
        res.status(500).json({ error: "Failed to process transcription." });
    }
});

/**
 * @route   POST /api/interviews/generate-questions
 * @desc    Generate interview questions based on job requirements
 * @access  Private (Recruiter)
 */
router.post('/generate-questions', protect, authorize(2), async (req, res) => {
    const { jobId, questionCount, difficultyLevel } = req.body;

    if (!jobId) {
        return res.status(400).json({ error: "Missing required field: jobId." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [req.user.UserID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // Verify job exists
        const jobCheck = await query("SELECT JobID, JobTitle, Location FROM JobPostings WHERE JobID = ?", [jobId]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        const job = jobCheck[0];
        const count = questionCount || 10;
        const difficulty = difficultyLevel || 5;

        // Call the stored procedure with positional parameters
        let questions;
        try {
            questions = await query(
                "EXEC sp_GenerateInterviewQuestions @JobID = ?, @QuestionCount = ?, @DifficultyLevel = ?",
                [jobId, count, difficulty]
            );
        } catch (spError) {
            console.error("Stored Procedure Error:", spError.message);
            // If stored procedure fails, generate questions dynamically
            const jobSkills = await query(
                "SELECT js.SkillID, s.SkillName, js.IsMandatory FROM JobSkills js JOIN Skills s ON js.SkillID = s.SkillID WHERE js.JobID = ? AND js.IsMandatory = 1",
                [jobId]
            );

            questions = [];

            // Generate technical questions based on job skills
            jobSkills.forEach(skill => {
                questions.push({
                    QuestionType: 'Technical',
                    SkillName: skill.SkillName,
                    QuestionText: `Explain your experience with ${skill.SkillName} and provide an example project.`,
                    ExpectedKeywords: JSON.stringify(["experience", "project", "implementation", "challenge"]),
                    ScoringGuide: "Assess depth of knowledge, practical application, problem-solving",
                    DifficultyLevel: difficulty,
                    Priority: skill.IsMandatory ? 'High Priority' : 'Medium Priority'
                });
            });

            // Add behavioral question
            questions.push({
                QuestionType: 'Behavioral',
                SkillName: 'General',
                QuestionText: "Tell me about a time you faced a significant challenge at work and how you overcame it.",
                ExpectedKeywords: JSON.stringify(["challenge", "action", "result", "learning"]),
                ScoringGuide: "Assess problem-solving, resilience, learning ability",
                DifficultyLevel: difficulty,
                Priority: 'Standard'
            });

            // Add cultural question
            questions.push({
                QuestionType: 'Cultural',
                SkillName: 'Teamwork',
                QuestionText: "Describe your ideal work environment and team dynamics.",
                ExpectedKeywords: JSON.stringify(["collaboration", "communication", "values", "environment"]),
                ScoringGuide: "Assess cultural fit, team compatibility, work preferences",
                DifficultyLevel: difficulty,
                Priority: 'Standard'
            });
        }

        // Handle multiple result sets or single result
        if (!questions || questions.length === 0 || !Array.isArray(questions)) {
            questions = [];
        }

        // Format response
        const formattedQuestions = questions.map(q => ({
            questionType: q.QuestionType,
            skillName: q.SkillName,
            questionText: q.QuestionText,
            expectedKeywords: q.ExpectedKeywords ? (typeof q.ExpectedKeywords === 'string' ? JSON.parse(q.ExpectedKeywords) : q.ExpectedKeywords) : [],
            scoringGuide: q.ScoringGuide,
            difficultyLevel: q.DifficultyLevel,
            priority: q.Priority
        }));

        res.json({
            success: true,
            job: {
                jobId: job.JobID,
                jobTitle: job.JobTitle,
                location: job.Location
            },
            questions: formattedQuestions,
            totalQuestions: formattedQuestions.length
        });
    } catch (err) {
        console.error("Generate Questions Error:", err.message);
        res.status(500).json({ error: "Failed to generate interview questions." });
    }
});

/**
 * @route   GET /api/interviews/generated-questions/:jobId
 * @desc    Get previously generated questions for a job
 * @access  Private (Recruiter)
 */
router.get('/generated-questions/:jobId', protect, authorize(2), async (req, res) => {
    const { jobId } = req.params;

    try {
        const questions = await query(`
            SELECT QuestionID, QuestionType, SkillID, DifficultyLevel, QuestionText, 
                   ExpectedAnswerKeywords, ScoringRubric, UsedCount, SuccessRate, 
                   LastUsed, IsActive
            FROM AI_GeneratedQuestions 
            WHERE JobID = ? AND IsActive = 1
            ORDER BY UsedCount DESC, QuestionID
        `, [jobId]);

        res.json(questions);
    } catch (err) {
        console.error("Fetch Generated Questions Error:", err.message);
        res.status(500).json({ error: "Failed to fetch generated questions." });
    }
});

/**
 * @route   POST /api/interviews/save-question
 * @desc    Save a generated question to the database for reuse
 * @access  Private (Recruiter)
 */
router.post('/save-question', protect, authorize(2), async (req, res) => {
    const { jobId, skillId, questionType, difficultyLevel, questionText, expectedKeywords, scoringRubric } = req.body;

    if (!jobId || !questionType || !questionText) {
        return res.status(400).json({ error: "Missing required fields: jobId, questionType, questionText." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [req.user.UserID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // Insert the question
        const result = await query(`
            INSERT INTO AI_GeneratedQuestions (JobID, SkillID, QuestionType, DifficultyLevel, QuestionText, ExpectedAnswerKeywords, ScoringRubric)
            OUTPUT inserted.QuestionID
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            jobId,
            skillId || null,
            questionType,
            difficultyLevel || 5,
            questionText,
            expectedKeywords ? JSON.stringify(expectedKeywords) : null,
            scoringRubric || null
        ]);

        res.status(201).json({
            success: true,
            message: "Question saved successfully.",
            questionId: result[0].QuestionID
        });
    } catch (err) {
        console.error("Save Question Error:", err.message);
        res.status(500).json({ error: "Failed to save question." });
    }
});

/**
 * @route   POST /api/interviews/optimize-rounds
 * @desc    Optimize interview rounds for a candidate-job pair - reduce redundancy and fatigue
 * @access  Private (Recruiter)
 * 
 * Calls sp_OptimizeInterviewRounds to analyze:
 * - Already assessed skills from candidate's interview history
 * - Redundant questions from InterviewSharedInsights
 * - Required skills from the job
 * 
 * Returns recommendations for optimal interview rounds
 */
router.post('/optimize-rounds', protect, authorize(2), async (req, res) => {
    const { candidateId, jobId } = req.body;
    const userID = req.user.UserID;

    if (!candidateId || !jobId) {
        return res.status(400).json({ error: "Missing required fields: candidateId, jobId." });
    }

    try {
        // Verify recruiter
        const recruiterCheck = await query("SELECT RecruiterID FROM Recruiters WHERE UserID = ?", [userID]);
        if (recruiterCheck.length === 0) {
            return res.status(403).json({ error: "Unauthorized. Profile not registered as a valid Recruiter." });
        }

        // Verify candidate exists
        const candidateCheck = await query("SELECT CandidateID, FullName FROM Candidates WHERE CandidateID = ?", [candidateId]);
        if (candidateCheck.length === 0) {
            return res.status(404).json({ error: "Candidate not found." });
        }

        // Verify job exists
        const jobCheck = await query("SELECT JobID, JobTitle FROM JobPostings WHERE JobID = ?", [jobId]);
        if (jobCheck.length === 0) {
            return res.status(404).json({ error: "Job not found." });
        }

        // Call the stored procedure
        let result;
        try {
            result = await query("EXEC sp_OptimizeInterviewRounds ?, ?", [candidateId, jobId]);
        } catch (spError) {
            console.error("Stored Procedure Error:", spError.message);
            // Return fallback response if procedure fails
            result = [{
                RecommendedInterviewRounds: 2,
                AlreadyAssessedSkills: "None",
                SkillsToAssess: "Check job requirements",
                RedundantQuestionsDetected: 0,
                RedundancyAssessment: "Unable to analyze. No interview history found.",
                SuggestedStructure: "Round 1: Technical | Round 2: Behavioral & Culture",
                EstimatedMinutes: 120,
                TimeSavedMinutes: 0
            }];
        }

        if (result && result.length > 0) {
            res.json({
                success: true,
                candidate: {
                    candidateId: candidateId,
                    candidateName: candidateCheck[0].FullName
                },
                job: {
                    jobId: jobId,
                    jobTitle: jobCheck[0].JobTitle
                },
                optimization: result[0]
            });
        } else {
            res.status(404).json({ error: "Could not generate optimization recommendations." });
        }
    } catch (err) {
        console.error("Optimize Interview Rounds Error:", err.message);
        res.status(500).json({ error: "Failed to optimize interview rounds." });
    }
});

module.exports = router;
