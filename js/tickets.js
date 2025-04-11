/**
 * Ticket Module
 * Handles ticket-related functionality
 */

const TicketUI = (() => {
    // Current ticket ID for context
    let currentTicketId = null;
    // Current view mode: 'active' or 'archived'
    let currentViewMode = 'active';
    
    // Initialize ticket event listeners
    const initEventListeners = () => {
        // Ticket form submission
        UI.elements.ticketForm.addEventListener('submit', handleTicketFormSubmit);
        
        // Ticket details events
        UI.elements.submitUpdateBtn.addEventListener('click', handleTicketUpdate);
        UI.elements.saveTicketChangesBtn.addEventListener('click', handleTicketChanges);
        UI.elements.detailTicketStatus.addEventListener('change', handleStatusChange);
        
        // Archive functionality
        document.getElementById('archive-ticket-btn').addEventListener('click', handleArchiveTicket);
        document.getElementById('view-archives-btn').addEventListener('click', toggleArchiveView);
        document.getElementById('view-active-btn').addEventListener('click', toggleActiveView);
        document.getElementById('auto-archive-btn').addEventListener('click', handleAutoArchive);
        
        // Include archived tickets in search
        const includeArchivedCheckbox = document.getElementById('include-archived');
        if (includeArchivedCheckbox) {
            includeArchivedCheckbox.addEventListener('change', applyFilters);
        }
    };

    // Handle ticket form submission
    const handleTicketFormSubmit = (e) => {
        e.preventDefault();
        
        console.log('Submitting ticket form...');
        
        // Check if all required form elements exist
        const titleElement = document.getElementById('ticket-title');
        const descriptionElement = document.getElementById('ticket-description');
        const systemElement = document.getElementById('ticket-system');
        const impactElement = document.getElementById('ticket-impact');
        const areaSupervisorElement = document.getElementById('ticket-area-supervisor');
        
        console.log('Form elements:', {
            titleElement,
            descriptionElement,
            systemElement,
            areaSupervisorElement,
            impactElement
        });
        
        if (!titleElement || !descriptionElement || !systemElement || !impactElement || !areaSupervisorElement) {
            console.error('Missing form elements!');
            UI.showNotification('Error: Missing form elements', 'error');
            return;
        }
        
        // Get form data
        const ticketData = {
            title: titleElement.value,
            description: descriptionElement.value,
            priority: 'medium', // Default priority since field was removed
            system: systemElement.value || 'sys1', // Default to first system if not selected
            areaSupervisor: areaSupervisorElement ? areaSupervisorElement.value : 'Unassigned',
            impact: impactElement.value || 'No impact assessment provided'
        };
        
        console.log('Ticket data:', ticketData);
        
        try {
            // Create ticket
            const newTicket = DataStore.createTicket(ticketData);
            console.log('New ticket created:', newTicket);
            
            // Get all tickets to verify
            const allTickets = DataStore.getTickets();
            console.log('All tickets after creation:', allTickets);
            
            // Update UI
            renderTickets();
            SystemUI.renderSystemStatus();
            DashboardUI.updateDashboard();
            
            // Close modal and show notification
            UI.hideModal(UI.elements.ticketModal);
            UI.showNotification('Ticket created successfully', 'success');
        } catch (error) {
            console.error('Error creating ticket:', error);
            UI.showNotification('Error creating ticket: ' + error.message, 'error');
        }
    };

    // Handle ticket update
    const handleTicketUpdate = () => {
        const ticketId = UI.elements.detailTicketId.textContent;
        const updateText = UI.elements.ticketUpdateText.value.trim();
        const currentUser = document.getElementById('current-user').textContent || 'System';
        
        if (!updateText) {
            UI.showNotification('Please enter update details', 'error');
            return;
        }
        
        // Add history entry with user information
        const historyEntry = {
            action: 'Update Added',
            timestamp: new Date().toISOString(),
            details: updateText,
            user: currentUser
        };
        
        // Use custom history entry
        DataStore.addTicketHistoryWithUser(ticketId, historyEntry);
        
        // Clear update text
        UI.elements.ticketUpdateText.value = '';
        
        // Refresh ticket details
        showTicketDetails(ticketId);
        
        UI.showNotification('Update added successfully', 'success');
    };

    // Handle ticket changes
    const handleTicketChanges = () => {
        const ticketId = UI.elements.detailTicketId.textContent;
        const newStatus = UI.elements.detailTicketStatus.value;
        
        // Update ticket
        DataStore.updateTicket(ticketId, { status: newStatus });
        
        // Add history entry
        DataStore.addTicketHistory(ticketId, 'Status Changed', `Status changed to ${newStatus}`);
        
        // Refresh ticket details, list, and dashboard
        showTicketDetails(ticketId);
        renderTickets();
        DashboardUI.updateDashboard();
        
        UI.showNotification('Ticket updated successfully', 'success');
    };

    // Handle status change
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        const resolutionDateContainer = UI.elements.resolutionDateContainer;
        
        // Show/hide resolution date based on status
        if (newStatus === 'resolved') {
            resolutionDateContainer.style.display = 'block';
            UI.elements.detailResolvedDate.textContent = UI.formatDate(new Date().toISOString());
        } else {
            resolutionDateContainer.style.display = 'none';
        }
    };

    // Render tickets
    const renderTickets = async () => {
        const ticketList = UI.elements.ticketList;
        
        // Clear existing tickets
        ticketList.innerHTML = '';
        
        // Get filtered tickets
        const filters = {
            status: UI.elements.statusFilter.value,
            search: UI.elements.searchTickets.value
        };
        
        console.log("Fetching tickets with filters:", filters);
        const tickets = await DataStore.filterTickets(filters);
        console.log("Retrieved tickets:", tickets);
        
        // Check if no tickets
        if (tickets.length === 0) {
            const noTickets = document.createElement('div');
            noTickets.className = 'no-tickets';
            noTickets.textContent = 'No tickets found';
            ticketList.appendChild(noTickets);
            return;
        }
        
        // Render each ticket
        tickets.forEach(ticket => {
            const ticketItem = createTicketElement(ticket);
            ticketList.appendChild(ticketItem);
        });
    };

    // Create ticket element
    const createTicketElement = (ticket) => {
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item';
        ticketItem.dataset.id = ticket.id;
        
        // Add click event to show ticket details
        ticketItem.addEventListener('click', () => showTicketDetails(ticket.id));
        
        // Create ticket title (moved before header with ID)
        const ticketTitle = document.createElement('div');
        ticketTitle.className = 'ticket-title';
        ticketTitle.textContent = ticket.title;
        
        // Create ticket header
        const ticketHeader = document.createElement('div');
        ticketHeader.className = 'ticket-item-header';
        
        const ticketId = document.createElement('div');
        ticketId.className = 'ticket-id';
        ticketId.textContent = ticket.id;
        
        const ticketStatus = document.createElement('div');
        ticketStatus.className = `ticket-status status-${ticket.status}`;
        ticketStatus.textContent = formatStatus(ticket.status);
        
        ticketHeader.appendChild(ticketId);
        ticketHeader.appendChild(ticketStatus);
        
        // Create ticket meta
        const ticketMeta = document.createElement('div');
        ticketMeta.className = 'ticket-meta';
        
        const ticketPriority = document.createElement('div');
        ticketPriority.className = 'ticket-priority';
        
        const priorityIndicator = document.createElement('span');
        priorityIndicator.className = `priority-indicator priority-${ticket.priority}`;
        
        ticketPriority.appendChild(priorityIndicator);
        ticketPriority.appendChild(document.createTextNode(formatPriority(ticket.priority)));
        
        const ticketDate = document.createElement('div');
        ticketDate.className = 'ticket-date';
        ticketDate.textContent = UI.formatDate(ticket.createdAt);
        
        ticketMeta.appendChild(ticketPriority);
        ticketMeta.appendChild(ticketDate);
        
        // Assemble ticket item
        ticketItem.appendChild(ticketTitle);
        ticketItem.appendChild(ticketHeader);
        ticketItem.appendChild(ticketMeta);
        
        return ticketItem;
    };

    // Show ticket details
    const showTicketDetails = async (ticketId) => {
        console.log(`Showing details for ticket: ${ticketId}`);
        try {
            const ticket = await DataStore.getTicketById(ticketId);
            
            if (!ticket) {
                console.error(`Ticket not found: ${ticketId}`);
                UI.showNotification('Ticket not found', 'error');
                return;
            }
            
            console.log(`Ticket data retrieved:`, ticket);
            
            // Store current ticket ID
            currentTicketId = ticketId;
            
            try {
                // Check if UI elements exist before using them
                const modalTitleElement = document.getElementById('details-modal-title');
                if (!modalTitleElement) {
                    console.error('Modal title element not found');
                    throw new Error('Modal title element not found');
                }
                modalTitleElement.textContent = `Ticket Details: ${ticket.id}`;
                
                // Check each UI element before using it
                if (!UI.elements.detailTicketId) {
                    console.error('detailTicketId element not found');
                    throw new Error('detailTicketId element not found');
                }
                UI.elements.detailTicketId.textContent = ticket.id;
                
                if (!UI.elements.detailTicketStatus) {
                    console.error('detailTicketStatus element not found');
                    throw new Error('detailTicketStatus element not found');
                }
                UI.elements.detailTicketStatus.value = ticket.status;
                
                if (!UI.elements.detailCreatedDate) {
                    console.error('detailCreatedDate element not found');
                    throw new Error('detailCreatedDate element not found');
                }
                UI.elements.detailCreatedDate.textContent = UI.formatDate(ticket.createdAt);
                
                if (!UI.elements.detailUpdatedDate) {
                    console.error('detailUpdatedDate element not found');
                    throw new Error('detailUpdatedDate element not found');
                }
                UI.elements.detailUpdatedDate.textContent = UI.formatDate(ticket.updatedAt);
                
                // Show/hide resolution date based on status
                if (UI.elements.resolutionDateContainer) {
                    if (ticket.status === 'resolved' || ticket.status === 'closed') {
                        UI.elements.resolutionDateContainer.style.display = 'block';
                        if (UI.elements.detailResolvedDate) {
                            UI.elements.detailResolvedDate.textContent = UI.formatDate(ticket.resolvedAt);
                        }
                    } else {
                        UI.elements.resolutionDateContainer.style.display = 'none';
                    }
                }
                
                if (!UI.elements.detailTicketTitle) {
                    console.error('detailTicketTitle element not found');
                    throw new Error('detailTicketTitle element not found');
                }
                UI.elements.detailTicketTitle.textContent = ticket.title;
                
                if (UI.elements.detailTicketPriority) {
                    UI.elements.detailTicketPriority.textContent = formatPriority(ticket.priority);
                    UI.elements.detailTicketPriority.className = `priority-${ticket.priority}`;
                }
                
                // Get system name
                if (UI.elements.detailTicketSystem) {
                    const system = await DataStore.getSystemById(ticket.system);
                    UI.elements.detailTicketSystem.textContent = system ? system.name : 'Unknown System';
                }
                
                // Set area supervisor
                const supervisorElement = document.getElementById('detail-ticket-supervisor');
                if (supervisorElement) {
                    supervisorElement.textContent = ticket.areaSupervisor || 'Unassigned';
                } else {
                    console.warn('Supervisor element not found in DOM');
                }
                
                if (UI.elements.detailTicketDescription) {
                    UI.elements.detailTicketDescription.textContent = ticket.description;
                }
                
                if (UI.elements.detailTicketImpact) {
                    UI.elements.detailTicketImpact.textContent = ticket.impact;
                }
                
                // Render ticket history if the element exists
                if (UI.elements.ticketHistoryList) {
                    renderTicketHistory(ticket.history);
                }
                
                // Clear update text if the element exists
                if (UI.elements.ticketUpdateText) {
                    UI.elements.ticketUpdateText.value = '';
                }
                
                try {
                    // Load Knowledge Base recommendations
                    if (typeof loadKnowledgeBaseRecommendations === 'function') {
                        await loadKnowledgeBaseRecommendations(ticketId);
                    }
                    
                    // Add conversion suggestion if applicable
                    if (typeof addKnowledgeBaseConversionSuggestion === 'function') {
                        await addKnowledgeBaseConversionSuggestion(ticketId);
                    }
                } catch (error) {
                    console.error('Error loading knowledge base data:', error);
                }
                
                // Show modal
                console.log('Opening ticket details modal');
                UI.showModal('ticket-details-modal');
            } catch (error) {
                console.error('Error setting ticket details:', error);
                throw new Error(`Failed to set ticket details: ${error.message}`);
            }
        } catch (error) {
            console.error('Error showing ticket details:', error);
            UI.showNotification('Error showing ticket details: ' + error.message, 'error');
        }
    };
    
    // Load knowledge base recommendations
    const loadKnowledgeBaseRecommendations = async (ticketId) => {
        const recommendationsContainer = document.getElementById('kb-recommendations');
        recommendationsContainer.innerHTML = '';
        
        try {
            // Check if KnowledgeBaseUI is available (it should be)
            if (typeof KnowledgeBaseUI !== 'undefined' && KnowledgeBaseUI.renderSuggestions) {
                await KnowledgeBaseUI.renderSuggestions(ticketId, recommendationsContainer);
            }
        } catch (error) {
            console.error('Error loading knowledge base recommendations:', error);
            recommendationsContainer.innerHTML = '<p>Error loading knowledge base recommendations</p>';
        }
    };
    
    // Add knowledge base conversion suggestion
    const addKnowledgeBaseConversionSuggestion = async (ticketId) => {
        const conversionContainer = document.getElementById('kb-conversion-container');
        if (!conversionContainer) {
            console.error('Conversion container element not found');
            return;
        }
        
        conversionContainer.innerHTML = '';
        
        try {
            const ticket = await DataStore.getTicketById(ticketId);
            
            // Only suggest conversion for resolved tickets with detailed history
            if (!ticket || ticket.status !== 'resolved' || ticket.history.length < 3) {
                return;
            }
            
            // Create suggestion directly instead of relying on KnowledgeBaseUI
            const suggestion = document.createElement('div');
            suggestion.className = 'kb-conversion-suggestion';
            
            const suggestionText = document.createElement('p');
            suggestionText.textContent = 'This resolved ticket contains valuable information. Would you like to convert it to a knowledge base article?';
            
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'secondary-btn';
            suggestionBtn.textContent = 'Convert to Article';
            
            // Add direct click handler
            suggestionBtn.addEventListener('click', async () => {
                console.log('Convert to article button clicked for ticket:', ticketId);
                
                try {
                    // Check if KnowledgeBaseData is available
                    if (typeof KnowledgeBaseData !== 'undefined' && typeof KnowledgeBaseData.createArticleFromTicket === 'function') {
                        // Create article from ticket
                        const newArticle = await KnowledgeBaseData.createArticleFromTicket(ticketId);
                        
                        if (newArticle) {
                            // Close ticket details modal
                            UI.hideModal('ticket-details-modal');
                            
                            // Show success notification
                            UI.showNotification(`Knowledge base article ${newArticle.id} created successfully`, 'success');
                            
                            // Open knowledge base modal if KnowledgeBaseUI is available
                            if (typeof KnowledgeBaseUI !== 'undefined' && typeof KnowledgeBaseUI.showArticleDetails === 'function') {
                                // Open knowledge base modal
                                UI.showModal('knowledge-base-modal');
                                
                                // Show the new article
                                KnowledgeBaseUI.showArticleDetails(newArticle.id);
                            }
                        } else {
                            throw new Error('Failed to create knowledge base article');
                        }
                    } else {
                        throw new Error('Knowledge Base Data module not available');
                    }
                } catch (error) {
                    console.error('Error creating knowledge base article:', error);
                    UI.showNotification('Error creating knowledge base article: ' + error.message, 'error');
                }
            });
            
            suggestion.appendChild(suggestionText);
            suggestion.appendChild(suggestionBtn);
            
            conversionContainer.appendChild(suggestion);
        } catch (error) {
            console.error('Error adding conversion suggestion:', error);
        }
    };

    // Render ticket history
    const renderTicketHistory = (history) => {
        const historyList = UI.elements.ticketHistoryList;
        
        // Clear existing history
        historyList.innerHTML = '';
        
        // Check if no history
        if (history.length === 0) {
            const noHistory = document.createElement('div');
            noHistory.className = 'no-history';
            noHistory.textContent = 'No history entries';
            historyList.appendChild(noHistory);
            return;
        }
        
        // Sort history by timestamp (newest first)
        const sortedHistory = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Render each history entry
        sortedHistory.forEach(entry => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const historyMeta = document.createElement('div');
            historyMeta.className = 'history-meta';
            
            const historyAction = document.createElement('span');
            historyAction.textContent = entry.action;
            
            const historyTime = document.createElement('span');
            historyTime.textContent = UI.formatDate(entry.timestamp);
            
            historyMeta.appendChild(historyAction);
            historyMeta.appendChild(historyTime);
            
            const historyDetails = document.createElement('div');
            historyDetails.textContent = entry.details;
            
            historyItem.appendChild(historyMeta);
            historyItem.appendChild(historyDetails);
            
            historyList.appendChild(historyItem);
        });
    };

    // Handle archive ticket
    const handleArchiveTicket = async () => {
        const ticketId = currentTicketId;
        if (!ticketId) {
            UI.showNotification('No ticket selected', 'error');
            return;
        }
        
        try {
            // Archive the ticket
            await DataStore.archiveTicket(ticketId);
            
            // Close the ticket details modal
            UI.hideModal(UI.elements.ticketDetailsModal);
            
            // Refresh tickets list
            renderTickets();
            
            // Update dashboard
            DashboardUI.updateDashboard();
            
            UI.showNotification(`Ticket ${ticketId} archived successfully`, 'success');
        } catch (error) {
            console.error('Error archiving ticket:', error);
            UI.showNotification('Error archiving ticket: ' + error.message, 'error');
        }
    };
    
    // Handle restore ticket
    const handleRestoreTicket = async (ticketId) => {
        if (!ticketId) {
            return;
        }
        
        try {
            // Restore the ticket
            await DataStore.restoreTicket(ticketId);
            
            // Refresh tickets lists
            renderTickets();
            renderArchivedTickets();
            
            // Update dashboard
            DashboardUI.updateDashboard();
            
            UI.showNotification(`Ticket ${ticketId} restored successfully`, 'success');
        } catch (error) {
            console.error('Error restoring ticket:', error);
            UI.showNotification('Error restoring ticket: ' + error.message, 'error');
        }
    };
    
    // Handle auto-archive
    const handleAutoArchive = async () => {
        try {
            const result = await DataStore.runAutoArchive();
            
            // Refresh tickets lists
            renderTickets();
            
            // Update dashboard
            DashboardUI.updateDashboard();
            
            // Show success message
            UI.showNotification(`Auto-archive complete: ${result.archivedCount} tickets archived`, 'success');
        } catch (error) {
            console.error('Error running auto-archive:', error);
            UI.showNotification('Error running auto-archive: ' + error.message, 'error');
        }
    };
    
    // Toggle archive view
    const toggleArchiveView = async () => {
        currentViewMode = 'archived';
        
        // Update view state UI
        document.getElementById('view-active-btn').classList.remove('active');
        document.getElementById('view-archives-btn').classList.add('active');
        document.getElementById('ticket-view-title').textContent = 'Archived Tickets';
        
        // Show archive-specific controls
        document.getElementById('archive-controls').style.display = 'none';
        document.getElementById('restore-controls').style.display = 'block';
        
        // Render archived tickets
        renderArchivedTickets();
    };
    
    // Toggle active view
    const toggleActiveView = () => {
        currentViewMode = 'active';
        
        // Update view state UI
        document.getElementById('view-archives-btn').classList.remove('active');
        document.getElementById('view-active-btn').classList.add('active');
        document.getElementById('ticket-view-title').textContent = 'Active Tickets';
        
        // Show active-specific controls
        document.getElementById('restore-controls').style.display = 'none';
        document.getElementById('archive-controls').style.display = 'block';
        
        // Render active tickets
        renderTickets();
    };
    
    // Render archived tickets
    const renderArchivedTickets = async () => {
        const ticketList = UI.elements.ticketList;
        
        // Clear existing tickets
        ticketList.innerHTML = '';
        
        try {
            // Get archived tickets
            const archivedTickets = await DataStore.getArchivedTickets();
            
            // Apply any filters
            const filters = {
                status: UI.elements.statusFilter.value,
                priority: UI.elements.priorityFilter.value,
                search: UI.elements.searchTickets.value
            };
            
            let filteredTickets = archivedTickets;
            
            if (filters.status && filters.status !== 'all') {
                filteredTickets = filteredTickets.filter(ticket => ticket.status === filters.status);
            }
            
            if (filters.priority && filters.priority !== 'all') {
                filteredTickets = filteredTickets.filter(ticket => ticket.priority === filters.priority);
            }
            
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredTickets = filteredTickets.filter(ticket => 
                    ticket.id.toLowerCase().includes(searchLower) ||
                    ticket.title.toLowerCase().includes(searchLower) ||
                    ticket.description.toLowerCase().includes(searchLower)
                );
            }
            
            // Check if no tickets
            if (filteredTickets.length === 0) {
                const noTickets = document.createElement('div');
                noTickets.className = 'no-tickets';
                noTickets.textContent = 'No archived tickets found';
                ticketList.appendChild(noTickets);
                return;
            }
            
            // Render each ticket with restore option
            filteredTickets.forEach(ticket => {
                const ticketItem = createArchivedTicketElement(ticket);
                ticketList.appendChild(ticketItem);
            });
        } catch (error) {
            console.error('Error rendering archived tickets:', error);
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Error loading archived tickets';
            ticketList.appendChild(errorElement);
        }
    };
    
    // Create archived ticket element
    const createArchivedTicketElement = (ticket) => {
        const ticketItem = document.createElement('div');
        ticketItem.className = 'ticket-item archived';
        ticketItem.dataset.id = ticket.id;
        
        // Create ticket header
        const ticketHeader = document.createElement('div');
        ticketHeader.className = 'ticket-item-header';
        
        const ticketId = document.createElement('div');
        ticketId.className = 'ticket-id';
        ticketId.textContent = ticket.id;
        
        const ticketStatus = document.createElement('div');
        ticketStatus.className = `ticket-status status-${ticket.status}`;
        ticketStatus.textContent = formatStatus(ticket.status);
        
        ticketHeader.appendChild(ticketId);
        ticketHeader.appendChild(ticketStatus);
        
        // Create ticket title
        const ticketTitle = document.createElement('div');
        ticketTitle.className = 'ticket-title';
        ticketTitle.textContent = ticket.title;
        
        // Create ticket meta
        const ticketMeta = document.createElement('div');
        ticketMeta.className = 'ticket-meta';
        
        const ticketPriority = document.createElement('div');
        ticketPriority.className = 'ticket-priority';
        
        const priorityIndicator = document.createElement('span');
        priorityIndicator.className = `priority-indicator priority-${ticket.priority}`;
        
        ticketPriority.appendChild(priorityIndicator);
        ticketPriority.appendChild(document.createTextNode(formatPriority(ticket.priority)));
        
        const ticketDate = document.createElement('div');
        ticketDate.className = 'ticket-date';
        ticketDate.textContent = UI.formatDate(ticket.createdAt);
        
        // Add resolved date if available
        if (ticket.resolvedAt) {
            const resolvedDate = document.createElement('div');
            resolvedDate.className = 'ticket-resolved-date';
            resolvedDate.textContent = `Resolved: ${UI.formatDate(ticket.resolvedAt)}`;
            ticketMeta.appendChild(resolvedDate);
        }
        
        ticketMeta.appendChild(ticketPriority);
        ticketMeta.appendChild(ticketDate);
        
        // Add restore button
        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'restore-btn';
        restoreBtn.textContent = 'Restore';
        restoreBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent ticket details from opening
            handleRestoreTicket(ticket.id);
        });
        
        // Add button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'ticket-buttons';
        buttonContainer.appendChild(restoreBtn);
        
        // Assemble ticket item
        ticketItem.appendChild(ticketTitle);
        ticketItem.appendChild(ticketHeader);
        ticketItem.appendChild(ticketMeta);
        ticketItem.appendChild(buttonContainer);
        
        return ticketItem;
    };
    
    // Apply filters
    const applyFilters = () => {
        const includeArchivedCheckbox = document.getElementById('include-archived');
        const includeArchived = includeArchivedCheckbox ? includeArchivedCheckbox.checked : false;
        
        // Update filters object
        const filters = {
            status: UI.elements.statusFilter.value,
            priority: UI.elements.priorityFilter.value,
            search: UI.elements.searchTickets.value,
            includeArchived: includeArchived
        };
        
        // If we're in archived view, render archived tickets
        if (currentViewMode === 'archived') {
            renderArchivedTickets();
        } else {
            // Otherwise render active tickets with the includeArchived flag
            renderActiveTicketsWithFilters(filters);
        }
    };
    
    // Render active tickets with filter options
    const renderActiveTicketsWithFilters = async (filters) => {
        const ticketList = UI.elements.ticketList;
        
        // Clear existing tickets
        ticketList.innerHTML = '';
        
        try {
            // Get tickets with filters
            const tickets = await DataStore.filterTickets(filters);
            
            // Check if no tickets
            if (tickets.length === 0) {
                const noTickets = document.createElement('div');
                noTickets.className = 'no-tickets';
                noTickets.textContent = 'No tickets found';
                ticketList.appendChild(noTickets);
                return;
            }
            
            // Render each ticket
            tickets.forEach(ticket => {
                // Check if this is an archived ticket (when includeArchived is true)
                if (ticket.isArchived) {
                    const archivedTicketItem = createArchivedTicketElement(ticket);
                    ticketList.appendChild(archivedTicketItem);
                } else {
                    const ticketItem = createTicketElement(ticket);
                    ticketList.appendChild(ticketItem);
                }
            });
        } catch (error) {
            console.error('Error rendering tickets with filters:', error);
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = 'Error loading tickets';
            ticketList.appendChild(errorElement);
        }
    };

    // Format status
    const formatStatus = (status) => {
        switch (status) {
            case 'open':
                return 'Open';
            case 'in-progress':
                return 'In Progress';
            case 'resolved':
                return 'Resolved';
            case 'closed':
                return 'Closed';
            default:
                return status;
        }
    };

    // Format priority
    const formatPriority = (priority) => {
        switch (priority) {
            case 'low':
                return 'Low';
            case 'medium':
                return 'Medium';
            case 'high':
                return 'High';
            case 'critical':
                return 'Critical';
            default:
                return priority;
        }
    };

    // Public API
    return {
        initEventListeners,
        renderTickets,
        showTicketDetails,
        applyFilters
    };
})();

// Initialize ticket module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TicketUI.initEventListeners();
    TicketUI.renderTickets();
});
