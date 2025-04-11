/**
 * Reset Script
 * Clears localStorage and reloads the page to reset the application state
 */

// Function to reset the application
function resetApplication() {
    try {
        console.log('Resetting application data...');
        
        // Clear localStorage
        localStorage.removeItem('ticketSystemData');
        localStorage.removeItem('ticketSystemArchived');
        console.log('localStorage cleared');
        
        // Use FileManager to reset data
        FileManager.resetData();
        console.log('Default data loaded');
        
        // Update UI
        SystemUI.renderSystemStatus();
        console.log('System status updated');
        
        // Show notification
        UI.showNotification('Application data has been reset', 'success');
        
        // Reload the page after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error resetting application data:', error);
        UI.showNotification('Error resetting application data', 'error');
    }
    
    return false; // Prevent form submission
}

// Add reset button to the page
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Application Data';
        resetButton.className = 'secondary-btn';
        resetButton.style.position = 'fixed';
        resetButton.style.bottom = '10px';
        resetButton.style.left = '10px';
        resetButton.style.zIndex = '1000';
        
        // Add click event
        resetButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the application? This will clear all tickets and custom settings.')) {
                resetApplication();
            }
        });
        
        // Add to body
        document.body.appendChild(resetButton);
        
        // Add debug info
        console.log('Reset button added to page');
        
        // Get systems and settings
        const systems = DataStore.getSystems();
        const settings = DataStore.getSettingsSync();
        
        console.log('Current systems count:', systems.length);
        console.log('Max systems setting:', settings.maxSystems);
    } catch (error) {
        console.error('Error initializing reset button:', error);
    }
});
