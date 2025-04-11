/**
 * Storage Status UI Module
 * Provides UI components for indicating storage status and notifications about data persistence
 */

const StorageStatusUI = (() => {
    // DOM elements
    let statusIndicator = null;
    let statusIcon = null;
    let statusText = null;
    let statusButton = null;
    
    // Current storage status
    let currentStatus = 'indexedDB'; // Default to indexedDB
    
    /**
     * Initialize the storage status UI components
     */
    const initialize = () => {
        // Create the status indicator if it doesn't exist
        if (!document.getElementById('storageStatusIndicator')) {
            createStatusIndicator();
        }
        
        // Find the UI elements
        statusIndicator = document.getElementById('storageStatusIndicator');
        statusIcon = document.getElementById('storageStatusIcon');
        statusText = document.getElementById('storageStatusText');
        statusButton = document.getElementById('storageStatusButton');
        
        // Add click event listener to both the indicator and the button
        if (statusIndicator) {
            statusIndicator.addEventListener('click', handleStatusButtonClick);
        }
        
        if (statusButton) {
            statusButton.addEventListener('click', handleStatusButtonClick);
        }
        
        // Add visibility toggle to the float container
        const floatContainer = document.querySelector('.float-container');
        if (floatContainer) {
            floatContainer.addEventListener('mouseenter', () => {
                statusText.style.opacity = '1';
                statusText.style.width = 'auto';
                statusText.style.marginLeft = '8px';
            });
            
            floatContainer.addEventListener('mouseleave', () => {
                statusText.style.opacity = '0';
                statusText.style.width = '0';
                statusText.style.marginLeft = '0';
            });
        }

        // Show an initial notification explaining storage options
        setTimeout(() => {
            if (FileSystemAccess.isSupported()) {
                showNotification({
                    message: 'Click on the storage indicator in the bottom right to choose file storage.',
                    type: 'info',
                    duration: 8000
                });
            }
        }, 3000);
    };
    
    /**
     * Create the storage status indicator elements
     */
    const createStatusIndicator = () => {
        // Create the container
        const floatContainer = document.createElement('div');
        floatContainer.className = 'float-container';
        floatContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 1000;';
        
        // Create the indicator
        const indicator = document.createElement('div');
        indicator.id = 'storageStatusIndicator';
        indicator.className = 'storage-status-indicator';
        indicator.style.cssText = 'display: flex; align-items: center; background-color: #f8f9fa; border-radius: 8px; padding: 8px 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); font-size: 14px; cursor: pointer; border: 2px solid #ddd; transition: all 0.2s;';
        indicator.title = "Click to change storage options";
        
        // Add hover effects
        indicator.addEventListener('mouseenter', () => {
            indicator.style.transform = 'translateY(-3px)';
            indicator.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
            indicator.style.borderColor = '#007bff';
        });
        
        indicator.addEventListener('mouseleave', () => {
            indicator.style.transform = 'translateY(0)';
            indicator.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            indicator.style.borderColor = '#ddd';
        });
        
        // Create the icon
        const icon = document.createElement('span');
        icon.id = 'storageStatusIcon';
        icon.className = 'storage-status-icon';
        icon.style.cssText = 'font-size: 20px; margin-right: 4px;';
        
        // Create the text
        const text = document.createElement('span');
        text.id = 'storageStatusText';
        text.className = 'storage-status-text';
        text.style.cssText = 'transition: all 0.3s; opacity: 0; width: 0; overflow: hidden; white-space: nowrap;';
        
        // Create the button
        const button = document.createElement('button');
        button.id = 'storageStatusButton';
        button.className = 'storage-status-button';
        button.style.cssText = 'margin-left: 8px; background-color: #007bff; color: white; border: none; border-radius: 4px; padding: 4px 8px; cursor: pointer; font-size: 12px; display: none;';
        button.textContent = 'Change';
        
        // Assemble the indicator
        indicator.appendChild(icon);
        indicator.appendChild(text);
        indicator.appendChild(button);
        
        // Add to the float container
        floatContainer.appendChild(indicator);
        
        // Add to the document
        document.body.appendChild(floatContainer);
    };
    
    /**
     * Handle click on the status button
     */
    const handleStatusButtonClick = async () => {
        if (currentStatus === 'fileSystem') {
            // Already using file system, do nothing
            showStorageInfoModal();
        } else {
            // Try to switch to file system
            if (FileSystemAccess.isSupported()) {
                // Show file selection dialog
                showFileSelectionModal();
            } else {
                // Show info about why file system is not available
                showApiUnavailableModal();
            }
        }
    };
    
    /**
     * Update the storage status indicator
     * @param {string} status The current storage status ('fileSystem' or 'indexedDB')
     * @param {string} filePath Optional file path for display when using file system
     */
    const updateStatus = (status, filePath = '') => {
        if (!statusIndicator || !statusIcon || !statusText || !statusButton) {
            // UI not initialized yet
            return;
        }
        
        // Update current status
        currentStatus = status;
        
        if (status === 'fileSystem') {
            // Using file system
            statusIndicator.style.backgroundColor = '#d4edda';
            statusIndicator.style.borderLeft = '4px solid #28a745';
            statusIcon.textContent = '🔒';
            statusText.textContent = filePath ? `Saved to: ${getFileName(filePath)}` : 'Using file storage';
            statusButton.style.display = 'none';
        } else {
            // Using indexedDB
            statusIndicator.style.backgroundColor = '#fff3cd';
            statusIndicator.style.borderLeft = '4px solid #ffc107';
            statusIcon.textContent = '⚠️';
            statusText.textContent = 'Using browser storage only';
            statusButton.style.display = FileSystemAccess.isSupported() ? 'block' : 'none';
        }
    };
    
    /**
     * Get the file name from a path
     * @param {string} path The file path
     * @returns {string} The file name
     */
    const getFileName = (path) => {
        if (!path) return '';
        return path.split('/').pop().split('\\').pop();
    };
    
    /**
     * Show a notification about storage status
     * @param {object} options Notification options
     */
    const showNotification = (options) => {
        if (!UI || !UI.showNotification) {
            console.error('UI module not available for notifications');
            return;
        }
        
        UI.showNotification(options.message, options.type, options.duration, options.actions);
    };
    
    /**
     * Show a critical notification about data persistence
     * @param {object} options Notification options
     */
    const showCriticalNotification = (options) => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'critical-notification';
        notification.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2000; background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; border-radius: 8px; padding: 16px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); width: 80%; max-width: 500px; font-size: 16px;';
        
        // Add title
        const title = document.createElement('h3');
        title.style.cssText = 'margin-top: 0; margin-bottom: 8px; font-size: 18px; font-weight: bold;';
        title.textContent = options.title || 'Warning';
        notification.appendChild(title);
        
        // Add message
        const message = document.createElement('p');
        message.style.cssText = 'margin-bottom: 16px;';
        message.textContent = options.message;
        notification.appendChild(message);
        
        // Add action buttons if provided
        if (options.actions && options.actions.length) {
            const actionsContainer = document.createElement('div');
            actionsContainer.style.cssText = 'display: flex; justify-content: flex-end; gap: 8px;';
            
            options.actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.label;
                button.style.cssText = 'padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 14px; font-weight: bold;';
                
                if (action.primary) {
                    button.style.backgroundColor = '#007bff';
                    button.style.color = 'white';
                    button.style.border = 'none';
                } else {
                    button.style.backgroundColor = '#f8f9fa';
                    button.style.color = '#212529';
                    button.style.border = '1px solid #dee2e6';
                }
                
                button.addEventListener('click', () => {
                    if (action.callback) {
                        action.callback();
                    }
                    document.body.removeChild(notification);
                });
                
                actionsContainer.appendChild(button);
            });
            
            notification.appendChild(actionsContainer);
        }
        
        // Add dismiss button if required
        if (options.requireDismissal) {
            const dismissButton = document.createElement('button');
            dismissButton.textContent = 'Dismiss';
            dismissButton.style.cssText = 'position: absolute; top: 10px; right: 10px; background: none; border: none; font-size: 20px; cursor: pointer; color: #721c24;';
            dismissButton.innerHTML = '&times;';
            dismissButton.addEventListener('click', () => {
                document.body.removeChild(notification);
            });
            notification.appendChild(dismissButton);
        }
        
        // Add to document
        document.body.appendChild(notification);
        
        // Auto-remove after duration if specified
        if (options.duration && !options.requireDismissal) {
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, options.duration);
        }
    };
    
    /**
     * Show the storage information modal
     */
    const showStorageInfoModal = () => {
        // Create modal content
        const modalContent = `
        <h2>Data Storage Information</h2>
        <div class="storage-info">
            <p>Your data is currently stored using:</p>
            <div class="storage-method ${currentStatus === 'fileSystem' ? 'active' : ''}">
                <h3>📁 File System Storage</h3>
                <p>Data is saved directly to a file on your device.</p>
                <ul>
                    <li>✅ Data persists even if browser data is cleared</li>
                    <li>✅ Files can be backed up manually</li>
                    <li>✅ Access your data across browser updates</li>
                </ul>
                ${currentStatus === 'fileSystem' ? '<div class="active-badge">Currently Active</div>' : ''}
            </div>
            <div class="storage-method ${currentStatus === 'indexedDB' ? 'active' : ''}">
                <h3>💾 Browser Storage</h3>
                <p>Data is saved in your browser's internal database.</p>
                <ul>
                    <li>✅ Automatic data persistence between sessions</li>
                    <li>⚠️ Data may be lost if browser data is cleared</li>
                    <li>⚠️ Regular exports recommended for backup</li>
                </ul>
                ${currentStatus === 'indexedDB' ? '<div class="active-badge">Currently Active</div>' : ''}
            </div>
        </div>
        ${currentStatus === 'indexedDB' && FileSystemAccess.isSupported() ? 
            `<div class="actions">
                <button id="switchToFileSystem" class="primary-button">Switch to File System Storage</button>
            </div>` : ''
        }
        `;
        
        // Show the modal
        UI.showCustomModal('Data Storage Options', modalContent, (modalBody) => {
            // Add event listener to switch button if present
            const switchButton = modalBody.querySelector('#switchToFileSystem');
            if (switchButton) {
                switchButton.addEventListener('click', () => {
                    showFileSelectionModal();
                });
            }
        });
    };
    
    /**
     * Show the file selection modal
     */
    const showFileSelectionModal = () => {
        // Create modal content
        const modalContent = `
        <h2>Choose File Storage Option</h2>
        <p>Select how you'd like to use file system storage:</p>
        <div class="file-options">
            <button id="openExistingFile" class="file-option">
                <span class="icon">📂</span>
                <span class="label">Open Existing File</span>
                <span class="description">Select an existing JSON file to store your data</span>
            </button>
            <button id="createNewFile" class="file-option">
                <span class="icon">📄</span>
                <span class="label">Create New File</span>
                <span class="description">Create a new JSON file for your trouble ticket data</span>
            </button>
        </div>
        <p class="note">Note: Your browser will ask for permission to access the selected file.</p>
        `;
        
        // Show the modal
        UI.showCustomModal('File Selection', modalContent, (modalBody) => {
            // Add event listeners to buttons
            const openExistingFileBtn = modalBody.querySelector('#openExistingFile');
            if (openExistingFileBtn) {
                openExistingFileBtn.addEventListener('click', async () => {
                    try {
                        // Request file access
                        const fileHandle = await FileSystemAccess.requestOpenFile();
                        
                        if (fileHandle) {
                            // Notify FileManager to load from this file
                            if (typeof FileManager?.onFileHandleSelected === 'function') {
                                FileManager.onFileHandleSelected(fileHandle, 'open');
                            }
                        }
                    } catch (error) {
                        console.error('Error opening file:', error);
                        showNotification({
                            message: 'Error opening file. Please try again.',
                            type: 'error',
                            duration: 5000
                        });
                    }
                });
            }
            
            const createNewFileBtn = modalBody.querySelector('#createNewFile');
            if (createNewFileBtn) {
                createNewFileBtn.addEventListener('click', async () => {
                    try {
                        // Request file save
                        const fileHandle = await FileSystemAccess.requestSaveFile();
                        
                        if (fileHandle) {
                            // Notify FileManager to save to this file
                            if (typeof FileManager?.onFileHandleSelected === 'function') {
                                FileManager.onFileHandleSelected(fileHandle, 'save');
                            }
                        }
                    } catch (error) {
                        console.error('Error creating file:', error);
                        showNotification({
                            message: 'Error creating file. Please try again.',
                            type: 'error',
                            duration: 5000
                        });
                    }
                });
            }
        });
    };
    
    /**
     * Show the API unavailable modal
     */
    const showApiUnavailableModal = () => {
        // Create modal content
        const modalContent = `
        <h2>Advanced File Storage Unavailable</h2>
        <div class="unavailable-info">
            <p>Your browser doesn't support the File System Access API, which is required for direct file storage.</p>
            
            <div class="browser-support">
                <h3>Browser Support</h3>
                <ul>
                    <li>✅ Chrome 86+</li>
                    <li>✅ Edge 86+</li>
                    <li>✅ Opera 72+</li>
                    <li>❌ Firefox (not supported)</li>
                    <li>❌ Safari (not supported)</li>
                </ul>
            </div>
            
            <div class="alternative">
                <h3>Alternative Options</h3>
                <p>Your data is currently stored in your browser's storage. To prevent data loss:</p>
                <ul>
                    <li>Use the Export function regularly to save your data</li>
                    <li>Switch to a supported browser for direct file access</li>
                </ul>
            </div>
        </div>
        <div class="actions">
            <button id="exportDataNow" class="primary-button">Export Data Now</button>
        </div>
        `;
        
        // Show the modal
        UI.showCustomModal('Browser Compatibility', modalContent, (modalBody) => {
            // Add event listener to export button
            const exportBtn = modalBody.querySelector('#exportDataNow');
            if (exportBtn) {
                exportBtn.addEventListener('click', async () => {
                    try {
                        // Export data
                        if (typeof FileManager?.exportData === 'function') {
                            await FileManager.exportData();
                        }
                    } catch (error) {
                        console.error('Error exporting data:', error);
                        showNotification({
                            message: 'Error exporting data. Please try again.',
                            type: 'error',
                            duration: 5000
                        });
                    }
                });
            }
        });
    };
    
    /**
     * Show notification about storage method
     * @param {string} method The storage method being used
     */
    const notifyStorageMethod = (method) => {
        if (method === 'fileSystem') {
            showNotification({
                message: 'Using file system for data storage',
                type: 'success',
                duration: 5000
            });
        } else if (method === 'indexedDB') {
            if (FileSystemAccess.isSupported()) {
                showNotification({
                    message: 'Using browser storage. Click the status indicator to use file system storage instead.',
                    type: 'warning',
                    duration: 8000
                });
            } else {
                showCriticalNotification({
                    title: 'Limited Data Persistence',
                    message: 'Your browser does not support direct file access. Data is stored in your browser only. Please export your data regularly to prevent loss.',
                    type: 'warning',
                    duration: 10000,
                    requireDismissal: true,
                    actions: [
                        {
                            label: 'Learn More',
                            callback: showApiUnavailableModal
                        },
                        {
                            label: 'Export Data Now',
                            callback: () => FileManager.exportData(),
                            primary: true
                        }
                    ]
                });
            }
        }
    };
    
    // Public API
    return {
        initialize,
        updateStatus,
        showNotification,
        showCriticalNotification,
        notifyStorageMethod,
        showStorageInfoModal,
        showFileSelectionModal,
        showApiUnavailableModal
    };
})();

// Initialize the module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    StorageStatusUI.initialize();
});
