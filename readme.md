# Empowerment Initiative MVP

##TO-IMPLEMENT: FIND A WAY TO EXPORT DB INFO AS A CSV COMPATIBILY WITH THE DASHBOARD (07/26)

A minimally viable product (MVP) for collecting data from unemployed individuals and providing basic administrative insights.

## Features

### User Registration
- Simple web form for unemployed individuals to register
- No authentication required
- Collects: Full Name, Province, Qualifications, Skills, Entrepreneurship Interest, Work History
- Data stored in SQLite database

### Admin Data View
- Province-based data filtering
- Skill distribution analysis (shows unique skills and their frequency)
- Entrepreneurship interest statistics
- Real-time data visualization

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Database**: SQLite3

## Project Structure

```
empowerment-initiative/
├── server.js              # Main Express server
├── database.js            # Database operations
├── package.json           # Dependencies
├── public/
│   ├── index.html         # Frontend HTML
│   ├── style.css          # Styling
│   └── script.js          # Frontend JavaScript
└── empowerment.db         # SQLite database (created automatically)
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

For development with auto-restart:
```bash
npm run dev
```

### 3. Access the Application
Open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### User Registration
- **POST /signup**: Register a new user
- **Body**: JSON with user data

### Admin Data
- **GET /provinces**: Get list of all provinces with registered users
- **GET /data/skills/:province**: Get skill distribution for a specific province
- **GET /data/entrepreneurship/:province**: Get entrepreneurship statistics for a province

## Database Schema

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| full_name | TEXT | User's full name |
| province | TEXT | User's province |
| qualifications | TEXT | User's qualifications (comma-separated) |
| skills | TEXT | User's skills (comma-separated) |
| entrepreneurship | INTEGER | 1 if interested in entrepreneurship, 0 otherwise |
| work_history | TEXT | User's work history |
| created_at | DATETIME | Registration timestamp |

## Usage

### For Users (Job Seekers)
1. Fill out the registration form with your details
2. Submit to create your profile in the system
3. No login required - one-time registration

### For Administrators
1. Navigate to the "Data Insights" section
2. Select a province from the dropdown
3. View:
   - **Skill Distribution**: Most common skills in that province
   - **Entrepreneurship Interest**: Number and percentage of users interested in entrepreneurship

## Data Processing

- **Skills**: Comma-separated values are processed individually and counted
- **Provinces**: Dropdown shows only provinces with registered users
- **Real-time Updates**: Admin view updates immediately when new users register

## Security Considerations

- Input validation on both frontend and backend
- HTML escaping to prevent XSS attacks
- SQL injection prevention through parameterized queries
- Error handling for all API endpoints

## Future Enhancements

- User authentication system
- Advanced analytics and reporting
- Export functionality for admin data
- Email notifications
- Mobile app support
- Integration with job boards

## Development

### Adding New Provinces
Update the provinces in `public/index.html` in the select dropdown.

### Database Management
The database is automatically created on first run. To reset:
1. Stop the server
2. Delete `empowerment.db` file
3. Restart the server

### Styling Customization
Modify `public/style.css` to change the appearance. The design is responsive and mobile-friendly.
