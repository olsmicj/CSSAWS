/**
 * File Manager Module
 * Handles data storage and retrieval using File System Access API with IndexedDB fallback
 */

const FileManager = (() => {
    // Current storage strategy
    let storageStrategy = 'indexedDB'; // Default to IndexedDB
    
    // Current file handle when using File System Access API
    let currentFileHandle = null;
    
    // Track auto-save timer
    let autoSaveTimer = null;
    
    // Auto-save interval in milliseconds (default: 30 seconds)
    const AUTO_SAVE_INTERVAL = 30000;
    
    // Create and configure the Dexie database
    const db = new Dexie('TroubleTicketSystem');
    
    // Define the database schema with all the tables
    db.version(1).stores({
        tickets: 'id, status, priority, system, createdAt, updatedAt, resolvedAt',
        archivedTickets: 'id, status, priority, system, createdAt, updatedAt, resolvedAt',
        systems: 'id, name, status, category',
        watchstations: 'id, name, location',
        circuits: 'id, designation, status, system',
        users: 'id, username, email, role',
        settings: 'id'
    });

    // Default data structure
    const DEFAULT_DATA = {
        tickets: [],
        systems: [],
        watchstations: [],
        circuits: [],
        users: [
            {
                id: "user1",
                username: "admin",
                email: "admin@example.com",
                password: "admin123",
                role: "admin"
            }
        ],
        settings: {
            id: "app-settings",
            companyName: "Tech Support",
            ticketPrefix: "TKT",
            autoRefresh: 60,
            maxSystems: 100,
            archiveOld: true,
            archiveDays: 30,
            nextTicketNumber: 1001,
            lastModified: new Date().toISOString(),
            lastModifiedBy: "System"
        }
    };

    // Cache for active data to improve performance
    let activeDataCache = null;
    let archivedTicketsCache = null;
    let currentUser = "Anonymous";

    // DOM elements for file operations
    let fileInput, exportLink;

    // Sample ticket data to use for initialization
    const SAMPLE_DATA = {
        tickets: [
            {
                id: "TKT-1001",
                title: "Network connectivity issue in Building B",
                description: "Users in Building B are experiencing intermittent network connectivity issues. Multiple workstations affected.",
                priority: "high",
                system: "sys1616161671",
                impact: "Affects 15 users in the marketing department. Reduces productivity by approximately 30%.",
                status: "in-progress",
                createdAt: "2025-03-15T13:45:22.000Z",
                updatedAt: "2025-03-15T14:30:10.000Z",
                resolvedAt: null,
                history: [
                    {
                        action: "Status Changed",
                        timestamp: "2025-03-15T14:30:10.000Z",
                        details: "Status changed from 'open' to 'in-progress'"
                    },
                    {
                        action: "Ticket Created",
                        timestamp: "2025-03-15T13:45:22.000Z",
                        details: "Ticket was created"
                    }
                ]
            },
            {
                id: "TKT-1002",
                title: "Email server not sending external emails",
                description: "Users are unable to send emails to external domains. Internal email delivery is working normally.",
                priority: "critical",
                system: "sys1616161672",
                impact: "Affects all staff (approximately 120 users). Preventing critical communications with clients and partners.",
                status: "resolved",
                createdAt: "2025-03-14T09:22:15.000Z",
                updatedAt: "2025-03-14T16:45:30.000Z",
                resolvedAt: "2025-03-14T16:45:30.000Z",
                history: [
                    {
                        action: "Status Changed",
                        timestamp: "2025-03-14T16:45:30.000Z",
                        details: "Status changed from 'in-progress' to 'resolved'. Issue was fixed by updating firewall rules."
                    },
                    {
                        action: "Status Changed",
                        timestamp: "2025-03-14T10:05:45.000Z",
                        details: "Status changed from 'open' to 'in-progress'"
                    },
                    {
                        action: "Ticket Created",
                        timestamp: "2025-03-14T09:22:15.000Z",
                        details: "Ticket was created"
                    }
                ]
            },
            {
                id: "TKT-1003",
                title: "Printer offline in Finance department",
                description: "The main printer in the Finance department (HP LaserJet 5500) is showing offline status and not accepting print jobs.",
                priority: "medium",
                system: "sys1616161673",
                impact: "Affects 8 users in Finance. Causing moderate delays in document processing.",
                status: "open",
                createdAt: "2025-03-16T08:30:00.000Z",
                updatedAt: "2025-03-16T08:30:00.000Z",
                resolvedAt: null,
                history: [
                    {
                        action: "Ticket Created",
                        timestamp: "2025-03-16T08:30:00.000Z",
                        details: "Ticket was created"
                    }
                ]
            },
            {
                id: "TKT-1004",
                title: "CRM system slow response time",
                description: "The CRM system is experiencing slow response times. Pages take 10-15 seconds to load.",
                priority: "high",
                system: "sys1616161674",
                impact: "Affects sales and customer service teams (45 users total). Significantly reducing call handling capacity.",
                status: "in-progress",
                createdAt: "2025-03-15T11:20:00.000Z",
                updatedAt: "2025-03-15T13:45:00.000Z",
                resolvedAt: null,
                history: [
                    {
                        action: "Update",
                        timestamp: "2025-03-15T15:30:00.000Z",
                        details: "Database team is investigating possible query optimization issues."
                    },
                    {
                        action: "Status Changed",
                        timestamp: "2025-03-15T13:45:00.000Z",
                        details: "Status changed from 'open' to 'in-progress'"
                    },
                    {
                        action: "Ticket Created",
                        timestamp: "2025-03-15T11:20:00.000Z",
                        details: "Ticket was created"
                    }
                ]
            },
            {
                id: "TKT-1005",
                title: "Monitor flickering in conference room",
                description: "The main display in Conference Room A is flickering intermittently during presentations.",
                priority: "low",
                system: "sys1616161675",
                impact: "Affects presentations in Conference Room A. Minor distraction during meetings.",
                status: "closed",
                createdAt: "2025-03-10T14:15:00.000Z",
                updatedAt: "2025-03-12T09:30:00.000Z",
                resolvedAt: "2025-03-11T16:20:00.000Z",
                history: [
                    {
                        action: "Status Changed",
                        timestamp: "2025-03-12T09:30:00.000Z",
                        details: "Status changed from 'resolved' to 'closed'"
                    },
                    {
                        action: "Status Changed",
                        timestamp: "2025-03-11T16:20:00.000Z",
                        details: "Status changed from 'in-progress' to 'resolved'. HDMI cable was replaced."
                    },
                    {
                        action: "Status Changed",
                        timestamp: "2025-03-10T15:30:00.000Z",
                        details: "Status changed from 'open' to 'in-progress'"
                    },
                    {
                        action: "Ticket Created",
                        timestamp: "2025-03-10T14:15:00.000Z",
                        details: "Ticket was created"
                    }
                ]
            }
        ],
        systems: [
            {
                id: "sys1616161671",
                name: "Corporate Network",
                description: "Primary corporate network infrastructure including switches, routers, and access points",
                category: "Infrastructure",
                status: "degraded"
            },
            {
                id: "sys1616161672",
                name: "Email Server",
                description: "Microsoft Exchange server handling all corporate email",
                category: "Servers",
                status: "operational"
            },
            {
                id: "sys1616161673",
                name: "Print Services",
                description: "Network print services and printer infrastructure",
                category: "Infrastructure",
                status: "operational"
            },
            {
                id: "sys1616161674",
                name: "CRM System",
                description: "Customer Relationship Management system",
                category: "Applications",
                status: "degraded"
            },
            {
                id: "sys1616161675",
                name: "Conference Room Equipment",
                description: "AV equipment in conference and meeting rooms",
                category: "Hardware",
                status: "operational"
            },
            {
                id: "sys1616161676",
                name: "Accounting Software",
                description: "Financial management and accounting software",
                category: "Applications",
                status: "operational"
            },
            {
                id: "sys1616161677",
                name: "File Server",
                description: "Shared file storage for departments",
                category: "Servers",
                status: "operational"
            },
            {
                id: "sys1616161678",
                name: "VPN Service",
                description: "Virtual Private Network for remote workers",
                category: "Infrastructure",
                status: "down"
            },
            {
                id: "sys1616161679",
                name: "HR System",
                description: "Human Resources management system",
                category: "Applications",
                status: "operational"
            },
            {
                id: "sys1616161680",
                name: "Backup System",
                description: "Data backup and recovery infrastructure",
                category: "Infrastructure",
                status: "degraded"
            }
        ],
        watchstations: [
            {
                id: "watch1616161681",
                name: "Network Operations Center",
                location: "Building A, Room 210",
                systems: ["sys1616161671", "sys1616161672", "sys1616161678", "sys1616161680"]
            },
            {
                id: "watch1616161682",
                name: "Help Desk",
                location: "Building A, Room 110",
                systems: ["sys1616161673", "sys1616161675", "sys1616161677"]
            },
            {
                id: "watch1616161683",
                name: "Application Support",
                location: "Building B, Room 305",
                systems: ["sys1616161674", "sys1616161676", "sys1616161679"]
            }
        ],
        circuits: [
            {
                id: "ckt1616161691",
                description: "Main Internet Connection",
                designation: "Primary WAN Link",
                status: "operational",
                system: "sys1616161671"
            },
            {
                id: "ckt1616161692",
                description: "Backup Internet Connection",
                designation: "Secondary WAN Link",
                status: "operational",
                system: "sys1616161671"
            },
            {
                id: "ckt1616161693",
                description: "Building B Network Link",
                designation: "Fiber Backbone",
                status: "degraded",
                system: "sys1616161671"
            },
            {
                id: "ckt1616161694",
                description: "VPN Tunnel to Data Center",
                designation: "Secure VPN",
                status: "down",
                system: "sys1616161678"
            },
            {
                id: "ckt1616161695",
                description: "Backup System Data Link",
                designation: "Backup Traffic Channel",
                status: "operational",
                system: "sys1616161680"
            }
        ],
        users: [
            {
                id: "user1",
                username: "admin",
                email: "admin@example.com",
                password: "admin123",
                role: "admin"
            },
            {
                id: "user2",
                username: "technician",
                email: "tech@example.com",
                password: "tech123",
                role: "technician"
            },
            {
                id: "user3",
                username: "viewer",
                email: "viewer@example.com",
                password: "viewer123",
                role: "viewer"
            }
        ],
        settings: {
            id: "app-settings",
            companyName: "Tech Support",
            ticketPrefix: "TKT",
            autoRefresh: 60,
            maxSystems: 100,
            archiveOld: true,
            archiveDays: 30,
            nextTicketNumber: 1006,
            lastModified: new Date().toISOString(),
            lastModifiedBy: "System"
        }
    };

    // Initialize file input and download elements
    const initFileElements = () => {
        // Create hidden file input for importing JSON files
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
        
        // Create hidden download link for exporting JSON files
        exportLink = document.createElement('a');
        exportLink.style.display = 'none';
        document.body.appendChild(exportLink);
    };

    // Check if the database is empty and needs initialization
    const isDatabaseEmpty = async () => {
        try {
            const ticketCount = await db.tickets.count();
            const systemCount = await db.systems.count();
            const settingsCount = await db.settings.count();
            
            return ticketCount === 0 && systemCount === 0 && settingsCount === 0;
        } catch (error) {
            console.error('Error checking if database is empty:', error);
            return true; // Assume empty if error
        }
    };

    // Load data from IndexedDB
    const loadFromDatabase = async () => {
        try {
            console.log('Loading data from IndexedDB...');
            
            // Check if we need to initialize the database with sample data
            const empty = await isDatabaseEmpty();
            if (empty) {
                console.log('Database is empty, initializing with sample data...');
                await initializeWithSampleData();
            }
            
            // Load all data into memory caches
            await refreshDataCache();
            
            console.log('Data loaded from IndexedDB successfully');
            return true;
        } catch (error) {
            console.error('Error loading from IndexedDB:', error);
            return false;
        }
    };

    // Initialize the database with sample data
    const initializeWithSampleData = async () => {
        try {
            // Begin a transaction for all tables
            await db.transaction('rw', 
                [db.tickets, db.archivedTickets, db.systems, db.watchstations, 
                 db.circuits, db.users, db.settings], 
                async () => {
                
                // Add sample tickets
                await db.tickets.bulkAdd(SAMPLE_DATA.tickets);
                
                // Add sample systems
                await db.systems.bulkAdd(SAMPLE_DATA.systems);
                
                // Add sample watchstations
                await db.watchstations.bulkAdd(SAMPLE_DATA.watchstations);
                
                // Add sample circuits
                await db.circuits.bulkAdd(SAMPLE_DATA.circuits);
                
                // Add sample users
                await db.users.bulkAdd(SAMPLE_DATA.users);
                
                // Add settings
                await db.settings.add(SAMPLE_DATA.settings);
                
                console.log('Sample data added to database');
            });
            
            return true;
        } catch (error) {
            console.error('Error initializing database with sample data:', error);
            return false;
        }
    };

    // Refresh the in-memory data cache from the database
    const refreshDataCache = async () => {
        try {
            // Fetch all data from IndexedDB
            const tickets = await db.tickets.toArray();
            const systems = await db.systems.toArray();
            const watchstations = await db.watchstations.toArray();
            const circuits = await db.circuits.toArray();
            const users = await db.users.toArray();
            const settingsArray = await db.settings.toArray();
            const settings = settingsArray.length > 0 ? settingsArray[0] : DEFAULT_DATA.settings;
            const archivedTickets = await db.archivedTickets.toArray();
            
            // Update the cache
            activeDataCache = {
                tickets,
                systems,
                watchstations,
                circuits,
                users,
                settings,
                nextTicketNumber: settings.nextTicketNumber || 1001,
                lastModified: settings.lastModified || new Date().toISOString(),
                lastModifiedBy: settings.lastModifiedBy || "System"
            };
            
            archivedTicketsCache = {
                tickets: archivedTickets,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser
            };
            
            return true;
        } catch (error) {
            console.error('Error refreshing data cache:', error);
            return false;
        }
    };

    // Save all data to the database
    const saveToDatabase = async (data = activeDataCache) => {
        if (!data) return false;
        
        try {
            // Update last modified metadata
            data.lastModified = new Date().toISOString();
            data.lastModifiedBy = currentUser;
            
            // Begin a transaction for all tables
            await db.transaction('rw', 
                [db.tickets, db.systems, db.watchstations, 
                 db.circuits, db.users, db.settings], 
                async () => {
                
                // Clear existing data
                await db.tickets.clear();
                await db.systems.clear();
                await db.watchstations.clear();
                await db.circuits.clear();
                await db.users.clear();
                await db.settings.clear();
                
                // Add updated data
                if (data.tickets && data.tickets.length > 0) {
                    await db.tickets.bulkAdd(data.tickets);
                }
                
                if (data.systems && data.systems.length > 0) {
                    await db.systems.bulkAdd(data.systems);
                }
                
                if (data.watchstations && data.watchstations.length > 0) {
                    await db.watchstations.bulkAdd(data.watchstations);
                }
                
                if (data.circuits && data.circuits.length > 0) {
                    await db.circuits.bulkAdd(data.circuits);
                }
                
                if (data.users && data.users.length > 0) {
                    await db.users.bulkAdd(data.users);
                }
                
                // Update settings
                const settings = {
                    id: "app-settings",
                    companyName: data.settings?.companyName || "Tech Support",
                    ticketPrefix: data.settings?.ticketPrefix || "TKT",
                    autoRefresh: data.settings?.autoRefresh || 60,
                    maxSystems: data.settings?.maxSystems || 100,
                    archiveOld: data.settings?.archiveOld !== undefined ? data.settings.archiveOld : true,
                    archiveDays: data.settings?.archiveDays || 30,
                    nextTicketNumber: data.nextTicketNumber || 1001,
                    lastModified: data.lastModified,
                    lastModifiedBy: data.lastModifiedBy
                };
                
                await db.settings.add(settings);
            });
            
            console.log('Data saved to IndexedDB');
            return true;
        } catch (error) {
            console.error('Error saving to IndexedDB:', error);
            return false;
        }
    };

    // Save archived tickets to the database
    const saveArchivedToDatabase = async (archivedData = archivedTicketsCache) => {
        if (!archivedData || !archivedData.tickets) return false;
        
        try {
            // Update metadata
            archivedData.lastModified = new Date().toISOString();
            archivedData.lastModifiedBy = currentUser;
            
            // Clear existing archived tickets
            await db.archivedTickets.clear();
            
            // Add updated archived tickets
            if (archivedData.tickets.length > 0) {
                await db.archivedTickets.bulkAdd(archivedData.tickets);
            }
            
            console.log('Archived tickets saved to IndexedDB');
            return true;
        } catch (error) {
            console.error('Error saving archived tickets to IndexedDB:', error);
            return false;
        }
    };

    // Import data from JSON file
    const importData = (callback) => {
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    activeDataCache = data;
                    
                    // Save to IndexedDB
                    const saveResult = await saveToDatabase(data);
                    
                    if (saveResult) {
                        console.log('Data imported from file:', file.name);
                        
                        if (callback && typeof callback === 'function') {
                            callback(true);
                        }
                        
                        UI.showNotification('Data imported successfully', 'success');
                    } else {
                        throw new Error('Failed to save imported data to database');
                    }
                } catch (error) {
                    console.error('Error importing data:', error);
                    UI.showNotification('Error importing data: ' + error.message, 'error');
                    
                    if (callback && typeof callback === 'function') {
                        callback(false);
                    }
                }
            };
            reader.onerror = () => {
                console.error('Error reading file');
                UI.showNotification('Error reading file', 'error');
                
                if (callback && typeof callback === 'function') {
                    callback(false);
                }
            };
            reader.readAsText(file);
        };
        
        fileInput.click();
    };

    // Import archived tickets from JSON file
    const importArchivedTickets = (callback) => {
        fileInput.onchange = async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    archivedTicketsCache = data;
                    
                    // Save to IndexedDB
                    const saveResult = await saveArchivedToDatabase(data);
                    
                    if (saveResult) {
                        console.log('Archived tickets imported from file:', file.name);
                        
                        if (callback && typeof callback === 'function') {
                            callback(true);
                        }
                        
                        UI.showNotification('Archived tickets imported successfully', 'success');
                    } else {
                        throw new Error('Failed to save imported archived tickets to database');
                    }
                } catch (error) {
                    console.error('Error importing archived tickets:', error);
                    UI.showNotification('Error importing archived tickets: ' + error.message, 'error');
                    
                    if (callback && typeof callback === 'function') {
                        callback(false);
                    }
                }
            };
            reader.onerror = () => {
                console.error('Error reading file');
                UI.showNotification('Error reading file', 'error');
                
                if (callback && typeof callback === 'function') {
                    callback(false);
                }
            };
            reader.readAsText(file);
        };
        
        fileInput.click();
    };

    // Export data to JSON file
    const exportData = async (filename = 'trouble_ticket_data.json') => {
        try {
            // Ensure we have the latest data
            await refreshDataCache();
            
            // Update last modified metadata before export
            activeDataCache.lastModified = new Date().toISOString();
            activeDataCache.lastModifiedBy = currentUser;
            
            const dataStr = JSON.stringify(activeDataCache, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            exportLink.href = url;
            exportLink.download = filename;
            exportLink.click();
            
            console.log('Data exported to file:', filename);
            URL.revokeObjectURL(url);
            
            UI.showNotification('Data exported successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            UI.showNotification('Error exporting data', 'error');
            return false;
        }
    };

    // Export archived tickets to JSON file
    const exportArchivedTickets = async (filename = 'archived_tickets.json') => {
        try {
            // Ensure we have the latest data
            const archivedTickets = await db.archivedTickets.toArray();
            
            archivedTicketsCache = {
                tickets: archivedTickets,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser
            };
            
            const dataStr = JSON.stringify(archivedTicketsCache, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            exportLink.href = url;
            exportLink.download = filename;
            exportLink.click();
            
            console.log('Archived tickets exported to file:', filename);
            URL.revokeObjectURL(url);
            
            UI.showNotification('Archived tickets exported successfully', 'success');
            return true;
        } catch (error) {
            console.error('Error exporting archived tickets:', error);
            UI.showNotification('Error exporting archived tickets', 'error');
            return false;
        }
    };

    // Reset data to defaults
    const resetData = async () => {
        try {
            // Clear all data from the database
            await db.delete();
            await db.open();
            
            // Reinitialize the database schema
            db.version(1).stores({
                tickets: 'id, status, priority, system, createdAt, updatedAt, resolvedAt',
                archivedTickets: 'id, status, priority, system, createdAt, updatedAt, resolvedAt',
                systems: 'id, name, status, category',
                watchstations: 'id, name, location',
                circuits: 'id, designation, status, system',
                users: 'id, username, email, role',
                settings: 'id'
            });
            
            // Initialize with default data
            await initializeWithSampleData();
            
            // Refresh the cache
            await refreshDataCache();
            
            console.log('Data reset to defaults');
            return true;
        } catch (error) {
            console.error('Error resetting data:', error);
            return false;
        }
    };

    // Get all active data
    const getAllData = () => {
        return activeDataCache;
    };

    // Get archived tickets
    const getArchivedTickets = async () => {
        try {
            const archivedTickets = await db.archivedTickets.toArray();
            return archivedTickets;
        } catch (error) {
            console.error('Error getting archived tickets:', error);
            return [];
        }
    };

    // Save data
    const saveData = async (data) => {
        try {
            activeDataCache = { 
                ...data, 
                lastModified: new Date().toISOString(), 
                lastModifiedBy: currentUser 
            };
            return await saveToDatabase(activeDataCache);
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    };

    // Save archived tickets
    const saveArchivedTickets = async (tickets) => {
        try {
            archivedTicketsCache = {
                tickets,
                lastModified: new Date().toISOString(),
                lastModifiedBy: currentUser
            };
            return await saveArchivedToDatabase(archivedTicketsCache);
        } catch (error) {
            console.error('Error saving archived tickets:', error);
            return false;
        }
    };

    // Archive a ticket
    const archiveTicket = async (ticketId) => {
        try {
            // Begin transaction
            await db.transaction('rw', [db.tickets, db.archivedTickets], async () => {
                // Get the ticket
                const ticket = await db.tickets.get(ticketId);
                
                if (!ticket) {
                    throw new Error(`Ticket with ID ${ticketId} not found`);
                }
                
                // Mark as archived
                ticket.isArchived = true;
                
                // Add to archived tickets
                await db.archivedTickets.add(ticket);
                
                // Remove from active tickets
                await db.tickets.delete(ticketId);
                
                console.log(`Ticket ${ticketId} archived successfully`);
            });
            
            // Update the cache
            await refreshDataCache();
            
            return true;
        } catch (error) {
            console.error('Error archiving ticket:', error);
            return false;
        }
    };

    // Restore an archived ticket
    const restoreTicket = async (ticketId) => {
        try {
            // Begin transaction
            await db.transaction('rw', [db.tickets, db.archivedTickets], async () => {
                // Get the archived ticket
                const ticket = await db.archivedTickets.get(ticketId);
                
                if (!ticket) {
                    throw new Error(`Archived ticket with ID ${ticketId} not found`);
                }
                
                // Remove archived flag
                delete ticket.isArchived;
                
                // Add to active tickets
                await db.tickets.add(ticket);
                
                // Remove from archived tickets
                await db.archivedTickets.delete(ticketId);
                
                console.log(`Ticket ${ticketId} restored successfully`);
            });
            
            // Update the cache
            await refreshDataCache();
            
            return true;
        } catch (error) {
            console.error('Error restoring ticket:', error);
            return false;
        }
    };

    // Run auto-archive process
    const runAutoArchive = async () => {
        try {
            // Ensure we have the latest settings
            await refreshDataCache();
            
            if (!activeDataCache.settings.archiveOld) {
                return { 
                    success: true, 
                    message: 'Auto-archive disabled in settings', 
                    archivedCount: 0 
                };
            }
            
            const archiveDays = activeDataCache.settings.archiveDays || 30;
            
            // Calculate the cutoff date
            const now = new Date();
            const cutoffDate = new Date(now.getTime() - (archiveDays * 24 * 60 * 60 * 1000)).toISOString();
            
            // Find tickets to archive (resolved or closed and older than the cutoff)
            const tickets = await db.tickets.toArray();
            const ticketsToArchive = tickets.filter(ticket => 
                (ticket.status === 'resolved' || ticket.status === 'closed') && 
                ticket.resolvedAt && 
                ticket.resolvedAt < cutoffDate
            );
            
            if (ticketsToArchive.length === 0) {
                return { 
                    success: true, 
                    message: 'No tickets to archive', 
                    archivedCount: 0 
                };
            }
            
            // Begin transaction to archive tickets
            await db.transaction('rw', [db.tickets, db.archivedTickets], async () => {
                // Mark tickets as archived
                ticketsToArchive.forEach(ticket => {
                    ticket.isArchived = true;
                });
                
                // Add to archived tickets
                await db.archivedTickets.bulkAdd(ticketsToArchive);
                
                // Remove from active tickets
                for (const ticket of ticketsToArchive) {
                    await db.tickets.delete(ticket.id);
                }
            });
            
            // Refresh the cache
            await refreshDataCache();
            
            return { 
                success: true, 
                message: `${ticketsToArchive.length} tickets archived successfully`, 
                archivedCount: ticketsToArchive.length 
            };
        } catch (error) {
            console.error('Error during auto-archive process:', error);
            return { 
                success: false, 
                message: 'Error during auto-archive process', 
                archivedCount: 0 
            };
        }
    };

    // Search archived tickets
    const searchArchivedTickets = async (filters) => {
        try {
            let results = await db.archivedTickets.toArray();
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                results = results.filter(ticket => 
                    ticket.id.toLowerCase().includes(searchLower) ||
                    ticket.title.toLowerCase().includes(searchLower) ||
                    ticket.description.toLowerCase().includes(searchLower)
                );
            }
            
            if (filters.status && filters.status !== 'all') {
                results = results.filter(ticket => ticket.status === filters.status);
            }
            
            if (filters.priority && filters.priority !== 'all') {
                results = results.filter(ticket => ticket.priority === filters.priority);
            }
            
            if (filters.system && filters.system !== 'all') {
                results = results.filter(ticket => ticket.system === filters.system);
            }
            
            return results;
        } catch (error) {
            console.error('Error searching archived tickets:', error);
            return [];
        }
    };

    // Set current user
    const setCurrentUser = (username) => {
        currentUser = username || "Anonymous";
    };
    
    // Start the auto-save timer
    const startAutoSave = () => {
        // Clear any existing timer
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
        }
        
        // Only start auto-save if using File System Access API
        if (storageStrategy !== 'fileSystem' || !currentFileHandle) {
            return;
        }
        
        // Start a new timer
        autoSaveTimer = setInterval(async () => {
            try {
                // Get the current data
                await refreshDataCache();
                
                // Write to the file
                const success = await FileSystemAccess.writeToFile(currentFileHandle, activeDataCache);
                
                if (success) {
                    console.log('Auto-saved data to file');
                } else {
                    console.error('Failed to auto-save data to file');
                }
            } catch (error) {
                console.error('Error auto-saving data:', error);
            }
        }, AUTO_SAVE_INTERVAL);
    };
    
    // Set the storage strategy
    const setStorageStrategy = (strategy) => {
        // Update the strategy
        storageStrategy = strategy;
        
        // Update the UI
        if (typeof StorageStatusUI?.updateStatus === 'function') {
            StorageStatusUI.updateStatus(strategy, currentFileHandle?.name);
        }
        
        // Start auto-save if using file system
        if (strategy === 'fileSystem' && currentFileHandle) {
            startAutoSave();
        } else {
            // Stop auto-save if using indexedDB
            if (autoSaveTimer) {
                clearInterval(autoSaveTimer);
                autoSaveTimer = null;
            }
        }
    };
    
    // Save data using the current storage strategy
    const saveUsingCurrentStrategy = async () => {
        try {
            // Update the active data cache
            await refreshDataCache();
            
            // Update last modified metadata
            activeDataCache.lastModified = new Date().toISOString();
            activeDataCache.lastModifiedBy = currentUser;
            
            // Save based on strategy
            if (storageStrategy === 'fileSystem' && currentFileHandle) {
                // Save to file
                const success = await FileSystemAccess.writeToFile(currentFileHandle, activeDataCache);
                
                if (!success) {
                    throw new Error('Failed to write data to file');
                }
                
                // Also save to IndexedDB as backup
                await saveToDatabase(activeDataCache);
                
                return true;
            } else {
                // Save to IndexedDB
                return await saveToDatabase(activeDataCache);
            }
        } catch (error) {
            console.error('Error saving data using current strategy:', error);
            return false;
        }
    };
    
    // Get the current storage strategy
    const getCurrentStorageStrategy = () => {
        return storageStrategy;
    };
    
    // Initialize storage strategy based on availability
    const initializeStorageStrategy = async () => {
        // Check if File System Access API is supported
        const apiSupported = FileSystemAccess.isSupported();
        
        if (apiSupported) {
            // Try to restore file handle
            const fileHandle = FileSystemAccess.getCurrentFileHandle();
            
            if (fileHandle) {
                // Verify permission
                const hasPermission = await FileSystemAccess.verifyPermission(fileHandle);
                
                if (hasPermission) {
                    // Use file system storage
                    currentFileHandle = fileHandle;
                    setStorageStrategy('fileSystem');
                    return;
                }
            }
        }
        
        // Fall back to IndexedDB
        setStorageStrategy('indexedDB');
        
        // Notify user about API availability
        if (typeof StorageStatusUI?.notifyStorageMethod === 'function') {
            StorageStatusUI.notifyStorageMethod('indexedDB');
        }
    };
    
    // Handle a file handle selected by the user via File System Access API
    const onFileHandleSelected = async (fileHandle, action) => {
        if (!fileHandle) return;
        
        try {
            // Store the file handle
            currentFileHandle = fileHandle;
            
            if (action === 'open') {
                // Read from the file
                const data = await FileSystemAccess.readFromFile(fileHandle);
                
                if (data) {
                    // Update the active data cache
                    activeDataCache = data;
                    
                    // Also save to IndexedDB as backup
                    await saveToDatabase(data);
                    
                    // Notify the UI about storage method
                    if (typeof StorageStatusUI?.notifyStorageMethod === 'function') {
                        StorageStatusUI.notifyStorageMethod('fileSystem');
                    }
                    
                    // Update storage strategy and status indicator
                    setStorageStrategy('fileSystem');
                    
                    // Refresh UI if needed
                    await refreshDataCache();
                    if (typeof UI?.refreshAll === 'function') {
                        UI.refreshAll();
                    }
                    
                    console.log('Data loaded from file successfully');
                    UI.showNotification('Data loaded from file successfully', 'success');
                } else {
                    throw new Error('Failed to read data from file');
                }
            } else if (action === 'save') {
                // Get the current data
                await refreshDataCache();
                
                // Write to the file
                const success = await FileSystemAccess.writeToFile(fileHandle, activeDataCache);
                
                if (success) {
                    // Notify the UI about storage method
                    if (typeof StorageStatusUI?.notifyStorageMethod === 'function') {
                        StorageStatusUI.notifyStorageMethod('fileSystem');
                    }
                    
                    // Update storage strategy and status indicator
                    setStorageStrategy('fileSystem');
                    
                    console.log('Data saved to file successfully');
                    UI.showNotification('Data saved to file successfully', 'success');
                } else {
                    throw new Error('Failed to write data to file');
                }
            }
            
            // Start auto-save timer
            startAutoSave();
            
        } catch (error) {
            console.error('Error handling file handle:', error);
            UI.showNotification('Error handling file: ' + error.message, 'error');
            
            // Reset to IndexedDB
            setStorageStrategy('indexedDB');
            currentFileHandle = null;
        }
    };

    // Public API
    return {
        initFileElements,
        loadFromDatabase,
        importData,
        importArchivedTickets,
        exportData,
        exportArchivedTickets,
        resetData,
        getAllData,
        getArchivedTickets,
        saveData,
        saveArchivedTickets,
        archiveTicket,
        restoreTicket,
        runAutoArchive,
        searchArchivedTickets,
        setCurrentUser,
        // File System Access API methods
        onFileHandleSelected,
        getCurrentStorageStrategy,
        saveUsingCurrentStrategy,
        initializeStorageStrategy
    };
})();

