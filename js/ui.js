/**
 * UI Module
 * Handles UI interactions and DOM manipulations
 */

const UI = (() => {
    // DOM Elements - Initialize with null and populate in initElements function
    const elements = {
        // Modals
        ticketModal: null,
        ticketDetailsModal: null,
        systemConfigModal: null,
        reportsModal: null,
        adminSettingsModal: null,
        
        // Buttons
        createTicketBtn: null,
        configBtn: null,
        reportsBtn: null,
        adminBtn: null,
        
        // Close buttons
        closeModalBtns: null,
        
        // Ticket form elements
        ticketForm: null,
        modalTitle: null,
        ticketSystemSelect: null,
        cancelTicketBtn: null,
        
        // Ticket details elements
        detailTicketId: null,
        detailTicketStatus: null,
        detailCreatedDate: null,
        detailUpdatedDate: null,
        detailResolvedDate: null,
        resolutionDateContainer: null,
        detailTicketTitle: null,
        detailTicketPriority: null,
        detailTicketSystem: null,
        detailTicketDescription: null,
        detailTicketImpact: null,
        ticketHistoryList: null,
        ticketUpdateText: null,
        submitUpdateBtn: null,
        closeDetailsBtn: null,
        saveTicketChangesBtn: null,
        
        // Ticket list and filters
        ticketList: document.getElementById('ticket-list'),
        statusFilter: document.getElementById('status-filter'),
        priorityFilter: document.getElementById('priority-filter'),
        searchTickets: document.getElementById('search-tickets'),
        
        // System configuration elements
        tabBtns: document.querySelectorAll('.tab-btn'),
        systemList: document.getElementById('system-list'),
        watchstationList: document.getElementById('watchstation-list'),
        circuitList: document.getElementById('circuit-list'),
        addSystemBtn: document.getElementById('add-system-btn'),
        addWatchstationBtn: document.getElementById('add-watchstation-btn'),
        addCircuitBtn: document.getElementById('add-circuit-btn'),
        systemForm: document.getElementById('system-form'),
        watchstationForm: document.getElementById('watchstation-form'),
        circuitForm: document.getElementById('circuit-form'),
        systemFormContainer: document.getElementById('system-form-container'),
        watchstationFormContainer: document.getElementById('watchstation-form-container'),
        circuitFormContainer: document.getElementById('circuit-form-container'),
        systemFormTitle: document.getElementById('system-form-title'),
        watchstationFormTitle: document.getElementById('watchstation-form-title'),
        circuitFormTitle: document.getElementById('circuit-form-title'),
        cancelSystemBtn: document.getElementById('cancel-system'),
        cancelWatchstationBtn: document.getElementById('cancel-watchstation'),
        cancelCircuitBtn: document.getElementById('cancel-circuit'),
        watchstationSystemsList: document.getElementById('watchstation-systems-list'),
        circuitSystemSelect: document.getElementById('circuit-system'),
        
        // Reports elements
        reportType: document.getElementById('report-type'),
        reportDateRange: document.getElementById('report-date-range'),
        customDateContainer: document.getElementById('custom-date-container'),
        reportStartDate: document.getElementById('report-start-date'),
        reportEndDate: document.getElementById('report-end-date'),
        reportFilter: document.getElementById('report-filter'),
        generateReportBtn: document.getElementById('generate-report-btn'),
        reportContainer: document.getElementById('report-container'),
        exportReportBtn: document.getElementById('export-report'),
        closeReportBtn: document.getElementById('close-report'),
        
        // Admin settings elements
        userList: document.getElementById('user-list'),
        addUserBtn: document.getElementById('add-user-btn'),
        userForm: document.getElementById('user-form'),
        userFormContainer: document.getElementById('user-form-container'),
        userFormTitle: document.getElementById('user-form-title'),
        cancelUserBtn: document.getElementById('cancel-user'),
        settingsForm: document.getElementById('settings-form'),
        
        // Stoplight chart
        stoplightChart: document.getElementById('stoplight-chart')
    };

    // Initialize UI event listeners
    const initEventListeners = () => {
        // Modal open buttons
        elements.createTicketBtn.addEventListener('click', () => showModal('ticket'));
        elements.configBtn.addEventListener('click', () => showModal('system-config'));
        elements.reportsBtn.addEventListener('click', () => showModal('reports'));
        elements.adminBtn.addEventListener('click', () => showModal('admin-settings'));
        
        // Modal close buttons
        elements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                hideModal(modal);
            });
        });
        
        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                hideModal(e.target);
            }
        });
        
        // Cancel buttons
        elements.cancelTicketBtn.addEventListener('click', () => hideModal(elements.ticketModal));
        elements.closeDetailsBtn.addEventListener('click', () => hideModal(elements.ticketDetailsModal));
        elements.cancelSystemBtn.addEventListener('click', () => hideSystemForm());
        elements.cancelWatchstationBtn.addEventListener('click', () => hideWatchstationForm());
        elements.cancelCircuitBtn.addEventListener('click', () => hideCircuitForm());
        elements.cancelUserBtn.addEventListener('click', () => hideUserForm());
        elements.closeReportBtn.addEventListener('click', () => hideModal(elements.reportsModal));
        
        // Tab switching
        elements.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabId = e.target.dataset.tab;
                switchTab(tabId, e.target.closest('.modal-content'));
            });
        });
        
        // Custom date range toggle
        elements.reportDateRange.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                elements.customDateContainer.classList.remove('hidden');
            } else {
                elements.customDateContainer.classList.add('hidden');
            }
        });
        
        // Add form buttons
        elements.addSystemBtn.addEventListener('click', () => showSystemForm());
        elements.addWatchstationBtn.addEventListener('click', () => showWatchstationForm());
        elements.addCircuitBtn.addEventListener('click', () => showCircuitForm());
        elements.addUserBtn.addEventListener('click', () => showUserForm());
        
        // Ticket filters
        elements.statusFilter.addEventListener('change', () => TicketUI.applyFilters());
        elements.priorityFilter.addEventListener('change', () => TicketUI.applyFilters());
        elements.searchTickets.addEventListener('input', debounce(() => TicketUI.applyFilters(), 300));
    };

    // Show modal
    const showModal = (modalType) => {
        let modal;
        
        switch (modalType) {
            case 'ticket':
                modal = elements.ticketModal;
                elements.modalTitle.textContent = 'Create New Ticket';
                elements.ticketForm.reset();
                populateSystemsDropdown();
                break;
            case 'ticket-details':
                modal = elements.ticketDetailsModal;
                break;
            case 'system-config':
                modal = elements.systemConfigModal;
                SystemUI.renderSystems();
                // Use an immediately invoked async function to handle the async methods
                (async () => {
                    await SystemUI.renderWatchstations();
                    await SystemUI.renderCircuits();
                })();
                break;
            case 'reports':
                modal = elements.reportsModal;
                break;
            case 'admin-settings':
                modal = elements.adminSettingsModal;
                break;
            case 'knowledge-base-modal':
                modal = document.getElementById('knowledge-base-modal');
                break;
            case 'kb-article-modal':
                modal = document.getElementById('kb-article-modal');
                break;
            default:
                // Check if modalType is a direct element ID
                modal = document.getElementById(modalType);
                if (!modal) {
                    console.error(`Modal not found: ${modalType}`);
                    return;
                }
        }
        
        modal.style.display = 'block';
    };

    // Hide modal
    const hideModal = (modal) => {
        if (modal) {
            modal.style.display = 'none';
        }
    };

    // Switch tabs
    const switchTab = (tabId, container) => {
        // Hide all tab panes
        const tabPanes = container.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Deactivate all tab buttons
        const tabBtns = container.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab pane
        const selectedPane = container.querySelector(`#${tabId}`);
        if (selectedPane) {
            selectedPane.classList.add('active');
        }
        
        // Activate selected tab button
        const selectedBtn = container.querySelector(`.tab-btn[data-tab="${tabId}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    };

    // Populate systems dropdown
    const populateSystemsDropdown = () => {
        const systems = DataStore.getSystems();
        const systemsDropdown = elements.ticketSystemSelect;
        
        // Clear existing options
        systemsDropdown.innerHTML = '';
        
        // Add systems to dropdown
        systems.forEach(system => {
            const option = document.createElement('option');
            option.value = system.id;
            option.textContent = system.name;
            systemsDropdown.appendChild(option);
        });
    };

    // Populate circuit systems dropdown
    const populateCircuitSystemsDropdown = () => {
        const systems = DataStore.getSystems();
        const systemsDropdown = elements.circuitSystemSelect;
        
        // Clear existing options
        systemsDropdown.innerHTML = '';
        
        // Add empty option
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = '-- Select System --';
        systemsDropdown.appendChild(emptyOption);
        
        // Add systems to dropdown
        systems.forEach(system => {
            const option = document.createElement('option');
            option.value = system.id;
            option.textContent = system.name;
            systemsDropdown.appendChild(option);
        });
    };

    // Populate watchstation systems checklist
    const populateWatchstationSystemsChecklist = (selectedSystems = []) => {
        const systems = DataStore.getSystems();
        const systemsList = elements.watchstationSystemsList;
        
        // Clear existing checkboxes
        systemsList.innerHTML = '';
        
        // Add systems to checklist
        systems.forEach(system => {
            const checkboxOption = document.createElement('div');
            checkboxOption.className = 'checkbox-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `system-${system.id}`;
            checkbox.value = system.id;
            checkbox.checked = selectedSystems.includes(system.id);
            
            const label = document.createElement('label');
            label.htmlFor = `system-${system.id}`;
            label.textContent = system.name;
            
            checkboxOption.appendChild(checkbox);
            checkboxOption.appendChild(label);
            systemsList.appendChild(checkboxOption);
        });
    };

    // Show system form
    const showSystemForm = async (systemId = null) => {
        elements.systemFormContainer.classList.remove('hidden');
        elements.systemList.classList.add('hidden');
        elements.addSystemBtn.classList.add('hidden');
        
        if (systemId) {
            // Edit existing system
            try {
                // Use getSystems since it's synchronous and more reliable
                const systems = DataStore.getSystems();
                const system = systems.find(s => s.id === systemId);
                
                if (system) {
                    elements.systemFormTitle.textContent = 'Edit System';
                    document.getElementById('system-name').value = system.name;
                    document.getElementById('system-description').value = system.description || '';
                    document.getElementById('system-category').value = system.category || '';
                    document.getElementById('system-status').value = system.status || 'unknown';
                    elements.systemForm.dataset.systemId = systemId;
                } else {
                    console.error(`System with ID ${systemId} not found`);
                    UI.showNotification(`System with ID ${systemId} not found`, 'error');
                }
            } catch (error) {
                console.error('Error loading system:', error);
                UI.showNotification('Error loading system: ' + error.message, 'error');
            }
        } else {
            // Add new system
            elements.systemFormTitle.textContent = 'Add New System';
            elements.systemForm.reset();
            delete elements.systemForm.dataset.systemId;
        }
    };

    // Hide system form
    const hideSystemForm = () => {
        elements.systemFormContainer.classList.add('hidden');
        elements.systemList.classList.remove('hidden');
        elements.addSystemBtn.classList.remove('hidden');
        elements.systemForm.reset();
    };

    // Show watchstation form
    const showWatchstationForm = (watchstationId = null) => {
        elements.watchstationFormContainer.classList.remove('hidden');
        elements.watchstationList.classList.add('hidden');
        elements.addWatchstationBtn.classList.add('hidden');
        
        // Populate systems checklist
        let selectedSystems = [];
        
        if (watchstationId) {
            // Edit existing watchstation
            const watchstation = DataStore.getWatchstations().find(ws => ws.id === watchstationId);
            if (watchstation) {
                elements.watchstationFormTitle.textContent = 'Edit Watchstation';
                document.getElementById('watchstation-name').value = watchstation.name;
                document.getElementById('watchstation-location').value = watchstation.location;
                selectedSystems = watchstation.systems;
                elements.watchstationForm.dataset.watchstationId = watchstationId;
            }
        } else {
            // Add new watchstation
            elements.watchstationFormTitle.textContent = 'Add New Watchstation';
            elements.watchstationForm.reset();
            delete elements.watchstationForm.dataset.watchstationId;
        }
        
        populateWatchstationSystemsChecklist(selectedSystems);
    };

    // Hide watchstation form
    const hideWatchstationForm = () => {
        elements.watchstationFormContainer.classList.add('hidden');
        elements.watchstationList.classList.remove('hidden');
        elements.addWatchstationBtn.classList.remove('hidden');
        elements.watchstationForm.reset();
    };

    // Show circuit form
    const showCircuitForm = (circuitId = null) => {
        elements.circuitFormContainer.classList.remove('hidden');
        elements.circuitList.classList.add('hidden');
        elements.addCircuitBtn.classList.add('hidden');
        
        // Populate systems dropdown
        populateCircuitSystemsDropdown();
        
        if (circuitId) {
            // Edit existing circuit
            const circuit = DataStore.getCircuits().find(c => c.id === circuitId);
            if (circuit) {
                elements.circuitFormTitle.textContent = 'Edit Circuit';
                document.getElementById('circuit-id').value = circuit.id;
                document.getElementById('circuit-description').value = circuit.description;
                document.getElementById('circuit-designation').value = circuit.designation;
                document.getElementById('circuit-status').value = circuit.status;
                document.getElementById('circuit-system').value = circuit.system || '';
                elements.circuitForm.dataset.circuitId = circuitId;
                document.getElementById('circuit-id').readOnly = true; // Can't change circuit ID when editing
            }
        } else {
            // Add new circuit
            elements.circuitFormTitle.textContent = 'Add New Circuit';
            elements.circuitForm.reset();
            delete elements.circuitForm.dataset.circuitId;
            document.getElementById('circuit-id').readOnly = false;
        }
    };

    // Hide circuit form
    const hideCircuitForm = () => {
        elements.circuitFormContainer.classList.add('hidden');
        elements.circuitList.classList.remove('hidden');
        elements.addCircuitBtn.classList.remove('hidden');
        elements.circuitForm.reset();
    };

    // Show user form
    const showUserForm = (userId = null) => {
        elements.userFormContainer.classList.remove('hidden');
        elements.userList.classList.add('hidden');
        elements.addUserBtn.classList.add('hidden');
        
        if (userId) {
            // Edit existing user
            const user = DataStore.getUsers().find(u => u.id === userId);
            if (user) {
                elements.userFormTitle.textContent = 'Edit User';
                document.getElementById('user-name').value = user.username;
                document.getElementById('user-email').value = user.email;
                document.getElementById('user-password').value = user.password;
                document.getElementById('user-role').value = user.role;
                elements.userForm.dataset.userId = userId;
            }
        } else {
            // Add new user
            elements.userFormTitle.textContent = 'Add New User';
            elements.userForm.reset();
            delete elements.userForm.dataset.userId;
        }
    };

    // Hide user form
    const hideUserForm = () => {
        elements.userFormContainer.classList.add('hidden');
        elements.userList.classList.remove('hidden');
        elements.addUserBtn.classList.remove('hidden');
        elements.userForm.reset();
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Format time duration
    const formatDuration = (milliseconds) => {
        if (!milliseconds) return 'N/A';
        
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days} day${days !== 1 ? 's' : ''} ${hours % 24} hr${hours % 24 !== 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes % 60} min${minutes % 60 !== 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds % 60} sec${seconds % 60 !== 1 ? 's' : ''}`;
        } else {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
    };

    // Debounce function for search input
    const debounce = (func, delay) => {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    };

    // Show notification
    const showNotification = (message, type = 'info') => {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to body
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    };

    // Show a custom modal dialog
    const showCustomModal = (title, content, callback) => {
        // Create modal overlay
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        // Create title
        const modalTitle = document.createElement('h2');
        modalTitle.className = 'modal-title';
        modalTitle.textContent = title;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', () => closeModal());
        
        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        modalBody.innerHTML = content;
        
        // Assemble modal
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        modalContainer.appendChild(modalHeader);
        modalContainer.appendChild(modalBody);
        modalOverlay.appendChild(modalContainer);
        
        // Add modal to document
        document.body.appendChild(modalOverlay);
        
        // Show modal with animation
        setTimeout(() => {
            modalOverlay.classList.add('active');
        }, 10);
        
        // Add click handler to close modal when clicking outside
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Function to close modal
        const closeModal = () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => {
                document.body.removeChild(modalOverlay);
            }, 300);
        };
        
        // Run callback after modal is shown, providing the closeModal function
        if (typeof callback === 'function') {
            setTimeout(() => {
                callback(modalBody);
            }, 100);
        }
        
        // Return close function
        return closeModal;
    };
    
    // Format date and time
    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    };
    
    // Calculate resolution time
    const calculateResolutionTime = (createdAt, resolvedAt) => {
        if (!createdAt || !resolvedAt) return null;
        
        const start = new Date(createdAt).getTime();
        const end = new Date(resolvedAt).getTime();
        
        return end - start;
    };
    
    // Get color for priority
    const getColorForPriority = (priority) => {
        switch (priority) {
            case 'low': return '#28a745';
            case 'medium': return '#ffc107';
            case 'high': return '#fd7e14';
            case 'critical': return '#dc3545';
            default: return '#6c757d';
        }
    };
    
    // Get color for status
    const getColorForStatus = (status) => {
        switch (status) {
            case 'open': return '#007bff';
            case 'in-progress': return '#fd7e14';
            case 'resolved': return '#28a745';
            case 'closed': return '#6c757d';
            default: return '#6c757d';
        }
    };
    
    // Get icon for priority
    const getIconForPriority = (priority) => {
        switch (priority) {
            case 'low': return 'fa-arrow-down';
            case 'medium': return 'fa-minus';
            case 'high': return 'fa-arrow-up';
            case 'critical': return 'fa-exclamation-circle';
            default: return 'fa-question-circle';
        }
    };
    
    // Get icon for status
    const getIconForStatus = (status) => {
        switch (status) {
            case 'open': return 'fa-folder-open';
            case 'in-progress': return 'fa-cogs';
            case 'resolved': return 'fa-check-circle';
            case 'closed': return 'fa-folder';
            default: return 'fa-question-circle';
        }
    };
    
    // Validate ticket
    const validateTicket = (ticket) => {
        // Check required fields
        if (!ticket.title || ticket.title.trim() === '') {
            return { valid: false, message: 'Title is required' };
        }
        if (!ticket.description || ticket.description.trim() === '') {
            return { valid: false, message: 'Description is required' };
        }
        if (!ticket.priority) {
            return { valid: false, message: 'Priority is required' };
        }
        if (!ticket.system) {
            return { valid: false, message: 'System is required' };
        }
        if (!ticket.impact || ticket.impact.trim() === '') {
            return { valid: false, message: 'Impact assessment is required' };
        }
        
        return { valid: true };
    };
    
    // Escape HTML
    const escapeHTML = (str) => {
        return str.replace(/[&<>"']/g, (match) => {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[match];
        });
    };
    
    // Toggle visibility of an element
    const toggleVisibility = (element, show) => {
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    };
    
    // Refresh ticket list
    const refreshTicketList = () => {
        // This is just a proxy for TicketUI.renderTickets()
        if (typeof TicketUI !== 'undefined' && typeof TicketUI.renderTickets === 'function') {
            TicketUI.renderTickets();
        }
    };
    
    // Close ticket modal
    const closeTicketModal = () => {
        hideModal(elements.ticketModal);
    };
    
    // Close ticket details modal
    const closeTicketDetailsModal = () => {
        hideModal(elements.ticketDetailsModal);
    };
    
    // Refresh all UI elements
    const refreshAll = async () => {
        // Refresh ticket list
        if (typeof TicketUI !== 'undefined' && typeof TicketUI.renderTickets === 'function') {
            TicketUI.renderTickets();
        }
        
        // Refresh system status
        if (typeof SystemUI !== 'undefined' && typeof SystemUI.renderSystemStatus === 'function') {
            SystemUI.renderSystemStatus();
        }
        
        // Refresh dashboard
        if (typeof DashboardUI !== 'undefined' && typeof DashboardUI.updateDashboard === 'function') {
            DashboardUI.updateDashboard();
        }
    };
    
    // Clear all notifications
    const clearNotifications = () => {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        });
    };
    
    // Initialize DOM elements
    const initElements = () => {
        // Modals
        elements.ticketModal = document.getElementById('ticket-modal');
        elements.ticketDetailsModal = document.getElementById('ticket-details-modal');
        elements.systemConfigModal = document.getElementById('system-config-modal');
        elements.reportsModal = document.getElementById('reports-modal');
        elements.adminSettingsModal = document.getElementById('admin-settings-modal');
        
        // Buttons
        elements.createTicketBtn = document.getElementById('create-ticket-btn');
        elements.configBtn = document.getElementById('config-btn');
        elements.reportsBtn = document.getElementById('reports-btn');
        elements.adminBtn = document.getElementById('admin-btn');
        
        // Close buttons
        elements.closeModalBtns = document.querySelectorAll('.close-modal');
        
        // Ticket form elements
        elements.ticketForm = document.getElementById('ticket-form');
        elements.modalTitle = document.getElementById('modal-title');
        elements.ticketSystemSelect = document.getElementById('ticket-system');
        elements.cancelTicketBtn = document.getElementById('cancel-ticket');
        
        // Ticket details elements
        elements.detailTicketId = document.getElementById('detail-ticket-id');
        elements.detailTicketStatus = document.getElementById('detail-ticket-status');
        elements.detailCreatedDate = document.getElementById('detail-created-date');
        elements.detailUpdatedDate = document.getElementById('detail-updated-date');
        elements.detailResolvedDate = document.getElementById('detail-resolved-date');
        elements.resolutionDateContainer = document.getElementById('resolution-date-container');
        elements.detailTicketTitle = document.getElementById('detail-ticket-title');
        elements.detailTicketPriority = document.getElementById('detail-ticket-priority');
        elements.detailTicketSystem = document.getElementById('detail-ticket-system');
        elements.detailTicketDescription = document.getElementById('detail-ticket-description');
        elements.detailTicketImpact = document.getElementById('detail-ticket-impact');
        elements.ticketHistoryList = document.getElementById('ticket-history-list');
        elements.ticketUpdateText = document.getElementById('ticket-update-text');
        elements.submitUpdateBtn = document.getElementById('submit-update');
        elements.closeDetailsBtn = document.getElementById('close-details');
        elements.saveTicketChangesBtn = document.getElementById('save-ticket-changes');
        
        console.log('UI elements initialized');
    };
    
    // Public API
    return {
        elements,
        initElements,
        initEventListeners,
        showModal,
        hideModal,
        showCustomModal,
        closeModal: (modal) => hideModal(modal),
        switchTab,
        populateSystemsDropdown,
        populateCircuitSystemsDropdown,
        populateWatchstationSystemsChecklist,
        showSystemForm,
        hideSystemForm,
        showWatchstationForm,
        hideWatchstationForm,
        showCircuitForm,
        hideCircuitForm,
        showUserForm,
        hideUserForm,
        formatDate,
        formatDateTime,
        formatDuration,
        calculateResolutionTime,
        getColorForPriority,
        getColorForStatus,
        getIconForPriority,
        getIconForStatus,
        validateTicket,
        escapeHTML,
        toggleVisibility,
        refreshTicketList,
        refreshAll,
        closeTicketModal,
        closeTicketDetailsModal,
        showNotification,
        clearNotifications
    };
})();

// Initialize UI when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize DOM elements first
    UI.initElements();
    
    // Then set up event listeners
    UI.initEventListeners();
});
