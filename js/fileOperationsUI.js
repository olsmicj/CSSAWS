/**
 * File Operations UI Module
 * Handles the file operations interface and interactions
 */

const FileOperationsUI = (() => {
    // DOM elements
    const elements = {
        fileOpsBtn: document.getElementById('file-ops-btn'),
        fileOperationsModal: document.getElementById('file-operations-modal'),
        importDataBtn: document.getElementById('import-data-btn'),
        importArchivedBtn: document.getElementById('import-archived-btn'),
        exportDataBtn: document.getElementById('export-data-btn'),
        exportArchivedBtn: document.getElementById('export-archived-btn'),
        resetDataBtn: document.getElementById('reset-data-btn'),
        lastModifiedDate: document.getElementById('last-modified-date'),
        lastModifiedBy: document.getElementById('last-modified-by')
    };

    // Initialize event listeners
    const initEventListeners = () => {
        // Open file operations modal
        elements.fileOpsBtn.addEventListener('click', () => {
            UI.showModal('file-operations-modal');
            updateMetadataDisplay();
        });
        
        // Import data
        elements.importDataBtn.addEventListener('click', importMainData);
        
        // Import archived tickets
        elements.importArchivedBtn.addEventListener('click', importArchivedTickets);
        
        // Export data
        elements.exportDataBtn.addEventListener('click', exportMainData);
        
        // Export archived tickets
        elements.exportArchivedBtn.addEventListener('click', exportArchivedTickets);
        
        // Reset data
        elements.resetDataBtn.addEventListener('click', confirmReset);
    };

    // Update metadata display
    const updateMetadataDisplay = () => {
        const data = FileManager.getAllData();
        
        if (data && data.lastModified) {
            elements.lastModifiedDate.textContent = UI.formatDate(data.lastModified);
            elements.lastModifiedBy.textContent = data.lastModifiedBy || 'Unknown';
        } else {
            elements.lastModifiedDate.textContent = 'N/A';
            elements.lastModifiedBy.textContent = 'N/A';
        }
    };

    // Import main data
    const importMainData = () => {
        FileManager.importData((success) => {
            if (success) {
                updateMetadataDisplay();
                UI.hideModal(elements.fileOperationsModal);
                
                // Update UI components
                TicketUI.renderTickets();
                SystemUI.renderSystems();
                SystemUI.renderSystemStatus();
                SystemUI.renderWatchstations();
                SystemUI.renderCircuits();
                
                UI.showNotification('Data imported successfully. Application refreshed.', 'success');
            }
        });
    };

    // Import archived tickets
    const importArchivedTickets = () => {
        FileManager.importArchivedTickets((success) => {
            if (success) {
                updateMetadataDisplay();
                UI.hideModal(elements.fileOperationsModal);
                
                // If we're viewing archived tickets, refresh the view
                if (TicketUI.isViewingArchived()) {
                    TicketUI.showArchivedTickets();
                }
                
                UI.showNotification('Archived tickets imported successfully.', 'success');
            }
        });
    };

    // Export main data
    const exportMainData = () => {
        const username = document.getElementById('current-user').textContent;
        FileManager.setCurrentUser(username);
        
        const exportFilename = `cssaws_data_${formatDateForFilename(new Date())}.json`;
        const success = FileManager.exportData(exportFilename);
        
        if (success) {
            updateMetadataDisplay();
        }
    };

    // Export archived tickets
    const exportArchivedTickets = () => {
        const username = document.getElementById('current-user').textContent;
        FileManager.setCurrentUser(username);
        
        const exportFilename = `cssaws_archived_tickets_${formatDateForFilename(new Date())}.json`;
        const success = FileManager.exportArchivedTickets(exportFilename);
        
        if (success) {
            updateMetadataDisplay();
        }
    };

    // Format date for filename (YYYY-MM-DD)
    const formatDateForFilename = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Confirm data reset
    const confirmReset = () => {
        const confirmDialog = confirm('Are you sure you want to reset all data to default values? This cannot be undone!');
        
        if (confirmDialog) {
            FileManager.resetData();
            updateMetadataDisplay();
            UI.hideModal(elements.fileOperationsModal);
            
            // Update UI components
            TicketUI.renderTickets();
            SystemUI.renderSystems();
            SystemUI.renderSystemStatus();
            SystemUI.renderWatchstations();
            SystemUI.renderCircuits();
            
            UI.showNotification('Data has been reset to default values.', 'success');
        }
    };

    // Public API
    return {
        initEventListeners,
        updateMetadataDisplay
    };
})();

// Initialize module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FileOperationsUI.initEventListeners();
});
