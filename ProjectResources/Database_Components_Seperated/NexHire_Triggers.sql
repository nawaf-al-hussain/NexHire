-- RECRUITMENT DATABASE - COMPLETE TRIGGERS CREATION SCRIPT
-- ============================================================

-- 1. trg_Audit_ApplicationStatusChange - Audit Application Status Changes
CREATE TRIGGER trg_Audit_ApplicationStatusChange
ON Applications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
    SELECT
        'Applications',
        i.ApplicationID,
        'UPDATE',
        CONCAT('StatusID: ', d.StatusID),
        CONCAT('StatusID: ', i.StatusID),
        CAST(SESSION_CONTEXT(N'UserID') AS INT),
        GETDATE()
    FROM inserted i
    JOIN deleted d ON i.ApplicationID = d.ApplicationID
    WHERE i.StatusID <> d.StatusID;
END;
GO

-- 2. trg_PreventDoubleBooking - Prevent Interviewer Double-Booking
CREATE TRIGGER trg_PreventDoubleBooking
ON InterviewSchedules
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Check for overlapping schedules
    IF EXISTS (
        SELECT 1
        FROM inserted i
        JOIN InterviewSchedules s
          ON i.RecruiterID = s.RecruiterID
         AND i.InterviewStart < s.InterviewEnd
         AND i.InterviewEnd > s.InterviewStart
    )
    BEGIN
        RAISERROR ('Scheduling conflict: Recruiter is already booked during this time.', 16, 1);
        RETURN;
    END

    -- No conflicts, perform insert
    INSERT INTO InterviewSchedules (ApplicationID, RecruiterID, InterviewStart, InterviewEnd, CandidateConfirmed, CreatedAt)
    SELECT ApplicationID, RecruiterID, InterviewStart, InterviewEnd, CandidateConfirmed, GETDATE()
    FROM inserted;
END;
GO

-- 3. trg_SendInterviewEmail - Send Interview Email Notification
CREATE TRIGGER trg_SendInterviewEmail
ON InterviewSchedules
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO EmailQueue (CandidateID, EmailType, Subject, Body)
    SELECT
        c.CandidateID,
        'InterviewInvite',
        'Interview Scheduled',
        'Dear ' + c.FullName +
        ', your interview is scheduled from ' +
        CONVERT(VARCHAR, i.InterviewStart, 100) +
        ' to ' + CONVERT(VARCHAR, i.InterviewEnd, 100) + '.'
    FROM inserted i
    JOIN Applications a ON i.ApplicationID = a.ApplicationID
    JOIN Candidates c ON a.CandidateID = c.CandidateID;
END;
GO

-- 4. trg_InstantAutoReject - Instant Auto-Reject
CREATE TRIGGER trg_InstantAutoReject
ON Applications
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE a
    SET a.StatusID = 5,
        a.RejectionReason = 'Auto-Rejected: Does not meet minimum experience requirement.'
    FROM Applications a
    JOIN inserted i ON a.ApplicationID = i.ApplicationID
    JOIN Candidates c ON a.CandidateID = c.CandidateID
    JOIN JobPostings j ON a.JobID = j.JobID
    WHERE c.YearsOfExperience < j.MinExperience
    AND a.StatusID = 1;
END;
GO

-- 5. trg_ValidateEmail_OnInsert (CLR Integration - Commented out in original)
-- Note: This trigger is commented out in the original script, but included here for completeness
/*
CREATE TRIGGER trg_ValidateEmail_OnInsert
ON Users
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1 FROM inserted
        WHERE dbo.ValidateEmail(Email) = 0 OR dbo.IsDisposableEmail(Email) = 1
    )
    BEGIN
        RAISERROR('Invalid or disposable email address detected.', 16, 1);
        RETURN;
    END
    
    INSERT INTO Users (Username, Email, PasswordHash, SessionToken, LastLogin, RoleID, CreatedAt, IsActive)
    SELECT Username, Email, PasswordHash, SessionToken, LastLogin, RoleID, CreatedAt, IsActive
    FROM inserted;
END;
GO
*/