// Auto-save data to JSON files
const autoSaveToFiles = async () => {
    try {
        console.log('Auto-saving data to JSON files...');
        
        // Export main data to data.json
        await FileManager.exportData('data.json');
        
        // Export archived tickets to archived_tickets.json
        await FileManager.exportArchivedTickets('archived_tickets.json');
        
        console.log('Auto-save completed successfully');
        return true;
    } catch (error) {
        console.error('Error during auto-save:', error);
        return false;
    }
};

// Auto-load data from JSON files 
// Note: Due to browser security restrictions, auto-load via fetch only works when served from a web server (http/https)
// When running from file://, manual import is required
const autoLoadFromFiles = async () => {
    try {
        console.log('Checking for JSON files to auto-load...');
        
        // When using file:// protocol, the fetch API will be blocked by CORS
        // We'll return false so the app will fall back to IndexedDB data
        if (window.location.protocol === 'file:') {
            console.log('Running from file:// protocol - auto-load feature requires a web server');
            console.log('Using IndexedDB data - use the Import buttons if you need to load from files');
            
            // Show a notification to the user if the UI is loaded
            setTimeout(() => {
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification(
                        'Auto-load feature works only with web servers. Use manual import if needed.', 
                        'info',
                        5000
                    );
                }
            }, 2000);
            
            return false;
        }
        
        // The following code will only run when served from a web server (http/https)
        try {
            // Check if data.json exists
            const mainDataResponse = await fetch('data.json');
            if (mainDataResponse.ok) {
                const data = await mainDataResponse.json();
                
                // Import to database
                await FileManager.saveToDatabase(data);
                console.log('Auto-loaded data from data.json');
                
                // Show notification
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Data loaded from data.json', 'success');
                }
            }
        } catch (error) {
            console.log('No data.json file found or error loading it');
        }
        
        try {
            // Check if archived_tickets.json exists
            const archivedDataResponse = await fetch('archived_tickets.json');
            if (archivedDataResponse.ok) {
                const archivedData = await archivedDataResponse.json();
                
                // Import to database
                await FileManager.saveArchivedToDatabase(archivedData);
                console.log('Auto-loaded archived tickets from archived_tickets.json');
                
                // Show notification
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Archived tickets loaded', 'success');
                }
            }
        } catch (error) {
            console.log('No archived_tickets.json file found or error loading it');
        }
        
        // Refresh the data cache
        await FileManager.refreshDataCache();
        return true;
        
    } catch (error) {
        console.error('Error during auto-load:', error);
        return false;
    }
};

// Initialize file manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FileManager.initFileElements();
    
    // Use async IIFE to handle async initialization
    (async () => {
        try {
            // First try to load from JSON files
            const filesLoaded = await autoLoadFromFiles();
            
            // If no files were loaded, load from IndexedDB
            if (!filesLoaded) {
                await FileManager.loadFromDatabase();
            }
            
            console.log('FileManager initialized successfully');
        } catch (error) {
            console.error('Error initializing FileManager:', error);
        }
    })();
});

// Add event listener for beforeunload to auto-save data
window.addEventListener('beforeunload', (event) => {
    // Auto-save data to JSON files
    autoSaveToFiles();
    
    // Note: Modern browsers require user interaction before closing,
    // we can't reliably prevent closing, but we can auto-save
});
