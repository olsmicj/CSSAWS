# Trouble Ticket System

A comprehensive HTML-based trouble ticket system for streamlining issue tracking and resolution processes. The system features a user-friendly interface with a left-hand pane displaying trouble tickets and a right-hand side customizable stoplight chart indicating the status of up to 100 different systems.

## Features

### Ticket Management
- **Creation and Updates**: Create new tickets and update existing ones with relevant information
- **History Tracking**: Comprehensive log of all actions and changes associated with each ticket
- **Auto-Assigned Numbers**: Automatic assignment of unique identification numbers to new tickets
- **Timestamps**: Date and time stamps for ticket creation, updates, and resolutions
- **Impact Assessment**: Fields to assess and document the impact of each issue
- **Resolution Tracking**: Capture of the date and time when issues are resolved
- **Archiving**: Automatic archiving of resolved tickets after a configurable time period

### System Monitoring
- **Stoplight Chart**: Visual display of the status of up to 100 different systems
- **Status Indicators**: Color-coded indicators for operational, degraded, and down states
- **Customizable Systems**: Add, edit, and remove systems as needed

### Customization Modules
- **Watchstations**: Customize and monitor various watchstations
- **Systems**: Track and manage different systems within the organization
- **Circuits and Designations**: Track circuits and their specific designations, including status monitoring

### Reporting
- **Historical Data Reports**: Generate customizable reports based on historical ticket data
- **System Status History**: Track changes in system status over time
- **Resolution Time Analysis**: Analyze the time taken to resolve tickets by priority or system

### Dashboard
- **Analytics Overview**: Visual representation of ticket metrics and system health
- **Key Metrics**: Real-time display of open tickets, critical issues, average resolution time, etc.
- **Customizable Widgets**: Configure dashboard to display the most relevant information

### Knowledge Base
- **Solution Documentation**: Store and retrieve solutions to common problems
- **Searchable Articles**: Search for articles by keywords, tags, or related systems
- **Knowledge Sharing**: Capture and share technical knowledge across the organization

### User Management
- **Role-Based Access**: Admin, technician, and viewer roles with appropriate permissions
- **User Authentication**: Secure login for all users
- **Activity Tracking**: Track user actions and changes

### Data Management
- **Browser Storage**: Data persistence using IndexedDB
- **File System Access**: Optional integration with the File System Access API for direct file operations
- **Import/Export**: Import and export data to JSON files for backup or sharing
- **Auto-Save**: Automatic saving of changes to prevent data loss

## Technical Implementation

### Frontend
- HTML5, CSS3, and vanilla JavaScript
- Responsive design for compatibility across various devices and browsers
- Dynamic SVG charts for data visualization
- No external dependencies except for Dexie.js for IndexedDB management

### Data Storage
- Primary storage in browser's IndexedDB
- Optional File System Access API integration for direct file operations
- JSON file import/export for data portability
- Auto-save and backup mechanisms

### Server
- Simple Express.js server for development and production
- Static file serving
- Single-page application (SPA) routing

## Getting Started

### Prerequisites
- Node.js (v12.0.0 or higher)
- Modern web browser with IndexedDB support (Chrome, Firefox, Edge, Safari)

### Installation

1. Clone the repository or download the source code
2. Install dependencies:
   ```
   npm install
   ```
3. Start the server:
   ```
   node server.js
   ```
4. Open your browser and navigate to http://localhost:3000

### Usage

#### Creating a New Ticket
1. Click the "Create New Ticket" button in the Tickets pane
2. Fill in the required information:
   - Title
   - Description
   - Priority
   - Affected System
   - Impact Assessment
3. Click "Submit" to create the ticket

#### Updating a Ticket
1. Click on a ticket in the ticket list to view its details
2. Use the status dropdown to change the ticket status
3. Add updates in the "Add Update" section
4. Click "Save Changes" to save your changes

#### Configuring Systems
1. Click the cog icon in the floating action menu
2. In the System Configuration modal, navigate to the Systems tab
3. Click "Add System" to add a new system
4. Fill in the system details and click "Save System"

#### Generating Reports
1. Click the chart icon in the floating action menu
2. Select the report type, date range, and any additional filters
3. Click "Generate Report" to view the report
4. Use the "Export" button to save the report as a file

#### Managing Users
1. Click the user shield icon in the floating action menu
2. In the Admin Settings modal, navigate to the User Management tab
3. Click "Add User" to create a new user account
4. Fill in the user details, select their role, and click "Save User"

#### Using the Knowledge Base
1. Click the "Knowledge Base" button in the header
2. Browse the list of articles or use the search function
3. Click on an article to view its content
4. Click "Create Article" to add a new knowledge base article

## Data Management

### Importing and Exporting Data
1. Click the file icon in the floating action menu
2. Use the Import/Export options to manage your data files
3. The application supports:
   - Importing data from JSON files
   - Exporting data to JSON files
   - Resetting to default data

### Auto-Save
- Changes are automatically saved to the browser's IndexedDB
- If using the File System Access API, changes can be auto-saved to a selected file
- Auto-save interval is configurable in the settings

## Security Considerations

- User authentication is simulated for demonstration purposes
- In a production environment, implement proper authentication and authorization
- Sensitive data should be encrypted before storage
- Consider implementing HTTPS for secure communication

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Dexie.js for IndexedDB wrapper
- Express.js for the development server
- Font Awesome for icons
