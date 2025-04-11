/**
 * Knowledge Base Module
 * Handles knowledge base-related functionality
 */

const KnowledgeBaseUI = (() => {
    // Current article ID for context
    let currentArticleId = null;
    let markdownRenderer = null;
    
    // DOM element references
    const elements = {
        knowledgeBaseBtn: document.getElementById('knowledge-base-btn'),
        kbModal: document.getElementById('knowledge-base-modal'),
        kbList: document.getElementById('kb-list'),
        kbContent: document.getElementById('kb-content'),
        kbSearchInput: document.getElementById('kb-search-input'),
        kbSearchBtn: document.getElementById('kb-search-btn'),
        kbSystemFilter: document.getElementById('kb-system-filter'),
        kbTagsFilter: document.getElementById('kb-tags-filter'),
        createKbArticleBtn: document.getElementById('create-kb-article-btn'),
        kbArticleModal: document.getElementById('kb-article-modal'),
        kbArticleForm: document.getElementById('kb-article-form'),
        kbArticleTitle: document.getElementById('kb-article-title'),
        kbArticleDescription: document.getElementById('kb-article-description'),
        kbArticleContent: document.getElementById('kb-article-content'),
        kbArticleTags: document.getElementById('kb-article-tags'),
        kbArticleSystems: document.getElementById('kb-article-systems'),
        kbArticleRelatedTickets: document.getElementById('kb-article-related-tickets'),
        cancelKbArticleBtn: document.getElementById('cancel-kb-article')
    };
    
    // Initialize knowledge base module
    const initialize = async () => {
        // Set up event listeners
        initEventListeners();
        
        // Load any existing markdown renderer or use a simple one
        setupMarkdownRenderer();
        
        // Populate system filter
        await populateSystemsDropdown();
        
        // Render articles
        await renderKnowledgeArticles();
    };
    
    // Initialize event listeners
    const initEventListeners = () => {
        // Knowledge base button
        elements.knowledgeBaseBtn.addEventListener('click', () => {
            UI.showModal('knowledge-base-modal');
            renderKnowledgeArticles();
        });
        
        // Search button
        elements.kbSearchBtn.addEventListener('click', handleSearch);
        
        // Search input (enter key)
        elements.kbSearchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
        
        // System filter
        elements.kbSystemFilter.addEventListener('change', handleSearch);
        
        // Tags filter
        elements.kbTagsFilter.addEventListener('input', handleFilterByTags);
        
        // Create article button
        elements.createKbArticleBtn.addEventListener('click', openCreateArticleForm);
        
        // Submit article form
        elements.kbArticleForm.addEventListener('submit', handleArticleSubmit);
        
        // Cancel article button
        elements.cancelKbArticleBtn.addEventListener('click', () => {
            UI.hideModal('kb-article-modal');
        });
    };
    
    // Setup markdown renderer
    const setupMarkdownRenderer = () => {
        // Simple markdown renderer if no library is available
        markdownRenderer = (text) => {
            // Basic implementation
            let html = text;
            
            // Headers
            html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
            html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
            html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
            
            // Bold
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            
            // Italic
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            
            // Lists
            html = html.replace(/^\* (.+)$/gm, '<li>$1</li>');
            html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
            html = html.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
            
            // Code
            html = html.replace(/`(.+?)`/g, '<code>$1</code>');
            
            // Links
            html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
            
            // Paragraphs
            html = html.replace(/\n\n/g, '</p><p>');
            html = '<p>' + html + '</p>';
            
            return html;
        };
    };
    
    // Populate systems dropdown for article form
    const populateSystemsDropdown = async () => {
        const systems = await DataStore.getSystems();
        
        // Update filter dropdown
        const systemFilter = elements.kbSystemFilter;
        systemFilter.innerHTML = '<option value="all">All Systems</option>';
        
        systems.forEach(system => {
            const option = document.createElement('option');
            option.value = system.id;
            option.textContent = system.name;
            systemFilter.appendChild(option);
        });
        
        // Update article form dropdown (multi-select)
        const systemsSelect = elements.kbArticleSystems;
        systemsSelect.innerHTML = '';
        
        systems.forEach(system => {
            const option = document.createElement('option');
            option.value = system.id;
            option.textContent = system.name;
            systemsSelect.appendChild(option);
        });
    };
    
    // Populate tickets dropdown for article form
    const populateTicketsDropdown = async () => {
        const tickets = await DataStore.getTickets();
        
        // Update article form dropdown (multi-select)
        const ticketsSelect = elements.kbArticleRelatedTickets;
        ticketsSelect.innerHTML = '';
        
        // Show only open and in-progress tickets
        const relevantTickets = tickets.filter(ticket => 
            ticket.status === 'open' || ticket.status === 'in-progress'
        );
        
        relevantTickets.forEach(ticket => {
            const option = document.createElement('option');
            option.value = ticket.id;
            option.textContent = `${ticket.id}: ${ticket.title}`;
            ticketsSelect.appendChild(option);
        });
    };
    
    // Render knowledge articles
    const renderKnowledgeArticles = async () => {
        const articles = await DataStore.getKnowledgeArticles();
        
        // Clear article list
        elements.kbList.innerHTML = '';
        
        // Check if no articles
        if (articles.length === 0) {
            const noArticles = document.createElement('div');
            noArticles.className = 'no-articles';
            noArticles.textContent = 'No knowledge base articles found. Create one to get started!';
            elements.kbList.appendChild(noArticles);
            return;
        }
        
        // Render each article
        articles.forEach(article => {
            const articleItem = createArticleListItem(article);
            elements.kbList.appendChild(articleItem);
        });
    };
    
    // Create article list item
    const createArticleListItem = (article) => {
        const articleItem = document.createElement('div');
        articleItem.className = 'kb-list-item';
        articleItem.dataset.id = article.id;
        
        // Add click event to show article details
        articleItem.addEventListener('click', () => showArticleDetails(article.id));
        
        // Create article title
        const articleTitle = document.createElement('div');
        articleTitle.className = 'kb-list-item-title';
        articleTitle.textContent = article.title;
        
        // Create article description (truncate if too long)
        const articleDesc = document.createElement('div');
        articleDesc.className = 'kb-list-item-desc';
        articleDesc.textContent = truncateText(article.description, 100);
        
        // Create article meta
        const articleMeta = document.createElement('div');
        articleMeta.className = 'kb-list-item-meta';
        
        // Add date
        const articleDate = document.createElement('div');
        articleDate.className = 'kb-list-item-date';
        articleDate.textContent = UI.formatDate(article.createdAt);
        
        // Add tags if any
        if (article.tags && article.tags.length > 0) {
            const articleTags = document.createElement('div');
            articleTags.className = 'kb-list-item-tags';
            
            article.tags.slice(0, 3).forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'kb-tag';
                tagSpan.textContent = tag;
                articleTags.appendChild(tagSpan);
            });
            
            // If more tags, add indicator
            if (article.tags.length > 3) {
                const moreTag = document.createElement('span');
                moreTag.className = 'kb-tag kb-more-tag';
                moreTag.textContent = `+${article.tags.length - 3}`;
                articleTags.appendChild(moreTag);
            }
            
            articleMeta.appendChild(articleTags);
        }
        
        articleMeta.appendChild(articleDate);
        
        // Assemble article item
        articleItem.appendChild(articleTitle);
        articleItem.appendChild(articleDesc);
        articleItem.appendChild(articleMeta);
        
        return articleItem;
    };
    
    // Show article details
    const showArticleDetails = async (articleId) => {
        const article = await DataStore.getKnowledgeArticleById(articleId);
        
        if (!article) {
            UI.showNotification('Article not found', 'error');
            return;
        }
        
        // Store current article ID
        currentArticleId = articleId;
        
        // Clear content area
        elements.kbContent.innerHTML = '';
        
        // Create article display
        const articleDisplay = document.createElement('div');
        articleDisplay.className = 'kb-article-display';
        
        // Create article header
        const articleHeader = document.createElement('div');
        articleHeader.className = 'kb-article-header';
        
        const articleTitle = document.createElement('h2');
        articleTitle.textContent = article.title;
        
        const articleMeta = document.createElement('div');
        articleMeta.className = 'kb-article-meta';
        
        const articleDate = document.createElement('div');
        articleDate.className = 'kb-article-date';
        articleDate.innerHTML = `<strong>Created:</strong> ${UI.formatDate(article.createdAt)} | <strong>Updated:</strong> ${UI.formatDate(article.updatedAt)}`;
        
        articleMeta.appendChild(articleDate);
        
        // Add tags if any
        if (article.tags && article.tags.length > 0) {
            const articleTags = document.createElement('div');
            articleTags.className = 'kb-article-tags';
            articleTags.innerHTML = '<strong>Tags:</strong> ';
            
            article.tags.forEach((tag, index) => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'kb-tag';
                tagSpan.textContent = tag;
                
                // Add click event to filter by this tag
                tagSpan.addEventListener('click', () => {
                    elements.kbTagsFilter.value = tag;
                    handleFilterByTags();
                });
                
                articleTags.appendChild(tagSpan);
                
                // Add separator if not last tag
                if (index < article.tags.length - 1) {
                    articleTags.appendChild(document.createTextNode(', '));
                }
            });
            
            articleMeta.appendChild(articleTags);
        }
        
        // Add related systems if any
        if (article.relatedSystems && article.relatedSystems.length > 0) {
            const articleSystems = document.createElement('div');
            articleSystems.className = 'kb-article-systems';
            articleSystems.innerHTML = '<strong>Related Systems:</strong> ';
            
            const systemPromises = article.relatedSystems.map(systemId => 
                DataStore.getSystemById(systemId)
            );
            
            const systems = await Promise.all(systemPromises);
            const validSystems = systems.filter(system => system); // Filter out null systems
            
            validSystems.forEach((system, index) => {
                const systemSpan = document.createElement('span');
                systemSpan.className = 'kb-system';
                systemSpan.textContent = system.name;
                
                // Add click event to filter by this system
                systemSpan.addEventListener('click', () => {
                    elements.kbSystemFilter.value = system.id;
                    handleSearch();
                });
                
                articleSystems.appendChild(systemSpan);
                
                // Add separator if not last system
                if (index < validSystems.length - 1) {
                    articleSystems.appendChild(document.createTextNode(', '));
                }
            });
            
            articleMeta.appendChild(articleSystems);
        }
        
        articleHeader.appendChild(articleTitle);
        articleHeader.appendChild(articleMeta);
        
        // Create article description
        const articleDesc = document.createElement('div');
        articleDesc.className = 'kb-article-description';
        articleDesc.textContent = article.description;
        
        // Create article content
        const articleContent = document.createElement('div');
        articleContent.className = 'kb-article-content';
        articleContent.innerHTML = markdownRenderer(article.content);
        
        // Create article actions
        const articleActions = document.createElement('div');
        articleActions.className = 'kb-article-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'secondary-btn';
        editBtn.textContent = 'Edit Article';
        editBtn.addEventListener('click', () => openEditArticleForm(article.id));
        
        articleActions.appendChild(editBtn);
        
        // Assemble article display
        articleDisplay.appendChild(articleHeader);
        articleDisplay.appendChild(articleDesc);
        articleDisplay.appendChild(articleContent);
        articleDisplay.appendChild(articleActions);
        
        elements.kbContent.appendChild(articleDisplay);
        
        // Mark article item as active in the sidebar
        const listItems = elements.kbList.querySelectorAll('.kb-list-item');
        listItems.forEach(item => {
            if (item.dataset.id === articleId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };
    
    // Open create article form
    const openCreateArticleForm = async () => {
        // Reset form
        elements.kbArticleForm.reset();
        
        // Update modal title
        document.getElementById('kb-modal-title').textContent = 'Create Knowledge Article';
        
        // Update submit button text
        const submitBtn = elements.kbArticleForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Create Article';
        
        // Clear current article ID
        currentArticleId = null;
        
        // Populate systems and tickets dropdowns
        await populateSystemsDropdown();
        await populateTicketsDropdown();
        
        // Show modal
        UI.showModal('kb-article-modal');
    };
    
    // Open edit article form
    const openEditArticleForm = async (articleId) => {
        const article = await DataStore.getKnowledgeArticleById(articleId);
        
        if (!article) {
            UI.showNotification('Article not found', 'error');
            return;
        }
        
        // Update modal title
        document.getElementById('kb-modal-title').textContent = 'Edit Knowledge Article';
        
        // Update submit button text
        const submitBtn = elements.kbArticleForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Save Changes';
        
        // Store current article ID
        currentArticleId = articleId;
        
        // Populate systems and tickets dropdowns
        await populateSystemsDropdown();
        await populateTicketsDropdown();
        
        // Fill form with article data
        elements.kbArticleTitle.value = article.title;
        elements.kbArticleDescription.value = article.description;
        elements.kbArticleContent.value = article.content;
        elements.kbArticleTags.value = article.tags.join(', ');
        
        // Set selected systems
        Array.from(elements.kbArticleSystems.options).forEach(option => {
            option.selected = article.relatedSystems.includes(option.value);
        });
        
        // Set selected tickets
        Array.from(elements.kbArticleRelatedTickets.options).forEach(option => {
            option.selected = article.relatedTickets.includes(option.value);
        });
        
        // Show modal
        UI.showModal('kb-article-modal');
    };
    
    // Handle article form submit
    const handleArticleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Get form data
            const articleData = {
                title: elements.kbArticleTitle.value,
                description: elements.kbArticleDescription.value,
                content: elements.kbArticleContent.value,
                tags: elements.kbArticleTags.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                relatedSystems: Array.from(elements.kbArticleSystems.selectedOptions).map(option => option.value),
                relatedTickets: Array.from(elements.kbArticleRelatedTickets.selectedOptions).map(option => option.value),
                createdBy: 'admin' // Placeholder - would come from auth system
            };
            
            let newArticle;
            
            if (currentArticleId) {
                // Update existing article using KnowledgeBaseData
                if (typeof KnowledgeBaseData !== 'undefined' && typeof KnowledgeBaseData.updateArticle === 'function') {
                    newArticle = await KnowledgeBaseData.updateArticle(currentArticleId, articleData);
                    UI.showNotification('Article updated successfully', 'success');
                } else {
                    // Fallback to DataStore if KnowledgeBaseData is not available
                    await DataStore.updateKnowledgeArticle(currentArticleId, articleData);
                    UI.showNotification('Article updated successfully', 'success');
                }
            } else {
                // Create new article using KnowledgeBaseData
                if (typeof KnowledgeBaseData !== 'undefined' && typeof KnowledgeBaseData.createArticle === 'function') {
                    newArticle = await KnowledgeBaseData.createArticle(articleData);
                    UI.showNotification('Article created successfully', 'success');
                } else {
                    // Fallback to DataStore if KnowledgeBaseData is not available
                    await DataStore.createKnowledgeArticle(articleData);
                    UI.showNotification('Article created successfully', 'success');
                }
            }
            
            // Hide modal
            UI.hideModal('kb-article-modal');
            
            // Render articles
            await renderKnowledgeArticles();
            
            // If editing or we have a new article ID, show the article
            if (currentArticleId) {
                await showArticleDetails(currentArticleId);
            } else if (newArticle && newArticle.id) {
                await showArticleDetails(newArticle.id);
            }
        } catch (error) {
            console.error('Error saving article:', error);
            UI.showNotification('Error saving article: ' + error.message, 'error');
        }
    };
    
    // Handle search
    const handleSearch = async () => {
        const searchQuery = elements.kbSearchInput.value.trim();
        const systemId = elements.kbSystemFilter.value;
        
        // Clear tags filter to avoid conflicting filters
        elements.kbTagsFilter.value = '';
        
        let articles = [];
        
        if (searchQuery) {
            // Search by query
            articles = await DataStore.searchKnowledgeArticles(searchQuery);
        } else {
            // Get all articles
            articles = await DataStore.getKnowledgeArticles();
        }
        
        // Filter by system if not "all"
        if (systemId !== 'all') {
            articles = articles.filter(article => 
                article.relatedSystems.includes(systemId)
            );
        }
        
        // Clear article list
        elements.kbList.innerHTML = '';
        
        // Check if no articles
        if (articles.length === 0) {
            const noArticles = document.createElement('div');
            noArticles.className = 'no-articles';
            noArticles.textContent = 'No articles found matching your search criteria.';
            elements.kbList.appendChild(noArticles);
            
            // Clear content area and show message
            elements.kbContent.innerHTML = `
                <div class="kb-welcome">
                    <h3>No Articles Found</h3>
                    <p>No articles match your search criteria. Try using different keywords or clear the filters.</p>
                </div>
            `;
            
            return;
        }
        
        // Render each article
        articles.forEach(article => {
            const articleItem = createArticleListItem(article);
            elements.kbList.appendChild(articleItem);
        });
        
        // If only one article, show it
        if (articles.length === 1) {
            showArticleDetails(articles[0].id);
        } else {
            // Clear content area and show welcome message
            elements.kbContent.innerHTML = `
                <div class="kb-welcome">
                    <h3>Search Results</h3>
                    <p>Found ${articles.length} articles matching your criteria. Select an article from the list to view it.</p>
                </div>
            `;
        }
    };
    
    // Handle filter by tags
    const handleFilterByTags = async () => {
        const tagsString = elements.kbTagsFilter.value.trim();
        
        if (!tagsString) {
            // If tags field is empty, just render all articles
            await renderKnowledgeArticles();
            return;
        }
        
        // Parse tags
        const tags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
        
        // Get articles that match any of the tags
        let articles = await DataStore.filterKnowledgeArticlesByTags(tags);
        
        // Filter by system if not "all"
        const systemId = elements.kbSystemFilter.value;
        if (systemId !== 'all') {
            articles = articles.filter(article => 
                article.relatedSystems.includes(systemId)
            );
        }
        
        // Clear article list
        elements.kbList.innerHTML = '';
        
        // Check if no articles
        if (articles.length === 0) {
            const noArticles = document.createElement('div');
            noArticles.className = 'no-articles';
            noArticles.textContent = 'No articles found with the specified tags.';
            elements.kbList.appendChild(noArticles);
            
            // Clear content area and show message
            elements.kbContent.innerHTML = `
                <div class="kb-welcome">
                    <h3>No Articles Found</h3>
                    <p>No articles match your tag filters. Try using different tags or clear the filters.</p>
                </div>
            `;
            
            return;
        }
        
        // Render each article
        articles.forEach(article => {
            const articleItem = createArticleListItem(article);
            elements.kbList.appendChild(articleItem);
        });
        
        // If only one article, show it
        if (articles.length === 1) {
            showArticleDetails(articles[0].id);
        } else {
            // Clear content area and show welcome message
            elements.kbContent.innerHTML = `
                <div class="kb-welcome">
                    <h3>Tag Filter Results</h3>
                    <p>Found ${articles.length} articles with tags: ${tags.join(', ')}. Select an article from the list to view it.</p>
                </div>
            `;
        }
    };
    
    // Render suggested knowledge articles for a ticket
    const renderSuggestions = async (ticketId, container) => {
        const ticket = await DataStore.getTicketById(ticketId);
        
        if (!ticket) {
            container.innerHTML = '<p>No ticket found to provide recommendations.</p>';
            return;
        }
        
        // Get related articles for this ticket
        const relatedArticles = await DataStore.getRelatedArticlesForTicket(ticketId);
        
        if (!relatedArticles || relatedArticles.length === 0) {
            container.innerHTML = '<p>No knowledge base articles found for this ticket.</p>';
            return;
        }
        
        // Create suggestions container
        const suggestionsHeader = document.createElement('h3');
        suggestionsHeader.textContent = 'Knowledge Base Recommendations';
        
        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'kb-suggestions-list';
        
        // Add each suggestion
        relatedArticles.forEach(article => {
            const suggestion = document.createElement('div');
            suggestion.className = 'kb-suggestion';
            
            const suggestionTitle = document.createElement('div');
            suggestionTitle.className = 'kb-suggestion-title';
            
            const articleLink = document.createElement('a');
            articleLink.href = '#';
            articleLink.textContent = article.title;
            articleLink.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Close ticket details modal
                UI.hideModal('ticket-details-modal');
                
                // Open knowledge base modal and show article
                UI.showModal('knowledge-base-modal');
                showArticleDetails(article.id);
            });
            
            suggestionTitle.appendChild(articleLink);
            
            const suggestionDesc = document.createElement('div');
            suggestionDesc.className = 'kb-suggestion-desc';
            suggestionDesc.textContent = truncateText(article.description, 100);
            
            suggestion.appendChild(suggestionTitle);
            suggestion.appendChild(suggestionDesc);
            
            suggestionsList.appendChild(suggestion);
        });
        
        // Assemble suggestions
        container.appendChild(suggestionsHeader);
        container.appendChild(suggestionsList);
    };
    
    // Add conversion suggestion
    const addConversionSuggestion = async (ticketId, container) => {
        const ticket = await DataStore.getTicketById(ticketId);
        
        // Only suggest conversion for resolved tickets with detailed history
        if (!ticket || ticket.status !== 'resolved' || ticket.history.length < 3) {
            return;
        }
        
        // Create suggestion
        const suggestion = document.createElement('div');
        suggestion.className = 'kb-conversion-suggestion';
        
        const suggestionText = document.createElement('p');
        suggestionText.textContent = 'This resolved ticket contains valuable information. Would you like to convert it to a knowledge base article?';
        
        const suggestionBtn = document.createElement('button');
        suggestionBtn.className = 'secondary-btn';
        suggestionBtn.textContent = 'Convert to Article';
        suggestionBtn.addEventListener('click', () => {
            // Close ticket details modal
            UI.hideModal('ticket-details-modal');
            
            // Open article form and populate with ticket data
            openCreateArticleFormFromTicket(ticketId);
        });
        
        suggestion.appendChild(suggestionText);
        suggestion.appendChild(suggestionBtn);
        
        container.appendChild(suggestion);
    };
    
    // Open create article form from ticket
    const openCreateArticleFormFromTicket = async (ticketId) => {
        try {
            const ticket = await DataStore.getTicketById(ticketId);
            
            if (!ticket) {
                UI.showNotification('Ticket not found', 'error');
                return;
            }
            
            // Reset form
            elements.kbArticleForm.reset();
            
            // Update modal title
            const modalTitle = document.getElementById('kb-modal-title');
            if (modalTitle) {
                modalTitle.textContent = 'Create Knowledge Article from Ticket';
            }
            
            // Update submit button text
            const submitBtn = elements.kbArticleForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.textContent = 'Create Article';
            }
            
            // Clear current article ID
            currentArticleId = null;
            
            // Populate systems and tickets dropdowns
            await populateSystemsDropdown();
            await populateTicketsDropdown();
            
            // Extract solution from history
            let solutionText = '';
            const resolutionEntries = ticket.history.filter(entry => 
                entry.action === 'Update Added' && ticket.resolvedAt && 
                new Date(entry.timestamp) <= new Date(ticket.resolvedAt)
            );
            
            if (resolutionEntries.length > 0) {
                solutionText = resolutionEntries.map(entry => entry.details).join('\n\n');
            }
            
            // Pre-fill form with ticket data
            elements.kbArticleTitle.value = `Solution: ${ticket.title}`;
            elements.kbArticleDescription.value = `Knowledge article created from ticket ${ticket.id}: ${ticket.title}`;
            
            // Create article content template
            elements.kbArticleContent.value = `# Issue
${ticket.description}

# Impact
${ticket.impact}

# Solution
${solutionText || 'Describe the solution here...'}

# Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

# Additional Notes
Add any additional information here.`;
            
            // Set system
            const systemOptions = Array.from(elements.kbArticleSystems.options);
            systemOptions.forEach(option => {
                option.selected = option.value === ticket.system;
            });
            
            // Set related ticket
            const ticketOptions = Array.from(elements.kbArticleRelatedTickets.options);
            ticketOptions.forEach(option => {
                option.selected = option.value === ticketId;
            });
            
            // Add tags based on priority and system
            let tags = [ticket.priority];
            
            // Add system category if available
            const system = await DataStore.getSystemById(ticket.system);
            if (system && system.category) {
                tags.push(system.category.toLowerCase());
            }
            
            elements.kbArticleTags.value = tags.join(', ');
            
            // Show modal
            UI.showModal('kb-article-modal');
        } catch (error) {
            console.error('Error creating article from ticket:', error);
            UI.showNotification('Error creating article from ticket: ' + error.message, 'error');
        }
    };
    
    // Helper: Truncate text
    const truncateText = (text, maxLength) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };
    
    // Public API
    return {
        initialize,
        renderSuggestions,
        addConversionSuggestion,
        renderKnowledgeArticles,
        showArticleDetails,
        openCreateArticleFormFromTicket
    };
})();

// Initialize knowledge base module when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if required elements exist
    const requiredElements = [
        document.getElementById('knowledge-base-btn'),
        document.getElementById('knowledge-base-modal'),
        document.getElementById('kb-list')
    ];
    
    if (requiredElements.every(element => element)) {
        KnowledgeBaseUI.initialize();
    } else {
        console.warn('Knowledge Base module initialization skipped: Required elements not found');
    }
});