-- 6. trg_ScoreSentiment_OnFeedbackInsert (CLR Integration - Commented out in original)
-- Note: This trigger is commented out in the original script, but included here for completeness
/*
CREATE TRIGGER trg_ScoreSentiment_OnFeedbackInsert
ON InterviewFeedback
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE f
    SET f.SentimentScore = dbo.CalculateSentiment(i.Comments)
    FROM InterviewFeedback f
    JOIN inserted i ON f.FeedbackID = i.FeedbackID
    WHERE i.Comments IS NOT NULL AND LEN(i.Comments) > 10;
END;
GO
*/

-- 7. trg_UpdateCandidateRanking - Update Candidate Ranking on Skill Change
-- Note: This trigger appears to be referenced but not explicitly defined in the script
-- Adding it based on common functionality
CREATE TRIGGER trg_UpdateCandidateRanking
ON CandidateSkills
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Update rankings for affected candidates
    UPDATE cr
    SET cr.MatchScore = (
        SELECT SUM(cs.ProficiencyLevel) * 10
        FROM CandidateSkills cs
        WHERE cs.CandidateID = cr.CandidateID
    )
    FROM CandidateRankingHistory cr
    WHERE cr.CandidateID IN (
        SELECT CandidateID FROM inserted
        UNION
        SELECT CandidateID FROM deleted
    );
END;
GO

-- 8. trg_PreventDuplicateApplications - Prevent duplicate applications
CREATE TRIGGER trg_PreventDuplicateApplications
ON Applications
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE EXISTS (
            SELECT 1
            FROM Applications a
            WHERE a.CandidateID = i.CandidateID
              AND a.JobID = i.JobID
              AND a.IsDeleted = 0
        )
    )
    BEGIN
        RAISERROR('Candidate has already applied for this job.', 16, 1);
        RETURN;
    END
    
    INSERT INTO Applications (CandidateID, JobID, StatusID, AppliedDate, StatusChangedAt, WithdrawnAt, WithdrawalReason, RejectionReason, IsDeleted)
    SELECT CandidateID, JobID, StatusID, AppliedDate, StatusChangedAt, WithdrawnAt, WithdrawalReason, RejectionReason, IsDeleted
    FROM inserted;
END;
GO

-- 9. trg_UpdateJobVacancies - Update job vacancies when candidate hired
CREATE TRIGGER trg_UpdateJobVacancies
ON Applications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(StatusID)
    BEGIN
        UPDATE j
        SET j.Vacancies = j.Vacancies - 1
        FROM JobPostings j
        INNER JOIN inserted i ON j.JobID = i.JobID
        INNER JOIN deleted d ON i.ApplicationID = d.ApplicationID
        WHERE i.StatusID = (SELECT StatusID FROM ApplicationStatus WHERE StatusName = 'Hired')
          AND d.StatusID <> i.StatusID
          AND j.Vacancies > 0;
    END
END;
GO

-- 10. trg_Audit_UserChanges - Audit user changes
CREATE TRIGGER trg_Audit_UserChanges
ON Users
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Handle INSERT operations
    INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
    SELECT
        'Users',
        i.UserID,
        'INSERT',
        NULL,
        CONCAT('Username: ', i.Username, ', Email: ', i.Email, ', RoleID: ', i.RoleID),
        CAST(SESSION_CONTEXT(N'UserID') AS INT),
        GETDATE()
    FROM inserted i
    WHERE NOT EXISTS (SELECT 1 FROM deleted);
    
    -- Handle UPDATE operations
    INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
    SELECT
        'Users',
        i.UserID,
        'UPDATE',
        CONCAT('Username: ', d.Username, ', Email: ', d.Email, ', RoleID: ', d.RoleID, ', IsActive: ', d.IsActive),
        CONCAT('Username: ', i.Username, ', Email: ', i.Email, ', RoleID: ', i.RoleID, ', IsActive: ', i.IsActive),
        CAST(SESSION_CONTEXT(N'UserID') AS INT),
        GETDATE()
    FROM inserted i
    JOIN deleted d ON i.UserID = d.UserID;
    
    -- Handle DELETE operations
    INSERT INTO AuditLog (TableName, RecordID, Operation, OldValue, NewValue, ChangedBy, ChangedAt)
    SELECT
        'Users',
        d.UserID,
        'DELETE',
        CONCAT('Username: ', d.Username, ', Email: ', d.Email, ', RoleID: ', d.RoleID, ', IsActive: ', d.IsActive),
        NULL,
        CAST(SESSION_CONTEXT(N'UserID') AS INT),
        GETDATE()
    FROM deleted d
    WHERE NOT EXISTS (SELECT 1 FROM inserted);
