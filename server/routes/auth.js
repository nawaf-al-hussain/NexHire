const express = require('express');
const router = express.Router();
const { query } = require('../db');

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return role/ID
 * @access  Public
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required." });
    }

    try {
        // 1. Fetch the user's stored hash and ID
        const users = await query(
            "SELECT UserID, Username, RoleID, PasswordHash FROM Users WHERE Username = ? AND IsActive = 1",
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        const user = users[0];

        // 2. Dev Bypass: If password is empty, let them in (Development Only)
        if (!password || password.trim() === '') {
            const { PasswordHash, ...userSession } = user;
            return res.json(userSession);
        }

        // 3. Verify password using the C# CLR function if password is provided
        const verificationResult = await query(
            "SELECT dbo.VerifyPassword(?, ?) AS IsValid",
            [password, user.PasswordHash]
        );

        if (verificationResult[0].IsValid === 1) {
            const { PasswordHash, ...userSession } = user;
            res.json(userSession);
        } else {
            res.status(401).json({ error: "Invalid credentials." });
        }
    } catch (err) {
        console.error("Auth Error:", err.message);
        res.status(500).json({ error: "Server authentication error." });
    }
});

module.exports = router;
