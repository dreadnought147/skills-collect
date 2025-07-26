const express = require('express');
const path = require('path');
const db = require('./database.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize database on startup
db.initializeDatabase();

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// POST /signup - Handle user registration
app.post('/signup', async (req, res) => {
    try {
        const { fullName, province, qualifications, skills, entrepreneurship, workHistory } = req.body;
        console.log(req.body);
        
        // Comprehensive validation
        if (!fullName || !fullName.trim()) {
            return res.status(400).json({ error: 'Full name is required' });
        }
        
        if (!province || !province.trim()) {
            return res.status(400).json({ error: 'Province is required' });
        }

        // Clean and prepare data
        const userData = {
            fullName: fullName.trim(),
            province: province.trim(),
            qualifications: qualifications ? qualifications.trim() : '',
            skills: skills ? skills.trim() : '',
            entrepreneurship: entrepreneurship === true || entrepreneurship === 'on' || entrepreneurship === '1' ? 1 : 0,
            workHistory: workHistory ? workHistory.trim() : ''
        };
        console.log(userData, "25");

        // Log the data being stored for debugging
        console.log('Storing user data:', userData);

        const userId = await db.insertUser(userData);
        
        // Return success with user ID
        res.json({ 
            message: 'User registered successfully!', 
            userId: userId,
            userData: userData 
        });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'Failed to register user. Please try again.' });
    }
});

// GET /provinces - Get all unique provinces
app.get('/provinces', async (req, res) => {
    try {
        const provinces = await db.getProvinces();
        res.json(provinces);
    } catch (error) {
        console.error('Error fetching provinces:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /data/skills/:province - Get skill distribution for a province
app.get('/data/skills/:province', async (req, res) => {
    try {
        const { province } = req.params;
        if (province==='all')
{
    const province='*'
}        
    const skills = await db.getSkillsByProvince(province);
        res.json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /data/entrepreneurship/:province - Get entrepreneurship stats for a province
app.get('/data/entrepreneurship/:province', async (req, res) => {
    try {
        const { province } = req.params;
        const stats = await db.getEntrepreneurshipStatsByProvince(province);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching entrepreneurship stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});