END;
GO

-- 11. trg_UpdateApplicationHistory - Automatically record status changes in history
CREATE TRIGGER trg_UpdateApplicationHistory
ON Applications
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(StatusID)
    BEGIN
        INSERT INTO ApplicationStatusHistory (ApplicationID, FromStatusID, ToStatusID, ChangedBy, ChangedAt, Notes)
        SELECT
            i.ApplicationID,
            d.StatusID,
            i.StatusID,
            CAST(SESSION_CONTEXT(N'UserID') AS INT),
            GETDATE(),
            'Status changed via application update'
        FROM inserted i
        JOIN deleted d ON i.ApplicationID = d.ApplicationID
        WHERE i.StatusID <> d.StatusID;
    END
END;
GO

-- 12. trg_UpdateCandidateExperience - Extract and update experience from resume
CREATE TRIGGER trg_UpdateCandidateExperience
ON Candidates
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    IF UPDATE(ResumeText)
    BEGIN
        UPDATE c
        SET c.YearsOfExperience = 
            CASE 
                WHEN dbo.ExtractYearsOfExperience(i.ResumeText) > 0 
                THEN dbo.ExtractYearsOfExperience(i.ResumeText)
                ELSE c.YearsOfExperience
            END,
            c.ExtractedSkills = 
            CASE 
                WHEN i.ResumeText IS NOT NULL 
                THEN dbo.ExtractSkills(i.ResumeText)
                ELSE c.ExtractedSkills
            END
        FROM Candidates c
        JOIN inserted i ON c.CandidateID = i.CandidateID
        WHERE i.ResumeText IS NOT NULL;
    END
END;
GO

-- 13. trg_PreventRehiring - Prevent rehiring same candidate for same job
CREATE TRIGGER trg_PreventRehiring
ON Applications
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF EXISTS (
        SELECT 1
        FROM inserted i
        WHERE EXISTS (
            SELECT 1
            FROM Applications a
            JOIN ApplicationStatus s ON a.StatusID = s.StatusID
            WHERE a.CandidateID = i.CandidateID
              AND a.JobID = i.JobID
              AND s.StatusName = 'Hired'
        )
    )
    BEGIN
        RAISERROR('Candidate has already been hired for this job.', 16, 1);
        RETURN;
    END
    
    INSERT INTO Applications (CandidateID, JobID, StatusID, AppliedDate, StatusChangedAt, WithdrawnAt, WithdrawalReason, RejectionReason, IsDeleted)
    SELECT CandidateID, JobID, StatusID, AppliedDate, StatusChangedAt, WithdrawnAt, WithdrawalReason, RejectionReason, IsDeleted
    FROM inserted;
END;
GO

-- 14. trg_MaintainCandidateGamification - Maintain gamification points
CREATE TRIGGER trg_MaintainCandidateGamification
ON Candidates
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO CandidateGamification (CandidateID, Points, Level, Badges, StreakDays, LastActivityDate, EngagementScore, CreatedAt, UpdatedAt)
    SELECT 
        i.CandidateID,
        50, -- Starting points
        1,  -- Starting level
        '[]',
        0,
        GETDATE(),
        50, -- Default engagement score
        GETDATE(),
        GETDATE()
    FROM inserted i
    WHERE NOT EXISTS (
        SELECT 1 FROM CandidateGamification WHERE CandidateID = i.CandidateID
    );
END;
GO