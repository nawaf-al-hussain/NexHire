const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { protect, authorize } = require('../middleware/rbac');

/**
 * @route   GET /api/users
 * @desc    Get all users for Admin management
 * @access  Private (Admin)
 */
router.get('/', protect, authorize(1), async (req, res) => {
    try {
        const users = await query(`
            SELECT u.UserID, u.Username, u.Email, u.RoleID, u.IsActive, u.CreatedAt, r.RoleName
            FROM Users u
            LEFT JOIN Roles r ON u.RoleID = r.RoleID
            ORDER BY u.CreatedAt DESC
        `);
        res.json(users);
    } catch (err) {
        console.error("Fetch Users Error:", err.message);
        res.status(500).json({ error: "Failed to fetch users." });
    }
});

/**
 * @route   PUT /api/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put('/:id/role', protect, authorize(1), async (req, res) => {
    const { id } = req.params;
    const { roleID } = req.body;

    if (!roleID) return res.status(400).json({ error: "Role ID is required." });

    try {
        await query("UPDATE Users SET RoleID = ? WHERE UserID = ?", [roleID, id]);
        res.json({ message: "User role updated successfully." });
    } catch (err) {
        console.error("Update Role Error:", err.message);
        res.status(500).json({ error: "Failed to update user role." });
    }
});

/**
 * @route   PUT /api/users/:id/status
 * @desc    Toggle user active status
 * @access  Private (Admin)
 */
router.put('/:id/status', protect, authorize(1), async (req, res) => {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) return res.status(400).json({ error: "IsActive status is required." });

    try {
        await query("UPDATE Users SET IsActive = ? WHERE UserID = ?", [isActive ? 1 : 0, id]);
        res.json({ message: "User status updated successfully." });
    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).json({ error: "Failed to update user status." });
    }
});

/**
 * @route   POST /api/users/candidate
 * @desc    Create a new candidate user and profile
 * @access  Admin/Public (Modified for Phase 1 registration)
 */
router.post('/candidate', async (req, res) => {
    const { username, email, password, fullName, location, yearsOfExperience } = req.body;

    if (!username || !email || !password || !fullName) {
        return res.status(400).json({ error: "Required fields: username, email, password, fullName" });
    }

    try {
        // 1. Hash the password using the C# CLR function
        const hashResult = await query("SELECT dbo.HashPassword(?) AS Hash", [password]);
        const passwordHash = hashResult[0].Hash;

        // 2. Insert into Users table (RoleID 3 = Candidate)
        // Using OUTPUT inserted.UserID for transactional integrity
        const userResult = await query(`
            INSERT INTO Users (Username, Email, PasswordHash, RoleID, IsActive)
            OUTPUT inserted.UserID
            VALUES (?, ?, ?, 3, 1)`,
            [username, email, passwordHash]
        );

        const newUserId = userResult[0].UserID;

        // 3. Create the Candidate Profile linking to the new UserID
        await query(`
            INSERT INTO Candidates (UserID, FullName, Location, YearsOfExperience)
            VALUES (?, ?, ?, ?)`,
            [newUserId, fullName, location || 'N/A', yearsOfExperience || 0]
        );

        res.status(201).json({
            success: true,
            message: "Candidate profile created successfully.",
            userId: newUserId
        });
    } catch (err) {
        console.error("User Creation Error:", err.message);
        // Handle unique constraint violations (username/email)
        if (err.message.includes('unique') || err.message.includes('duplicate')) {
            return res.status(400).json({ error: "Username or email already exists." });
        }
        res.status(500).json({ error: "Failed to create candidate profile." });
    }
});

/**
 * @route   GET /api/users/profile/:userId
 * @desc    Get user profile (multi-role)
 * @access  Private
 */
router.get('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const users = await query(
            "SELECT UserID, Username, Email, RoleID FROM Users WHERE UserID = ?",
            [userId]
        );

        if (users.length === 0) return res.status(404).json({ error: "User not found." });

        const user = users[0];
        let profile = {};

        // Fetch role-specific profile data
        if (user.RoleID === 3) { // Candidate
            const cand = await query("SELECT * FROM Candidates WHERE UserID = ?", [userId]);
            profile = cand[0] || {};
        } else if (user.RoleID === 2) { // Recruiter
            const rec = await query("SELECT * FROM Recruiters WHERE UserID = ?", [userId]);
            profile = rec[0] || {};
        }

        res.json({ ...user, profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
