/**
 * Main Application Module
 * Initializes the application and handles global functionality
 */

const App = (() => {
    // Initialize application
    const init = () => {
        // Add notification styles
        addNotificationStyles();
        
        // Add chart styles
        addChartStyles();
        
        // Add modal styles
        addModalStyles();
        
        // Add file operation styles
        addFileOperationStyles();
        
        // Check for File System Access API support
        initializeStorage();
        
        // Set up auto-refresh if enabled
        setupAutoRefresh();
        
        // Initialize modules
        initModules();
        
// Force render system status and update dashboard
        setTimeout(() => {
            console.log('Forcing system status render...');
            SystemUI.renderSystemStatus();
            DashboardUI.updateDashboard();
            console.log('System status rendered and dashboard updated');
        }, 500);
        
        // Show welcome message
        UI.showNotification('Welcome to the Trouble Ticket System', 'info');
        
        // Log system count
        console.log('Total systems:', DataStore.getSystems().length);
    };

    // Add notification styles
    const addNotificationStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                z-index: 9999;
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s, transform 0.3s;
                box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            }
            
            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            
            .notification.info {
                background-color: #3498db;
            }
            
            .notification.success {
                background-color: #2ecc71;
            }
            
            .notification.warning {
                background-color: #f39c12;
            }
            
            .notification.error {
                background-color: #e74c3c;
            }
        `;
        document.head.appendChild(style);
    };

    // Add chart styles
    const addChartStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .chart-container {
                display: flex;
                flex-wrap: wrap;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .pie-chart {
                position: relative;
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background-color: #f5f5f5;
                overflow: hidden;
            }
            
            .pie-slice {
                position: absolute;
                width: 100%;
                height: 100%;
                transform-origin: 50% 50%;
            }
            
            .chart-legend {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .legend-color {
                display: inline-block;
                width: 12px;
                height: 12px;
                border-radius: 2px;
            }
            
            .report-section {
                margin-bottom: 30px;
            }
            
            .report-value {
                font-size: 24px;
                font-weight: 600;
                margin-top: 10px;
            }
            
            .report-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 15px;
            }
            
            .report-table th, .report-table td {
                padding: 10px;
                text-align: left;
                border-bottom: 1px solid #ddd;
            }
            
            .report-table th {
                background-color: #f5f7fa;
                font-weight: 600;
            }
            
            .report-table tr:hover {
                background-color: #f8f9fa;
            }
            
            .system-tickets-list {
                padding-left: 20px;
                margin: 10px 0;
            }
            
            .system-tickets-list li {
                margin-bottom: 5px;
            }
        `;
        document.head.appendChild(style);
    };

    // Set up auto-refresh
    const setupAutoRefresh = () => {
        const settings = DataStore.getSettings();
        const autoRefreshInterval = settings.autoRefresh;
        
        if (autoRefreshInterval > 0) {
            // Set interval to refresh data
            setInterval(() => {
                // Refresh ticket list
                TicketUI.renderTickets();
                
                // Refresh system status and dashboard
                SystemUI.renderSystemStatus();
                DashboardUI.updateDashboard();
                
                console.log('Auto-refreshed data and dashboard');
            }, autoRefreshInterval * 1000);
        }
    };

    // Add modal styles
    const addModalStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }
            
            .modal-overlay.active {
                opacity: 1;
                pointer-events: all;
            }
            
            .modal-container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                transform: translateY(-20px);
                transition: transform 0.3s;
            }
            
            .modal-overlay.active .modal-container {
                transform: translateY(0);
            }
            
            .modal-header {
                padding: 16px;
                border-bottom: 1px solid #eee;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .modal-title {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #999;
            }
            
            .modal-close:hover {
                color: #333;
            }
            
            .modal-body {
                padding: 16px;
            }
            
            .modal-footer {
                padding: 16px;
                border-top: 1px solid #eee;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            
            .storage-info {
                margin: 20px 0;
            }
            
            .storage-method {
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                position: relative;
            }
            
            .storage-method.active {
                border-color: #4caf50;
                background-color: #f1f8e9;
            }
            
            .active-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background-color: #4caf50;
                color: white;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .file-options {
                display: flex;
                gap: 15px;
                margin: 20px 0;
            }
            
            .file-option {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px;
                border: 1px solid #ddd;
                border-radius: 8px;
                cursor: pointer;
                background: white;
                transition: all 0.2s;
            }
            
            .file-option:hover {
                background-color: #f5f5f5;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .file-option .icon {
                font-size: 32px;
                margin-bottom: 10px;
            }
            
            .file-option .label {
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .file-option .description {
                font-size: 14px;
                color: #666;
                text-align: center;
            }
            
            .primary-button {
                background-color: #007bff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: 500;
                cursor: pointer;
            }
            
            .primary-button:hover {
                background-color: #0069d9;
            }
            
            .note {
                font-size: 14px;
                color: #666;
                font-style: italic;
            }
            
            .browser-support {
                margin: 15px 0;
            }
            
            .alternative {
                margin: 15px 0;
            }
        `;
        document.head.appendChild(style);
    };
    
    // Add file operation styles
    const addFileOperationStyles = () => {
        const style = document.createElement('style');
        style.textContent = `
            .storage-status-indicator {
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .storage-status-indicator:hover {
                transform: translateY(-2px);
            }
            
            .storage-status-text {
                color: #333;
            }
            
            /* File Selection Styles */
            .file-selection-container {
                padding: 20px;
                border: 2px dashed #ddd;
                border-radius: 8px;
                text-align: center;
                margin: 20px 0;
                transition: all 0.3s;
            }
            
            .file-selection-container:hover {
                border-color: #007bff;
                background-color: #f8f9fa;
            }
            
            .file-selection-container .icon {
                font-size: 48px;
                color: #007bff;
                margin-bottom: 15px;
            }
            
            .file-selection-container .title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
            }
            
            .file-selection-container .description {
                color: #666;
                margin-bottom: 20px;
            }
            
            .file-buttons {
                display: flex;
                justify-content: center;
                gap: 15px;
            }
        `;
        document.head.appendChild(style);
    };
    
    // Initialize storage
    const initializeStorage = async () => {
        // Check if File System Access API is available
        if (typeof FileSystemAccess !== 'undefined') {
            try {
                // Initialize File System Access
                await FileSystemAccess.initialize();
                
                // Initialize FileManager storage strategy
                if (typeof FileManager?.initializeStorageStrategy === 'function') {
                    await FileManager.initializeStorageStrategy();
                }
            } catch (error) {
                console.error('Error initializing storage system:', error);
            }
        } else {
            console.log('File System Access module not found, using IndexedDB storage only');
        }
    };
    
    // Initialize modules
    const initModules = () => {
        // UI module is initialized in ui.js
        // Other modules are initialized in their respective files
        
        // Add any additional initialization here
    };

    // Public API
    return {
        init
    };
})();

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
