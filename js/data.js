/**
 * Data Management Module
 * Handles data storage and retrieval using FileManager
 */

const DataStore = (() => {
    // Retrieve data from FileManager
    const initializeData = async () => {
        try {
            console.log('Initializing data store...');
            // Get username for file operations
            const username = document.getElementById('current-user').textContent;
            FileManager.setCurrentUser(username);
            
            // Initialize IndexedDB database
            await FileManager.loadFromDatabase();
            
            console.log('Data store initialized successfully with IndexedDB');
        } catch (error) {
            console.error('Error initializing data store:', error);
        }
    };

    // Get all active data
    const getAllData = async () => {
        const data = FileManager.getAllData();
        if (!data) {
            console.error('Error getting active data');
            // Return an empty data structure as fallback
            return {
                tickets: [],
                systems: [],
                watchstations: [],
                circuits: [],
                users: [],
                settings: {
                    autoRefresh: 60,
                    maxSystems: 150
                },
                nextTicketNumber: 1001
            };
        }
        return data;
    };

    // Save all active data
    const saveAllData = async (data) => {
        console.log('Saving active data');
        try {
            return await FileManager.saveData(data);
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    };

    // Get archived tickets
    const getArchivedTickets = async () => {
        try {
            const archivedTickets = await FileManager.getArchivedTickets();
            return archivedTickets || [];
        } catch (error) {
            console.error('Error getting archived tickets:', error);
            return [];
        }
    };

    // Archive a ticket
    const archiveTicket = async (ticketId) => {
        console.log(`Archiving ticket ${ticketId}`);
        try {
            return await FileManager.archiveTicket(ticketId);
        } catch (error) {
            console.error(`Error archiving ticket ${ticketId}:`, error);
            return false;
        }
    };

    // Restore an archived ticket
    const restoreTicket = async (ticketId) => {
        console.log(`Restoring ticket ${ticketId}`);
        try {
            return await FileManager.restoreTicket(ticketId);
        } catch (error) {
            console.error(`Error restoring ticket ${ticketId}:`, error);
            return false;
        }
    };

    // Run auto-archive process
    const runAutoArchive = async () => {
        console.log('Running auto-archive process');
        try {
            return await FileManager.runAutoArchive();
        } catch (error) {
            console.error('Error running auto-archive process:', error);
            return { success: false, message: 'Error running auto-archive process', archivedCount: 0 };
        }
    };

    // Search archived tickets
    const searchArchivedTickets = async (filters) => {
        try {
            return await FileManager.searchArchivedTickets(filters);
        } catch (error) {
            console.error('Error searching archived tickets:', error);
            return [];
        }
    };

    // Get tickets (active only)
    const getTickets = async () => {
        const data = await getAllData();
        return data.tickets || [];
    };

    // Get ticket by ID (checks active tickets only)
    const getTicketById = async (ticketId) => {
        const tickets = await getTickets();
        return tickets.find(ticket => ticket.id === ticketId);
    };

    // Create new ticket
    const createTicket = async (ticketData) => {
        const data = await getAllData();
        const ticketId = `${data.settings.ticketPrefix}-${data.nextTicketNumber}`;
        
        const newTicket = {
            id: ticketId,
            title: ticketData.title,
            description: ticketData.description,
            priority: ticketData.priority,
            system: ticketData.system,
            areaSupervisor: ticketData.areaSupervisor || 'Unassigned',
            impact: ticketData.impact,
            status: 'open',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolvedAt: null,
            history: [
                {
                    action: 'Ticket Created',
                    timestamp: new Date().toISOString(),
                    details: 'Ticket was created',
                    user: document.getElementById('current-user').textContent || 'System'
                }
            ]
        };
        
        data.tickets.unshift(newTicket); // Add to beginning of array
        data.nextTicketNumber++;
        await saveAllData(data);
        
        return newTicket;
    };

    // Update ticket
    const updateTicket = async (ticketId, updates) => {
        const data = await getAllData();
        const ticketIndex = data.tickets.findIndex(ticket => ticket.id === ticketId);
        
        if (ticketIndex === -1) return null;
        
        const ticket = data.tickets[ticketIndex];
        const updatedTicket = { ...ticket, ...updates, updatedAt: new Date().toISOString() };
        
        // If status changed to resolved, add resolvedAt timestamp
        if (updates.status === 'resolved' && ticket.status !== 'resolved') {
            updatedTicket.resolvedAt = new Date().toISOString();
        }
        
        data.tickets[ticketIndex] = updatedTicket;
        await saveAllData(data);
        
        return updatedTicket;
    };

    // Add ticket history entry
    const addTicketHistory = async (ticketId, action, details) => {
        const data = await getAllData();
        const ticketIndex = data.tickets.findIndex(ticket => ticket.id === ticketId);
        
        if (ticketIndex === -1) return null;
        
        const historyEntry = {
            action,
            timestamp: new Date().toISOString(),
            details,
            user: document.getElementById('current-user').textContent || 'System'
        };
        
        data.tickets[ticketIndex].history.unshift(historyEntry);
        data.tickets[ticketIndex].updatedAt = new Date().toISOString();
        await saveAllData(data);
        
        return data.tickets[ticketIndex];
    };
    
    // Add ticket history entry with custom history object
    const addTicketHistoryWithUser = async (ticketId, historyEntry) => {
        const data = await getAllData();
        const ticketIndex = data.tickets.findIndex(ticket => ticket.id === ticketId);
        
        if (ticketIndex === -1) return null;
        
        data.tickets[ticketIndex].history.unshift(historyEntry);
        data.tickets[ticketIndex].updatedAt = new Date().toISOString();
        await saveAllData(data);
        
        return data.tickets[ticketIndex];
    };

    // Get systems
    const getSystems = () => {
        // Non-async version for UI components
        const data = FileManager.getAllData();
        if (data) {
            return data.systems || [];
        }
        return [];
    };

    // Get systems async version
    const getSystemsAsync = async () => {
        const data = await getAllData();
        return data.systems || [];
    };

    // Get system by ID
    const getSystemById = async (systemId) => {
        const systems = await getSystemsAsync();
        return systems.find(system => system.id === systemId);
    };

    // Create new system
    const createSystem = async (systemData) => {
        const data = await getAllData();
        const systemId = `sys${Date.now()}`;
        
        const newSystem = {
            id: systemId,
            name: systemData.name,
            description: systemData.description || '',
            category: systemData.category || '',
            status: systemData.status || 'unknown'
        };
        
        data.systems.push(newSystem);
        await saveAllData(data);
        
        return newSystem;
    };

    // Update system
    const updateSystem = async (systemId, updates) => {
        const data = await getAllData();
        const systemIndex = data.systems.findIndex(system => system.id === systemId);
        
        if (systemIndex === -1) return null;
        
        data.systems[systemIndex] = { ...data.systems[systemIndex], ...updates };
        await saveAllData(data);
        
        return data.systems[systemIndex];
    };

    // Delete system
    const deleteSystem = async (systemId) => {
        const data = await getAllData();
        const systemIndex = data.systems.findIndex(system => system.id === systemId);
        
        if (systemIndex === -1) return false;
        
        data.systems.splice(systemIndex, 1);
        await saveAllData(data);
        
        return true;
    };

    // Get watchstations
    const getWatchstations = async () => {
        const data = await getAllData();
        return data.watchstations || [];
    };

    // Create new watchstation
    const createWatchstation = async (watchstationData) => {
        const data = await getAllData();
        const watchstationId = `watch${Date.now()}`;
        
        const newWatchstation = {
            id: watchstationId,
            name: watchstationData.name,
            location: watchstationData.location || '',
            systems: watchstationData.systems || []
        };
        
        data.watchstations.push(newWatchstation);
        await saveAllData(data);
        
        return newWatchstation;
    };

    // Update watchstation
    const updateWatchstation = async (watchstationId, updates) => {
        const data = await getAllData();
        const watchstationIndex = data.watchstations.findIndex(ws => ws.id === watchstationId);
        
        if (watchstationIndex === -1) return null;
        
        data.watchstations[watchstationIndex] = { ...data.watchstations[watchstationIndex], ...updates };
        await saveAllData(data);
        
        return data.watchstations[watchstationIndex];
    };

    // Delete watchstation
    const deleteWatchstation = async (watchstationId) => {
        const data = await getAllData();
        const watchstationIndex = data.watchstations.findIndex(ws => ws.id === watchstationId);
        
        if (watchstationIndex === -1) return false;
        
        data.watchstations.splice(watchstationIndex, 1);
        await saveAllData(data);
        
        return true;
    };

    // Get circuits
    const getCircuits = async () => {
        const data = await getAllData();
        return data.circuits || [];
    };

    // Create new circuit
    const createCircuit = async (circuitData) => {
        const data = await getAllData();
        const circuitId = circuitData.id || `ckt${Date.now()}`;
        
        const newCircuit = {
            id: circuitId,
            description: circuitData.description || '',
            designation: circuitData.designation || '',
            status: circuitData.status || 'unknown',
            system: circuitData.system || null
        };
        
        data.circuits.push(newCircuit);
        await saveAllData(data);
        
        return newCircuit;
    };

    // Update circuit
    const updateCircuit = async (circuitId, updates) => {
        const data = await getAllData();
        const circuitIndex = data.circuits.findIndex(circuit => circuit.id === circuitId);
        
        if (circuitIndex === -1) return null;
        
        data.circuits[circuitIndex] = { ...data.circuits[circuitIndex], ...updates };
        await saveAllData(data);
        
        return data.circuits[circuitIndex];
    };

    // Delete circuit
    const deleteCircuit = async (circuitId) => {
        const data = await getAllData();
        const circuitIndex = data.circuits.findIndex(circuit => circuit.id === circuitId);
        
        if (circuitIndex === -1) return false;
        
        data.circuits.splice(circuitIndex, 1);
        await saveAllData(data);
        
        return true;
    };

    // Get users
    const getUsers = () => {
        // Non-async version for UI components
        const data = FileManager.getAllData();
        if (data) {
            return data.users || [];
        }
        return [];
    };

    // Get users async version
    const getUsersAsync = async () => {
        const data = await getAllData();
        return data.users || [];
    };

    // Create new user
    const createUser = async (userData) => {
        const data = await getAllData();
        const userId = `user${Date.now()}`;
        
        const newUser = {
            id: userId,
            username: userData.username,
            email: userData.email,
            password: userData.password, // In a real app, this would be hashed
            role: userData.role || 'viewer'
        };
        
        data.users.push(newUser);
        await saveAllData(data);
        
        return newUser;
    };

    // Update user
    const updateUser = async (userId, updates) => {
        const data = await getAllData();
        const userIndex = data.users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) return null;
        
        data.users[userIndex] = { ...data.users[userIndex], ...updates };
        await saveAllData(data);
        
        return data.users[userIndex];
    };

    // Delete user
    const deleteUser = async (userId) => {
        const data = await getAllData();
        const userIndex = data.users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) return false;
        
        data.users.splice(userIndex, 1);
        await saveAllData(data);
        
        return true;
    };

    // Get settings
    const getSettings = async () => {
        const data = await getAllData();
        return data.settings || {};
    };

    // Get settings (synchronous version for UI components)
    const getSettingsSync = () => {
        const data = FileManager.getAllData();
        if (data && data.settings) {
            return data.settings;
        }
        return {
            autoRefresh: 60,
            maxSystems: 150
        };
    };

    // Update settings
    const updateSettings = async (updates) => {
        const data = await getAllData();
        data.settings = { ...(data.settings || {}), ...updates };
        await saveAllData(data);
        
        return data.settings;
    };

    // Filter tickets (active only)
    const filterTickets = async (filters) => {
        console.log("Filtering tickets with filters:", filters);
        try {
            const tickets = await getTickets();
            console.log("Total tickets before filtering:", tickets.length);
            let filteredTickets = [...tickets];
            
            if (filters.status && filters.status !== 'all') {
                filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
                console.log(`After status filter (${filters.status}):`, filteredTickets.length);
            }
            
            // Only apply priority filter if it exists and is not 'all'
            if (filters.priority && filters.priority !== 'all') {
                filteredTickets = filteredTickets.filter(ticket => ticket.priority === filters.priority);
                console.log(`After priority filter (${filters.priority}):`, filteredTickets.length);
            }
            
            if (filters.system && filters.system !== 'all') {
                filteredTickets = filteredTickets.filter(ticket => ticket.system === filters.system);
                console.log(`After system filter (${filters.system}):`, filteredTickets.length);
            }
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.id.toLowerCase().includes(searchLower) ||
                    ticket.title.toLowerCase().includes(searchLower) ||
                    ticket.description.toLowerCase().includes(searchLower)
                );
                console.log(`After search filter (${filters.search}):`, filteredTickets.length);
            }
            
            // Add option to include archived tickets
            if (filters.includeArchived) {
                try {
                    const archivedTickets = await searchArchivedTickets(filters);
                    filteredTickets = [...filteredTickets, ...archivedTickets];
                    console.log(`After including archived tickets:`, filteredTickets.length);
                } catch (error) {
                    console.error('Error fetching archived tickets for filter:', error);
                }
            }
            
            console.log(`Final filtered tickets count:`, filteredTickets.length);
            return filteredTickets;
        } catch (error) {
            console.error('Error in filterTickets:', error);
            return [];
        }
    };

    // Generate report data (includes both active and archived tickets for comprehensive reporting)
    const generateReport = async (reportType, dateRange, filter) => {
        // Get both active and archived tickets for complete reporting
        const activeTickets = await getTickets();
        let archivedTickets = [];
        
        try {
            archivedTickets = await getArchivedTickets();
        } catch (error) {
            console.error('Error getting archived tickets for report:', error);
        }
        
        const allTickets = [...activeTickets, ...archivedTickets];
        const systems = await getSystemsAsync();
        let reportData = {};
        
        // Filter tickets by date range
        let filteredTickets = [...allTickets];
        const now = new Date();
        
        if (dateRange === 'today') {
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
            filteredTickets = filteredTickets.filter(ticket => ticket.createdAt >= today);
        } else if (dateRange === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            filteredTickets = filteredTickets.filter(ticket => ticket.createdAt >= weekAgo);
        } else if (dateRange === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            filteredTickets = filteredTickets.filter(ticket => ticket.createdAt >= monthAgo);
        } else if (dateRange === 'custom' && filter.startDate && filter.endDate) {
            const startDate = new Date(filter.startDate).toISOString();
            const endDate = new Date(filter.endDate).toISOString();
            filteredTickets = filteredTickets.filter(ticket => ticket.createdAt >= startDate && ticket.createdAt <= endDate);
        }
        
        // Generate report based on type
        if (reportType === 'ticket-summary') {
            // Count tickets by status
            const statusCounts = {
                open: 0,
                'in-progress': 0,
                resolved: 0,
                closed: 0
            };
            
            filteredTickets.forEach(ticket => {
                statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
            });
            
            // Count tickets by priority
            const priorityCounts = {
                low: 0,
                medium: 0,
                high: 0,
                critical: 0
            };
            
            filteredTickets.forEach(ticket => {
                priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
            });
            
            // Count tickets by system
            const systemCounts = {};
            
            filteredTickets.forEach(ticket => {
                systemCounts[ticket.system] = (systemCounts[ticket.system] || 0) + 1;
            });
            
            reportData = {
                totalTickets: filteredTickets.length,
                statusCounts,
                priorityCounts,
                systemCounts,
                archivedCount: archivedTickets.length,
                activeCount: activeTickets.length
            };
        } else if (reportType === 'system-status') {
            // Track system status changes over time
            const systemStatusHistory = {};
            
            systems.forEach(system => {
                const systemTickets = filteredTickets.filter(ticket => ticket.system === system.id);
                
                systemStatusHistory[system.id] = {
                    name: system.name,
                    currentStatus: system.status,
                    ticketCount: systemTickets.length,
                    tickets: systemTickets.map(ticket => ({
                        id: ticket.id,
                        title: ticket.title,
                        status: ticket.status,
                        createdAt: ticket.createdAt,
                        resolvedAt: ticket.resolvedAt,
                        isArchived: archivedTickets.some(at => at.id === ticket.id)
                    }))
                };
            });
            
            reportData = {
                systems: systemStatusHistory
            };
        } else if (reportType === 'resolution-time') {
            // Calculate average resolution time
            const resolvedTickets = filteredTickets.filter(ticket => ticket.resolvedAt);
            let totalResolutionTime = 0;
            
            resolvedTickets.forEach(ticket => {
                const createdTime = new Date(ticket.createdAt).getTime();
                const resolvedTime = new Date(ticket.resolvedAt).getTime();
                totalResolutionTime += resolvedTime - createdTime;
            });
            
            const avgResolutionTime = resolvedTickets.length > 0 
                ? totalResolutionTime / resolvedTickets.length 
                : 0;
            
            // Resolution time by priority
            const priorityResolutionTimes = {
                low: { total: 0, count: 0 },
                medium: { total: 0, count: 0 },
                high: { total: 0, count: 0 },
                critical: { total: 0, count: 0 }
            };
            
            resolvedTickets.forEach(ticket => {
                const createdTime = new Date(ticket.createdAt).getTime();
                const resolvedTime = new Date(ticket.resolvedAt).getTime();
                const resolutionTime = resolvedTime - createdTime;
                
                if (priorityResolutionTimes[ticket.priority]) {
                    priorityResolutionTimes[ticket.priority].total += resolutionTime;
                    priorityResolutionTimes[ticket.priority].count += 1;
                }
            });
            
            // Calculate averages
            Object.keys(priorityResolutionTimes).forEach(priority => {
                const { total, count } = priorityResolutionTimes[priority];
                priorityResolutionTimes[priority].average = count > 0 ? total / count : 0;
            });
            
            reportData = {
                totalResolvedTickets: resolvedTickets.length,
                avgResolutionTime,
                priorityResolutionTimes,
                archivedIncluded: true
            };
        }
        
        return reportData;
    };

    // Reset data
    const resetData = () => {
        console.log('Resetting data to defaults');
        return FileManager.resetData();
    };

    // Public API
    return {
        initializeData,
        getAllData,
        saveAllData,
        getTickets,
        getTicketById,
        createTicket,
        updateTicket,
        addTicketHistory,
        addTicketHistoryWithUser,
        getSystems,
        getSystemsAsync,
        getSystemById,
        createSystem,
        updateSystem,
        deleteSystem,
        getWatchstations,
        createWatchstation,
        updateWatchstation,
        deleteWatchstation,
        getCircuits,
        createCircuit,
        updateCircuit,
        deleteCircuit,
        getUsers,
        getUsersAsync,
        createUser,
        updateUser,
        deleteUser,
        getSettings,
        getSettingsSync,
        updateSettings,
        filterTickets,
        generateReport,
        getArchivedTickets,
        searchArchivedTickets,
        archiveTicket,
        restoreTicket,
        runAutoArchive,
        resetData
    };
})();

// Initialize data when the script loads
document.addEventListener('DOMContentLoaded', () => {
    DataStore.initializeData();
});
