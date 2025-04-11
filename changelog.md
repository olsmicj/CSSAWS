# Changelog

## Version 1.5.0 (April 11, 2025)
### Added
- Separate Knowledge Base database system for better data management
- Knowledge base articles now stored in a dedicated database
- Improved ticket to knowledge base article conversion process
- Knowledge base articles can now be exported and imported separately

### Fixed
- Fixed issue with "Convert to Article" button in resolved tickets
- Fixed knowledge base article creation from ticket data
- Improved error handling in knowledge base operations

### Changed
- Knowledge base module now uses a separate database from the main application
- Ticket conversion process now creates a copy of the ticket data without modifying the original ticket

## Version 1.4.2 (March 28, 2025)
### Fixed
- Fixed issue with ticket filtering when priority field is missing
- Added better error handling for ticket operations
- Fixed UI initialization issues with ticket details modal

### Changed
- Improved error logging for debugging purposes
- Updated dashboard to handle missing data fields gracefully

## Version 1.4.1 (March 15, 2025)
### Fixed
- Fixed issue with system status updates not reflecting in real-time
- Corrected date formatting in ticket history
- Resolved issue with archived tickets not displaying properly

### Changed
- Improved performance of ticket filtering operations
- Enhanced error messages for better troubleshooting

## Version 1.4.0 (March 1, 2025)
### Added
- Knowledge Base module for storing and retrieving solutions
- Ability to convert resolved tickets to knowledge base articles
- Knowledge base search and filtering capabilities
- Related article suggestions for similar tickets

### Changed
- Updated UI with improved styling for better readability
- Enhanced ticket details view with more information
- Improved dashboard charts with better visualization

### Fixed
- Fixed issue with ticket status changes not updating properly
- Resolved problem with archived tickets restoration
- Fixed data synchronization issues between tabs

## Version 1.3.0 (February 15, 2025)
### Added
- Ticket archiving functionality
- Auto-archive feature for old resolved tickets
- Ability to restore archived tickets
- Archive search and filtering

### Changed
- Improved ticket list performance with virtual scrolling
- Enhanced filter options for better ticket management
- Updated dashboard with new metrics and charts

### Fixed
- Fixed issue with ticket updates not saving properly
- Resolved problem with system status indicators
- Fixed data persistence issues with IndexedDB

## Version 1.2.0 (January 30, 2025)
### Added
- File System Access API support for direct file operations
- Import/export functionality for data backup
- Auto-save feature for preventing data loss
- Storage status indicator

### Changed
- Improved data management with IndexedDB fallback
- Enhanced file operations UI for better usability
- Updated error handling for file operations

### Fixed
- Fixed issue with data loading on startup
- Resolved problem with settings not saving properly
- Fixed UI inconsistencies in dark mode

## Version 1.1.0 (January 15, 2025)
### Added
- Dashboard with analytics and metrics
- Customizable dashboard views
- System health visualization
- Ticket trend analysis

### Changed
- Improved ticket management interface
- Enhanced system status display
- Updated UI with modern design elements

### Fixed
- Fixed issue with ticket creation
- Resolved problem with system status updates
- Fixed data persistence issues

## Version 1.0.0 (January 1, 2025)
### Initial Release
- Basic ticket management functionality
- System status monitoring
- User management and authentication
- Configuration options for systems and watchstations
