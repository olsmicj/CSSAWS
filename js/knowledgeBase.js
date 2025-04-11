/**
 * Knowledge Base Data Storage Module
 * Handles separate storage for knowledge base articles
 */

const KnowledgeBaseData = (() => {
    // Create and configure the Dexie database for knowledge base
    const kbDb = new Dexie('KnowledgeBaseSystem');
    
    // Define the database schema
    kbDb.version(1).stores({
        articles: 'id, title, createdAt, updatedAt',
        tags: 'id, name'
    });
    
    // Cache for knowledge base data
    let articlesCache = null;
    let currentUser = "Anonymous";
    
    // Initialize the database
    const initialize = async () => {
        try {
            console.log('Initializing Knowledge Base database...');
            
            // Check if database is empty
            const isEmpty = await isDatabaseEmpty();
            
            if (isEmpty) {
                console.log('Knowledge Base database is empty, initializing with sample data...');
                await initializeWithSampleData();
            }
            
            // Load data into cache
            await refreshCache();
            
            console.log('Knowledge Base database initialized successfully');
            return true;
        } catch (error) {
            console.error('Error initializing Knowledge Base database:', error);
            return false;
        }
    };
    
    // Check if the database is empty
    const isDatabaseEmpty = async () => {
        try {
            const articleCount = await kbDb.articles.count();
            return articleCount === 0;
        } catch (error) {
            console.error('Error checking if Knowledge Base database is empty:', error);
            return true; // Assume empty if error
        }
    };
    
    // Initialize with sample data
    const initializeWithSampleData = async () => {
        try {
            // Sample knowledge base articles
            const sampleArticles = [
                {
                    id: "KB-1001",
                    title: "Troubleshooting Network Connectivity Issues",
                    description: "A guide to diagnosing and resolving common network connectivity problems",
                    content: `# Troubleshooting Network Connectivity Issues

## Common Causes
1. Router/switch configuration issues
2. DNS resolution problems
3. IP address conflicts
4. Firewall blocking connections
5. Physical cable issues

## Diagnostic Steps
1. Verify physical connections
2. Check IP configuration (ipconfig /all)
3. Test local network connectivity (ping gateway)
4. Test internet connectivity (ping 8.8.8.8)
5. Check DNS resolution (nslookup google.com)

## Resolution Steps
### For IP Address Issues
- Release and renew IP address (ipconfig /release followed by ipconfig /renew)
- Check for IP conflicts using arp -a

### For DNS Issues
- Clear DNS cache (ipconfig /flushdns)
- Try alternative DNS servers

### For Physical Issues
- Replace ethernet cables
- Test different network ports

## Prevention
- Regular network equipment maintenance
- Document network configuration
- Implement monitoring solutions`,
                    tags: ["network", "connectivity", "troubleshooting"],
                    relatedSystems: ["sys1616161671"],
                    relatedTickets: ["TKT-1001"],
                    createdBy: "admin",
                    createdAt: "2025-03-10T10:15:00.000Z",
                    updatedAt: "2025-03-10T10:15:00.000Z"
                },
                {
                    id: "KB-1002",
                    title: "Email Server Configuration Guide",
                    description: "Step-by-step guide for configuring and maintaining the email server",
                    content: `# Email Server Configuration Guide

## Initial Setup
1. Install required packages
2. Configure DNS records (MX, SPF, DKIM, DMARC)
3. Set up TLS certificates
4. Configure firewall rules

## Maintenance Tasks
- Regular backup of mail databases
- Certificate renewal
- Log rotation and monitoring
- Spam filter updates

## Troubleshooting Common Issues
### Mail Delivery Failures
- Check SMTP logs for error messages
- Verify DNS configuration
- Test connectivity to remote mail servers

### Authentication Issues
- Verify user credentials
- Check authentication mechanisms
- Review security policies

## Best Practices
- Implement proper spam filtering
- Regular security updates
- Monitor server health metrics
- Document all configuration changes`,
                    tags: ["email", "server", "configuration"],
                    relatedSystems: ["sys1616161672"],
                    relatedTickets: ["TKT-1002"],
                    createdBy: "admin",
                    createdAt: "2025-03-12T14:30:00.000Z",
                    updatedAt: "2025-03-12T14:30:00.000Z"
                }
            ];
            
            // Add sample articles to database
            await kbDb.articles.bulkAdd(sampleArticles);
            
            console.log('Sample Knowledge Base data added');
            return true;
        } catch (error) {
            console.error('Error initializing Knowledge Base with sample data:', error);
            return false;
        }
    };
    
    // Refresh the cache
    const refreshCache = async () => {
        try {
            // Get all articles from database
            const articles = await kbDb.articles.toArray();
            
            // Update cache
            articlesCache = articles;
            
            return true;
        } catch (error) {
            console.error('Error refreshing Knowledge Base cache:', error);
            return false;
        }
    };
    
    // Get all knowledge base articles
    const getArticles = async () => {
        try {
            if (!articlesCache) {
                await refreshCache();
            }
            return articlesCache || [];
        } catch (error) {
            console.error('Error getting Knowledge Base articles:', error);
            return [];
        }
    };
    
    // Get article by ID
    const getArticleById = async (articleId) => {
        try {
            return await kbDb.articles.get(articleId);
        } catch (error) {
            console.error(`Error getting Knowledge Base article ${articleId}:`, error);
            return null;
        }
    };
    
    // Create new article
    const createArticle = async (articleData) => {
        try {
            // Generate article ID
            const nextId = await getNextArticleId();
            const articleId = `KB-${nextId}`;
            const timestamp = new Date().toISOString();
            
            const newArticle = {
                id: articleId,
                title: articleData.title,
                description: articleData.description,
                content: articleData.content,
                tags: articleData.tags || [],
                relatedSystems: articleData.relatedSystems || [],
                relatedTickets: articleData.relatedTickets || [],
                createdBy: articleData.createdBy || currentUser,
                createdAt: timestamp,
                updatedAt: timestamp
            };
            
            // Add to database
            await kbDb.articles.add(newArticle);
            
            // Refresh cache
            await refreshCache();
            
            return newArticle;
        } catch (error) {
            console.error('Error creating Knowledge Base article:', error);
            throw error;
        }
    };
    
    // Update article
    const updateArticle = async (articleId, updates) => {
        try {
            // Get existing article
            const article = await kbDb.articles.get(articleId);
            
            if (!article) {
                throw new Error(`Article with ID ${articleId} not found`);
            }
            
            // Update article
            const updatedArticle = {
                ...article,
                ...updates,
                updatedAt: new Date().toISOString()
            };
            
            // Save to database
            await kbDb.articles.put(updatedArticle);
            
            // Refresh cache
            await refreshCache();
            
            return updatedArticle;
        } catch (error) {
            console.error(`Error updating Knowledge Base article ${articleId}:`, error);
            throw error;
        }
    };
    
    // Delete article
    const deleteArticle = async (articleId) => {
        try {
            // Delete from database
            await kbDb.articles.delete(articleId);
            
            // Refresh cache
            await refreshCache();
            
            return true;
        } catch (error) {
            console.error(`Error deleting Knowledge Base article ${articleId}:`, error);
            return false;
        }
    };
    
    // Search articles
    const searchArticles = async (query) => {
        try {
            // Get all articles
            const articles = await getArticles();
            
            if (!query) return articles;
            
            const searchTerm = query.toLowerCase();
            
            // Filter articles by search term
            return articles.filter(article => {
                return (
                    article.title.toLowerCase().includes(searchTerm) ||
                    article.description.toLowerCase().includes(searchTerm) ||
                    article.content.toLowerCase().includes(searchTerm) ||
                    article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
                );
            });
        } catch (error) {
            console.error('Error searching Knowledge Base articles:', error);
            return [];
        }
    };
    
    // Filter articles by system
    const filterArticlesBySystem = async (systemId) => {
        try {
            // Get all articles
            const articles = await getArticles();
            
            if (!systemId || systemId === 'all') return articles;
            
            // Filter articles by system
            return articles.filter(article => 
                article.relatedSystems.includes(systemId)
            );
        } catch (error) {
            console.error(`Error filtering Knowledge Base articles by system ${systemId}:`, error);
            return [];
        }
    };
    
    // Filter articles by tags
    const filterArticlesByTags = async (tags) => {
        try {
            // Get all articles
            const articles = await getArticles();
            
            if (!tags || tags.length === 0) return articles;
            
            // Filter articles by tags
            return articles.filter(article => {
                return tags.some(tag => article.tags.includes(tag));
            });
        } catch (error) {
            console.error('Error filtering Knowledge Base articles by tags:', error);
            return [];
        }
    };
    
    // Get related articles for a ticket
    const getRelatedArticlesForTicket = async (ticketId) => {
        try {
            // Get ticket data
            const ticket = await DataStore.getTicketById(ticketId);
            if (!ticket) return [];
            
            // Get all articles
            const articles = await getArticles();
            
            // First, get articles directly related to this ticket
            const directlyRelated = articles.filter(article => 
                article.relatedTickets.includes(ticketId)
            );
            
            if (directlyRelated.length > 0) {
                return directlyRelated;
            }
            
            // Score articles by relevance
            const scoredArticles = articles.map(article => {
                let score = 0;
                
                // Higher score for system match
                if (article.relatedSystems.includes(ticket.system)) {
                    score += 20;
                }
                
                // Check title words
                const titleWords = ticket.title.toLowerCase().split(/\W+/).filter(word => word.length > 3);
                titleWords.forEach(word => {
                    if (article.title.toLowerCase().includes(word)) {
                        score += 5;
                    }
                    if (article.content.toLowerCase().includes(word)) {
                        score += 2;
                    }
                });
                
                // Check description words
                const descWords = ticket.description.toLowerCase().split(/\W+/).filter(word => word.length > 3);
                descWords.forEach(word => {
                    if (article.content.toLowerCase().includes(word)) {
                        score += 3;
                    }
                });
                
                return { article, score };
            });
            
            // Sort by score and return top articles
            scoredArticles.sort((a, b) => b.score - a.score);
            return scoredArticles.filter(item => item.score > 10).slice(0, 5).map(item => item.article);
        } catch (error) {
            console.error(`Error getting related articles for ticket ${ticketId}:`, error);
            return [];
        }
    };
    
    // Create article from ticket
    const createArticleFromTicket = async (ticketId) => {
        try {
            // Get ticket data
            const ticket = await DataStore.getTicketById(ticketId);
            if (!ticket) {
                throw new Error(`Ticket with ID ${ticketId} not found`);
            }
            
            // Extract solution from history
            let solutionText = '';
            const resolutionEntries = ticket.history.filter(entry => 
                entry.action === 'Update Added' && ticket.resolvedAt && 
                new Date(entry.timestamp) <= new Date(ticket.resolvedAt)
            );
            
            if (resolutionEntries.length > 0) {
                solutionText = resolutionEntries.map(entry => entry.details).join('\n\n');
            }
            
            // Create article data
            const articleData = {
                title: `Solution: ${ticket.title}`,
                description: `Knowledge article created from ticket ${ticket.id}: ${ticket.title}`,
                content: `# Issue
${ticket.description}

# Impact
${ticket.impact}

# Solution
${solutionText || 'No solution details available.'}

# Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

# Additional Notes
This article was automatically created from ticket ${ticket.id}.`,
                tags: [ticket.priority],
                relatedSystems: [ticket.system],
                relatedTickets: [ticketId],
                createdBy: currentUser
            };
            
            // Add system category if available
            const system = await DataStore.getSystemById(ticket.system);
            if (system && system.category) {
                articleData.tags.push(system.category.toLowerCase());
            }
            
            // Create the article
            const newArticle = await createArticle(articleData);
            
            return newArticle;
        } catch (error) {
            console.error(`Error creating article from ticket ${ticketId}:`, error);
            throw error;
        }
    };
    
    // Get next article ID
    const getNextArticleId = async () => {
        try {
            // Get all articles
            const articles = await kbDb.articles.toArray();
            
            if (articles.length === 0) {
                return 1001; // Start with 1001
            }
            
            // Extract numeric parts of article IDs
            const idNumbers = articles.map(article => {
                const match = article.id.match(/KB-(\d+)/);
                return match ? parseInt(match[1], 10) : 0;
            });
            
            // Find the highest ID number and add 1
            return Math.max(...idNumbers) + 1;
        } catch (error) {
            console.error('Error getting next article ID:', error);
            return 1001; // Fallback to 1001
        }
    };
    
    // Export articles to JSON file
    const exportArticles = async (filename = 'knowledge_base.json') => {
        try {
            // Get all articles
            const articles = await getArticles();
            
            // Create export data
            const exportData = {
                articles,
                exportDate: new Date().toISOString(),
                exportedBy: currentUser
            };
            
            // Convert to JSON
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // Create blob and download link
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = filename;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            
            // Trigger download
            downloadLink.click();
            
            // Clean up
            URL.revokeObjectURL(url);
            document.body.removeChild(downloadLink);
            
            console.log('Knowledge Base articles exported successfully');
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Knowledge Base articles exported successfully', 'success');
            }
            
            return true;
        } catch (error) {
            console.error('Error exporting Knowledge Base articles:', error);
            if (typeof UI !== 'undefined' && UI.showNotification) {
                UI.showNotification('Error exporting Knowledge Base articles', 'error');
            }
            return false;
        }
    };
    
    // Import articles from JSON file
    const importArticles = () => {
        return new Promise((resolve, reject) => {
            try {
                // Create file input element
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = '.json';
                fileInput.style.display = 'none';
                document.body.appendChild(fileInput);
                
                // Handle file selection
                fileInput.onchange = async (event) => {
                    const file = event.target.files[0];
                    if (!file) {
                        document.body.removeChild(fileInput);
                        resolve(false);
                        return;
                    }
                    
                    const reader = new FileReader();
                    
                    reader.onload = async (e) => {
                        try {
                            const data = JSON.parse(e.target.result);
                            
                            if (!data.articles || !Array.isArray(data.articles)) {
                                throw new Error('Invalid Knowledge Base data format');
                            }
                            
                            // Clear existing articles
                            await kbDb.articles.clear();
                            
                            // Add imported articles
                            await kbDb.articles.bulkAdd(data.articles);
                            
                            // Refresh cache
                            await refreshCache();
                            
                            console.log('Knowledge Base articles imported successfully');
                            if (typeof UI !== 'undefined' && UI.showNotification) {
                                UI.showNotification('Knowledge Base articles imported successfully', 'success');
                            }
                            
                            document.body.removeChild(fileInput);
                            resolve(true);
                        } catch (error) {
                            console.error('Error importing Knowledge Base articles:', error);
                            if (typeof UI !== 'undefined' && UI.showNotification) {
                                UI.showNotification('Error importing Knowledge Base articles: ' + error.message, 'error');
                            }
                            document.body.removeChild(fileInput);
                            reject(error);
                        }
                    };
                    
                    reader.onerror = () => {
                        console.error('Error reading file');
                        if (typeof UI !== 'undefined' && UI.showNotification) {
                            UI.showNotification('Error reading file', 'error');
                        }
                        document.body.removeChild(fileInput);
                        reject(new Error('Error reading file'));
                    };
                    
                    reader.readAsText(file);
                };
                
                // Trigger file selection
                fileInput.click();
            } catch (error) {
                console.error('Error importing Knowledge Base articles:', error);
                if (typeof UI !== 'undefined' && UI.showNotification) {
                    UI.showNotification('Error importing Knowledge Base articles', 'error');
                }
                reject(error);
            }
        });
    };
    
    // Set current user
    const setCurrentUser = (username) => {
        currentUser = username || "Anonymous";
    };
    
    // Public API
    return {
        initialize,
        getArticles,
        getArticleById,
        createArticle,
        updateArticle,
        deleteArticle,
        searchArticles,
        filterArticlesBySystem,
        filterArticlesByTags,
        getRelatedArticlesForTicket,
        createArticleFromTicket,
        exportArticles,
        importArticles,
        setCurrentUser
    };
})();

// Initialize Knowledge Base Data when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    KnowledgeBaseData.initialize().catch(console.error);
});
