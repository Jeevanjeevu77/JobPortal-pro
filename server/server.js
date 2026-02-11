const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import Models
const User = require('./models/User');
const Job = require('./models/Job');
const Application = require('./models/Application');

const app = express();
app.use(cors());
app.use(express.json());

// 1. CONNECT TO REAL DATABASE
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ DATABASE CONNECTED - Data is now Permanent"))
    .catch(err => console.log("❌ CONNECTION ERROR:", err.message));

// 2. AUTH ROUTES
app.post('/api/auth/register', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Signup Success!" });
    } catch (e) { res.status(400).json({ error: "Email already exists" }); }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) res.json({ user });
    else res.status(401).json({ error: "Invalid login" });
});

// 3. JOB ROUTES
app.post('/api/jobs', async (req, res) => {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json({ message: "Job Posted!" });
});

app.get('/api/jobs', async (req, res) => {
    const allJobs = await Job.find();
    res.json(allJobs);
});

// 4. APPLICATION ROUTES
app.post('/api/applications', async (req, res) => {
    const newApp = new Application({ ...req.body });
    await newApp.save();
    res.status(201).json({ message: "Applied!" });
});

app.get('/api/applications', async (req, res) => {
    const allApps = await Application.find();
    res.json(allApps);
});

app.put('/api/applications/:id', async (req, res) => {
    await Application.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.json({ message: "Status Updated" });
});

// --- FIX FOR STEP 1: DYNAMIC PORT ---
// This tells the server to use the Internet's port, or 5002 if on your laptop
const PORT = process.env.PORT || 5002;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SERVER IS LIVE ON PORT ${PORT}`);
});