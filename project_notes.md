# CSSAWS Project Structure Notes

This document provides an overview of the files and their purposes in the CSSAWS (Combat Systems Situational Awareness System) project.

## HTML Files

- **index.html**: Main application entry point and user interface. Contains the structure for the dashboard, ticket management, system status display, and all modal dialogs.
- **changes.html**: Displays the change log in a user-friendly format, documenting system updates and improvements.
- **test.html**: Likely a testing file for development purposes.

## CSS Files

- **css/styles.css**: Main stylesheet containing global styles, layout definitions, and component styling.
- **css/file-operations.css**: Styles specific to the file operations interface (import/export functionality).
- **css/knowledge-base.css**: Styles for the knowledge base component and article display.
- **css/svg-charts.css**: Styles for SVG-based charts and visualizations used in the dashboard.

## JavaScript Files

- **js/app.js**: Main application initialization and coordination between modules.
- **js/ui.js**: Core UI functionality, modal handling, and common UI utilities.
- **js/data.js**: Data management, CRUD operations for tickets and systems.
- **js/tickets.js**: Ticket-specific functionality including creation, updates, and display.
- **js/systems.js**: System management functionality for the stoplight chart.
- **js/dashboard.js**: Dashboard widgets and analytics visualizations.
- **js/knowledge.js**: Knowledge base article management and display.
- **js/knowledgeData.js**: Data operations specific to knowledge base articles.
- **js/reports.js**: Report generation and display functionality.
- **js/admin.js**: Administrative functions including user management.
- **js/fileManager.js**: Core file operations (read/write) functionality.
- **js/fileOperationsUI.js**: UI for file import/export operations.
- **js/FileSystemAccess.js**: Integration with the File System Access API.
- **js/storageStatusUI.js**: UI components for displaying storage status.
- **js/svgCharts.js**: SVG chart generation utilities.
- **js/reset.js**: Functionality to reset the application to default state.

## Server Files

- **server.js**: Simple Express.js server for serving the application files. Serves static files and routes all requests to index.html for SPA functionality.

## Configuration Files

- **package.json**: Node.js package configuration, defines dependencies (Express.js) and scripts.
- **requirements.txt**: Possibly lists Python dependencies if any backend components use Python.

## Data Files

- **data.json**: Main data store for the application, containing tickets, systems, and configuration.
- **data.json.default**: Default data used when resetting the application.
- **archived_tickets.json**: Storage for archived tickets that have been removed from the main view.
- **archived_tickets.json.default**: Default archived tickets data.

## Documentation Files

- **README.md**: Project documentation including features, installation instructions, and usage guidelines.
- **changelog.md**: Detailed log of changes made to the system, organized by feature area.

## Workspace Configuration

- **js/TroubleTicketSystem.code-workspace**: VS Code workspace configuration file.

## Key Features Implementation

### Ticket Management
- Implemented in **js/tickets.js** with UI elements in **index.html**
- Data operations in **js/data.js**
- Styling in **css/styles.css**

### System Status Monitoring
- Implemented in **js/systems.js** with UI elements in **index.html**
- Visualization using **js/svgCharts.js**
- Styling in **css/styles.css** and **css/svg-charts.css**

### Dashboard
- Implemented in **js/dashboard.js** with UI elements in **index.html**
- Chart generation in **js/svgCharts.js**
- Styling in **css/styles.css** and **css/svg-charts.css**

### Knowledge Base
- Implemented in **js/knowledge.js** and **js/knowledgeData.js**
- UI elements in **index.html**
- Styling in **css/knowledge-base.css**

### File Operations
- Core functionality in **js/fileManager.js** and **js/FileSystemAccess.js**
- UI in **js/fileOperationsUI.js**
- Styling in **css/file-operations.css**

### User Management
- Implemented in **js/admin.js** with UI elements in **index.html**

## Application Architecture

The application follows a modular architecture with separation of concerns:
- UI components and rendering logic
- Data management and storage
- Business logic for tickets, systems, and knowledge base
- Visualization and reporting
- File operations and persistence

The application is primarily client-side with a minimal server component for serving the static files. Data persistence is achieved through browser storage (IndexedDB) and file exports.
