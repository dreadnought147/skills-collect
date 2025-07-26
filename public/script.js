// DOM elements
const signupForm = document.getElementById('signup-form');
const signupMessage = document.getElementById('signup-message');
const adminProvince = document.getElementById('admin-province');
const skillsList = document.getElementById('skills-list');
const entrepreneurshipStats = document.getElementById('entrepreneurship-stats');
        console.log("20");

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    setupFormHandler();
    loadProvinces();
    setupAdminControls();
});
        console.log("20");

function resetSubmitButton(submitButton, originalText) {
    submitButton.textContent = originalText; 
     submitButton.disabled = false;  
     return;
}
// Setup form submission handler with improved data processing
function setupFormHandler() {
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
                console.log("20");

        
        // Show loading state
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Registering...';
        submitButton.disabled = true;
        
        // Collect and validate form data
        const formData = new FormData(signupForm);
        console.log(formData);
        const userData = {
            fullName: formData.get('fullName')?.trim() || '',
            province: formData.get('province')?.trim() || '',
            qualifications: formData.get('qualifications')?.trim() || '',
            skills: formData.get('skills')?.trim() || '',
            entrepreneurship: formData.get('entrepreneurship') === 'on',
            workHistory: formData.get('workHistory')?.trim() || ''
        };
                console.log("22");


        // Client-side validation
        if (!userData.fullName) {
            showMessage('Please enter your full name', 'error');
            resetSubmitButton(submitButton, originalText);
            return;
        }
                console.log("23");

        
        if (!userData.province) {
            showMessage('Please select a province', 'error');
            resetSubmitButton(submitButton, originalText);
            return;
        }
                console.log("24");

        
        console.log('Submitting user data:', userData);
                console.log("25");

        
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const result =  response;
            console.log(result);
            
            if (response.ok) {
                showMessage(`Registration successful! Welcome, ${userData.fullName}!`, 'success');
                signupForm.reset();
                
                // Refresh provinces in admin dropdown and show success details
                await loadProvinces();
                console.log('User registered with ID:', result.userId);
                
                // Auto-select the province in admin view to show immediate impact
                setTimeout(() => {
                    adminProvince.value = userData.province;
                    adminProvince.dispatchEvent(new Event('change'));
                }, 1000);
                
            } else {
                showMessage(result.error || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            showMessage('Network error. Please check your connection and try again.', 'error');
        } finally {
            resetSubmitButton(submitButton, originalText);
        }
    });
}

// Load provinces for admin dropdown
async function loadProvinces() {
    try {
        const response = await fetch('/provinces');
        const provinces = await response.json();
        
        // Clear existing options (except the first one)
        adminProvince.innerHTML = '<option value="">Choose a province</option>';
        
        // Add provinces to dropdown
        provinces.forEach(province => {
            const option = document.createElement('option');
            option.value = province;
            option.textContent = province;
            adminProvince.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading provinces:', error);
    }
}

// Setup admin controls
function setupAdminControls() {
    adminProvince.addEventListener('change', function() {
        const selectedProvince = this.value;
        
        if (selectedProvince) {
            loadSkillsData(selectedProvince);
            loadEntrepreneurshipData(selectedProvince);
        } else {
            resetDataDisplay();
        }
    });
}

// Load skills data for selected province
async function loadSkillsData(province) {
    skillsList.innerHTML = '<p class="loading">Loading skills data...</p>';
    
    try {
        const response = await fetch(`/data/skills/${encodeURIComponent(province)}`);
        const skills = await response.json();
        
        if (skills.length === 0) {
            skillsList.innerHTML = '<p class="no-data">No skills data available for this province</p>';
            return;
        }
        
        // Create skills list HTML
     let html = '';
skills.forEach(skill => {
    const isNone = skill.skill.toLowerCase() === "none";
    html += `
        <div class="skills-item">
            <span class="skill-name" style="${isNone ? 'color: red;' : ''}">
                ${escapeHtml(skill.skill)}
            </span>
            <span class="skill-count">${skill.count}</span>
        </div>
    `;
});

skillsList.innerHTML = html;

    } catch (error) {
        console.error('Error loading skills data:', error);
        skillsList.innerHTML = '<p class="no-data">Error loading skills data</p>';
    }
}

// Load entrepreneurship data for selected province
async function loadEntrepreneurshipData(province) {
    entrepreneurshipStats.innerHTML = '<p class="loading">Loading entrepreneurship data...</p>';
    
    try {
        const response = await fetch(`/data/entrepreneurship/${encodeURIComponent(province)}`);
        const stats = await response.json();
        
        const percentage = stats.totalUsers > 0 ? 
            ((stats.interestedUsers / stats.totalUsers) * 100).toFixed(1) : 0;
        
        const html = `
            <div class="entrepreneurship-stat">
                <span class="stat-highlight">${stats.interestedUsers}</span> out of 
                <span class="stat-highlight">${stats.totalUsers}</span> users in 
                <span class="stat-highlight">${escapeHtml(province)}</span> are interested in entrepreneurship
            </div>
            <div class="entrepreneurship-stat">
                That's <span class="stat-highlight">${percentage}%</span> of registered users in this province
            </div>
        `;
        
        entrepreneurshipStats.innerHTML = html;
    } catch (error) {
        console.error('Error loading entrepreneurship data:', error);
        entrepreneurshipStats.innerHTML = '<p class="no-data">Error loading entrepreneurship data</p>';
    }
}

// Reset data display
function resetDataDisplay() {
    skillsList.innerHTML = '<p class="no-data">Select a province to view skill distribution</p>';
    entrepreneurshipStats.innerHTML = '<p class="no-data">Select a province to view entrepreneurship statistics</p>';
}

// Show message to user
function showMessage(message, type) {
    signupMessage.textContent = message;
    signupMessage.className = `message ${type}`;
    
    // Clear message after 5 seconds
    setTimeout(() => {
        signupMessage.textContent = '';
        signupMessage.className = 'message';
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}