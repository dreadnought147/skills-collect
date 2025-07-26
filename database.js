const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'empowerment.db');

// Initialize database and create tables
function initializeDatabase() {
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('Error opening database:', err.message);
            return;
        }
        console.log('Connected to SQLite database.');
    });

    // Create users table if it doesn't exist
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            province TEXT NOT NULL,
            qualifications TEXT,
            skills TEXT,
            entrepreneurship INTEGER DEFAULT 0,
            work_history TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready.');
        }
    });

    db.close();
}

// Insert a new user with improved error handling and data validation
function insertUser(userData) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        
        const query = `
            INSERT INTO users (full_name, province, qualifications, skills, entrepreneurship, work_history)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        // Prepare and validate data before insertion
        const values = [
            userData.fullName,
            userData.province,
            userData.qualifications,
            userData.skills,
            userData.entrepreneurship,
            userData.workHistory
        ];
        
        console.log('Inserting user with values:', values);
        
        db.run(query, values, function(err) {
            if (err) {
                console.error('Database insertion error:', err);
                reject(new Error('Failed to save user data'));
            } else {
                console.log('User inserted successfully with ID:', this.lastID);
                resolve(this.lastID);
            }
        });
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
        });
    });
}

// Get all unique provinces
function getProvinces() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        
        db.all('SELECT DISTINCT province FROM users ORDER BY province', [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const provinces = rows.map(row => row.province);
                resolve(provinces);
            }
        });
        
        db.close();
    });
}

// Get skill distribution for a specific province with improved processing
function getSkillsByProvince(province) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        
        console.log('Fetching skills for province:', province);
        
        db.all('SELECT skills FROM users WHERE province = ? AND skills IS NOT NULL AND skills != ""', [province], (err, rows) => {
            if (err) {
                console.error('Error fetching skills:', err);
                reject(err);
            } else {
                console.log('Raw skills data:', rows);
                const skillCounts = {};
                
                rows.forEach(row => {
                    if (row.skills && row.skills.trim()) {
                        // Split by comma, semicolon, or line breaks for flexibility
                        const skills = row.skills.split(/[,;\n]+/)
                            .map(skill => skill.trim())
                            .filter(skill => skill.length > 0);
                        
                        skills.forEach(skill => {
                            // Normalize skill name - capitalize first letter of each word
                            const normalizedSkill = skill.toLowerCase()
                                .split(' ')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ');
                            
                            skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
                        });
                    }
                });
                
                // Convert to array and sort by count (descending)
                const skillsArray = Object.entries(skillCounts)
                    .map(([skill, count]) => ({ skill, count }))
                    .sort((a, b) => b.count - a.count);
                
                console.log('Processed skills:', skillsArray);
                resolve(skillsArray);
            }
        });
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
        });
    });
}

// Get entrepreneurship statistics for a specific province with detailed logging
function getEntrepreneurshipStatsByProvince(province) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath);
        
        console.log('Fetching entrepreneurship stats for province:', province);
        
        // Get total users and entrepreneurship interested users for the province
        db.get(`
            SELECT 
                COUNT(*) as total_users,
                SUM(entrepreneurship) as interested_users
            FROM users 
            WHERE province = ?
        `, [province], (err, row) => {
            if (err) {
                console.error('Error fetching entrepreneurship stats:', err);
                reject(err);
            } else {
                const stats = {
                    totalUsers: row.total_users || 0,
                    interestedUsers: row.interested_users || 0,
                    province: province
                };
                
                console.log('Entrepreneurship stats:', stats);
                resolve(stats);
            }
        });
        
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err);
            }
        });
    });
}

module.exports = {
    initializeDatabase,
    insertUser,
    getProvinces,
    getSkillsByProvince,
    getEntrepreneurshipStatsByProvince
};