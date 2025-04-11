/**
 * Systems Module
 * Handles system-related functionality
 */

const SystemUI = (() => {
    // Initialize system event listeners
    const initEventListeners = () => {
        // System form submission
        document.getElementById('system-form').addEventListener('submit', handleSystemFormSubmit);
        
        // Watchstation form submission
        document.getElementById('watchstation-form').addEventListener('submit', handleWatchstationFormSubmit);
        
        // Circuit form submission
        document.getElementById('circuit-form').addEventListener('submit', handleCircuitFormSubmit);
    };

    // Handle system form submission
    const handleSystemFormSubmit = (e) => {
        e.preventDefault();
        
        const systemForm = e.target;
        const systemId = systemForm.dataset.systemId;
        
        // Get form data
        const systemData = {
            name: document.getElementById('system-name').value,
            description: document.getElementById('system-description').value,
            category: document.getElementById('system-category').value,
            status: document.getElementById('system-status').value
        };
        
        if (systemId) {
            // Update existing system
            DataStore.updateSystem(systemId, systemData);
            UI.showNotification('System updated successfully', 'success');
        } else {
            // Create new system
            DataStore.createSystem(systemData);
            UI.showNotification('System created successfully', 'success');
        }
        
        // Update UI
            renderSystems();
            renderSystemStatus();
            DashboardUI.updateDashboard();
        UI.hideSystemForm();
    };

    // Handle watchstation form submission
    const handleWatchstationFormSubmit = async (e) => {
        e.preventDefault();
        
        const watchstationForm = e.target;
        const watchstationId = watchstationForm.dataset.watchstationId;
        
        // Get form data
        const watchstationData = {
            name: document.getElementById('watchstation-name').value,
            location: document.getElementById('watchstation-location').value,
            systems: []
        };
        
        // Get selected systems
        const systemCheckboxes = document.querySelectorAll('#watchstation-systems-list input[type="checkbox"]:checked');
        systemCheckboxes.forEach(checkbox => {
            watchstationData.systems.push(checkbox.value);
        });
        
        try {
            if (watchstationId) {
                // Update existing watchstation
                await DataStore.updateWatchstation(watchstationId, watchstationData);
                UI.showNotification('Watchstation updated successfully', 'success');
            } else {
                // Create new watchstation
                await DataStore.createWatchstation(watchstationData);
                UI.showNotification('Watchstation created successfully', 'success');
            }
            
            // Update UI
            await renderWatchstations();
            UI.hideWatchstationForm();
        } catch (error) {
            console.error('Error handling watchstation form:', error);
            UI.showNotification('Error saving watchstation: ' + error.message, 'error');
        }
    };

    // Handle circuit form submission
    const handleCircuitFormSubmit = async (e) => {
        e.preventDefault();
        
        const circuitForm = e.target;
        const circuitId = circuitForm.dataset.circuitId;
        
        // Get form data
        const circuitData = {
            id: document.getElementById('circuit-id').value,
            description: document.getElementById('circuit-description').value,
            designation: document.getElementById('circuit-designation').value,
            status: document.getElementById('circuit-status').value,
            system: document.getElementById('circuit-system').value || null
        };
        
        try {
            if (circuitId) {
                // Update existing circuit
                await DataStore.updateCircuit(circuitId, circuitData);
                UI.showNotification('Circuit updated successfully', 'success');
            } else {
                // Create new circuit
                await DataStore.createCircuit(circuitData);
                UI.showNotification('Circuit created successfully', 'success');
            }
            
            // Update UI
            await renderCircuits();
            UI.hideCircuitForm();
        } catch (error) {
            console.error('Error handling circuit form:', error);
            UI.showNotification('Error saving circuit: ' + error.message, 'error');
        }
    };

    // Render systems
    const renderSystems = () => {
        const systemList = UI.elements.systemList;
        
        // Clear existing systems
        systemList.innerHTML = '';
        
        // Get systems
        const systems = DataStore.getSystems();
        
        // Check if no systems
        if (systems.length === 0) {
            const noSystems = document.createElement('div');
            noSystems.className = 'no-systems';
            noSystems.textContent = 'No systems found';
            systemList.appendChild(noSystems);
            return;
        }
        
        // Render each system
        systems.forEach(system => {
            const systemItem = createSystemElement(system);
            systemList.appendChild(systemItem);
        });
    };

    // Create system element
    const createSystemElement = (system) => {
        const systemItem = document.createElement('div');
        systemItem.className = 'system-item';
        systemItem.dataset.id = system.id;
        
        const systemInfo = document.createElement('div');
        systemInfo.className = 'system-item-info';
        
        const systemName = document.createElement('div');
        systemName.className = 'system-item-name';
        systemName.textContent = system.name;
        
        const systemDescription = document.createElement('div');
        systemDescription.className = 'system-item-description';
        systemDescription.textContent = system.description;
        
        systemInfo.appendChild(systemName);
        systemInfo.appendChild(systemDescription);
        
        const systemActions = document.createElement('div');
        systemActions.className = 'system-item-actions';
        
        const editBtn = document.createElement('i');
        editBtn.className = 'fas fa-edit action-icon';
        editBtn.title = 'Edit System';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.showSystemForm(system.id);
        });
        
        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'fas fa-trash-alt action-icon';
        deleteBtn.title = 'Delete System';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete ${system.name}?`)) {
                DataStore.deleteSystem(system.id);
                renderSystems();
                renderSystemStatus();
                DashboardUI.updateDashboard();
                UI.showNotification('System deleted successfully', 'success');
            }
        });
        
        systemActions.appendChild(editBtn);
        systemActions.appendChild(deleteBtn);
        
        systemItem.appendChild(systemInfo);
        systemItem.appendChild(systemActions);
        
        return systemItem;
    };

    // Render watchstations
    const renderWatchstations = async () => {
        const watchstationList = UI.elements.watchstationList;
        
        // Clear existing watchstations
        watchstationList.innerHTML = '';
        
        // Get watchstations
        const watchstations = await DataStore.getWatchstations() || [];
        
        // Check if no watchstations
        if (watchstations.length === 0) {
            const noWatchstations = document.createElement('div');
            noWatchstations.className = 'no-watchstations';
            noWatchstations.textContent = 'No watchstations found';
            watchstationList.appendChild(noWatchstations);
            return;
        }
        
        // Render each watchstation
        watchstations.forEach(watchstation => {
            const watchstationItem = createWatchstationElement(watchstation);
            watchstationList.appendChild(watchstationItem);
        });
    };

    // Create watchstation element
    const createWatchstationElement = (watchstation) => {
        const watchstationItem = document.createElement('div');
        watchstationItem.className = 'watchstation-item';
        watchstationItem.dataset.id = watchstation.id;
        
        const watchstationInfo = document.createElement('div');
        watchstationInfo.className = 'watchstation-item-info';
        
        const watchstationName = document.createElement('div');
        watchstationName.className = 'watchstation-item-name';
        watchstationName.textContent = watchstation.name;
        
        const watchstationLocation = document.createElement('div');
        watchstationLocation.className = 'watchstation-item-location';
        watchstationLocation.textContent = watchstation.location || 'No location specified';
        
        watchstationInfo.appendChild(watchstationName);
        watchstationInfo.appendChild(watchstationLocation);
        
        const watchstationActions = document.createElement('div');
        watchstationActions.className = 'watchstation-item-actions';
        
        const editBtn = document.createElement('i');
        editBtn.className = 'fas fa-edit action-icon';
        editBtn.title = 'Edit Watchstation';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.showWatchstationForm(watchstation.id);
        });
        
        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'fas fa-trash-alt action-icon';
        deleteBtn.title = 'Delete Watchstation';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete ${watchstation.name}?`)) {
                DataStore.deleteWatchstation(watchstation.id);
                renderWatchstations();
                UI.showNotification('Watchstation deleted successfully', 'success');
            }
        });
        
        watchstationActions.appendChild(editBtn);
        watchstationActions.appendChild(deleteBtn);
        
        watchstationItem.appendChild(watchstationInfo);
        watchstationItem.appendChild(watchstationActions);
        
        return watchstationItem;
    };

    // Render circuits
    const renderCircuits = async () => {
        const circuitList = UI.elements.circuitList;
        
        // Clear existing circuits
        circuitList.innerHTML = '';
        
        // Get circuits
        const circuits = await DataStore.getCircuits() || [];
        
        // Check if no circuits
        if (circuits.length === 0) {
            const noCircuits = document.createElement('div');
            noCircuits.className = 'no-circuits';
            noCircuits.textContent = 'No circuits found';
            circuitList.appendChild(noCircuits);
            return;
        }
        
        // Render each circuit
        circuits.forEach(circuit => {
            const circuitItem = createCircuitElement(circuit);
            circuitList.appendChild(circuitItem);
        });
    };

    // Create circuit element
    const createCircuitElement = (circuit) => {
        const circuitItem = document.createElement('div');
        circuitItem.className = 'circuit-item';
        circuitItem.dataset.id = circuit.id;
        
        const circuitInfo = document.createElement('div');
        circuitInfo.className = 'circuit-item-info';
        
        const circuitId = document.createElement('div');
        circuitId.className = 'circuit-item-id';
        circuitId.textContent = circuit.id;
        
        const circuitDesignation = document.createElement('div');
        circuitDesignation.className = 'circuit-item-designation';
        circuitDesignation.textContent = circuit.designation || 'No designation specified';
        
        circuitInfo.appendChild(circuitId);
        circuitInfo.appendChild(circuitDesignation);
        
        const circuitActions = document.createElement('div');
        circuitActions.className = 'circuit-item-actions';
        
        const editBtn = document.createElement('i');
        editBtn.className = 'fas fa-edit action-icon';
        editBtn.title = 'Edit Circuit';
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            UI.showCircuitForm(circuit.id);
        });
        
        const deleteBtn = document.createElement('i');
        deleteBtn.className = 'fas fa-trash-alt action-icon';
        deleteBtn.title = 'Delete Circuit';
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`Are you sure you want to delete circuit ${circuit.id}?`)) {
                DataStore.deleteCircuit(circuit.id);
                renderCircuits();
                UI.showNotification('Circuit deleted successfully', 'success');
            }
        });
        
        circuitActions.appendChild(editBtn);
        circuitActions.appendChild(deleteBtn);
        
        circuitItem.appendChild(circuitInfo);
        circuitItem.appendChild(circuitActions);
        
        return circuitItem;
    };

    // Render system status (stoplight chart)
    const renderSystemStatus = () => {
        const stoplightChart = UI.elements.stoplightChart;
        
        // Clear existing system cards
        stoplightChart.innerHTML = '';
        
        // Get systems
        const systems = DataStore.getSystems();
        
        // Log system count
        console.log(`Total systems: ${systems.length}`);
        
        // Add a message if no systems
        if (systems.length === 0) {
            const noSystems = document.createElement('div');
            noSystems.textContent = 'No systems found';
            noSystems.style.padding = '20px';
            noSystems.style.textAlign = 'center';
            stoplightChart.appendChild(noSystems);
            return;
        }
        
        // Group systems by category
        const systemsByCategory = {};
        
        // Add systems to categories
        systems.forEach(system => {
            const category = system.category || 'Uncategorized';
            if (!systemsByCategory[category]) {
                systemsByCategory[category] = [];
            }
            systemsByCategory[category].push(system);
        });
        
        // Sort categories alphabetically
        const sortedCategories = Object.keys(systemsByCategory).sort();
        
        // Render each category
        sortedCategories.forEach(category => {
            // Create category container
            const categoryContainer = document.createElement('div');
            categoryContainer.className = 'system-category';
            
            // Create category header
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category;
            categoryContainer.appendChild(categoryHeader);
            
            // Create systems container
            const systemsContainer = document.createElement('div');
            systemsContainer.className = 'category-systems';
            
            // Add systems to category
            systemsByCategory[category].forEach(system => {
                const systemCard = createSystemCard(system);
                systemsContainer.appendChild(systemCard);
            });
            
            categoryContainer.appendChild(systemsContainer);
            stoplightChart.appendChild(categoryContainer);
        });
        
        // Log completion
        console.log(`Rendered ${systems.length} system cards in ${sortedCategories.length} categories`);
    };

    // Create system card for stoplight chart
    const createSystemCard = (system) => {
        const systemCard = document.createElement('div');
        systemCard.className = 'system-card';
        systemCard.dataset.id = system.id;
        
        const systemName = document.createElement('div');
        systemName.className = 'system-name';
        systemName.textContent = system.name;
        
        const systemStatus = document.createElement('div');
        systemStatus.className = 'system-status';
        
        const statusIndicator = document.createElement('span');
        statusIndicator.className = `status-indicator ${getStatusColorClass(system.status)}`;
        
        systemStatus.appendChild(statusIndicator);
        systemStatus.appendChild(document.createTextNode(formatStatus(system.status)));
        
        systemCard.appendChild(systemName);
        systemCard.appendChild(systemStatus);
        
        // Add click event to show system details or edit
        systemCard.addEventListener('click', async () => {
            UI.showModal('system-config');
            UI.switchTab('systems-tab', UI.elements.systemConfigModal.querySelector('.modal-content'));
            try {
                await UI.showSystemForm(system.id);
            } catch (error) {
                console.error('Error showing system form:', error);
                UI.showNotification('Error loading system details: ' + error.message, 'error');
            }
        });
        
        return systemCard;
    };

    // Get status color class
    const getStatusColorClass = (status) => {
        switch (status) {
            case 'operational':
                return 'green';
            case 'degraded':
                return 'yellow';
            case 'down':
                return 'red';
            default:
                return 'gray';
        }
    };

    // Format status
    const formatStatus = (status) => {
        switch (status) {
            case 'operational':
                return 'Operational';
            case 'degraded':
                return 'Degraded';
            case 'down':
                return 'Down';
            case 'unknown':
                return 'Unknown';
            default:
                return status;
        }
    };

    // Public API
    return {
        initEventListeners,
        renderSystems,
        renderWatchstations,
        renderCircuits,
        renderSystemStatus
    };
})();

// Initialize system module when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    SystemUI.initEventListeners();
    SystemUI.renderSystems();
    await SystemUI.renderWatchstations();
    await SystemUI.renderCircuits();
    SystemUI.renderSystemStatus();
});
