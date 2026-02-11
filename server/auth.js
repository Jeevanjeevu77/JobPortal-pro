const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// This is our "Temporary Database" in memory
let users = []; 

// REGISTER
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists in our list
        const exists = users.find(u => u.email === email);
        if (exists) return res.status(400).json({ msg: "User already exists" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save to our list
        const newUser = { id: users.length + 1, name, email, password: hashedPassword, role };
        users.push(newUser);

        console.log("New User Registered:", newUser.name);
        res.status(201).json({ msg: "User registered successfully (Local Memory)!" });
    } catch (err) {
        res.status(500).send("Server Error");
    }
});

// LOGIN
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, "secret", { expiresIn: '1h' });
    res.json({ token, role: user.role, name: user.name });
});

module.exports = router;