/**
 * Knowledge Base Data Management
 * Contains all the Knowledge Base functionality for data.js
 */

// Add knowledge base methods to DataStore
(() => {
    // Get knowledge articles
    DataStore.getKnowledgeArticles = async () => {
        const data = await DataStore.getAllData();
        return data.knowledgeArticles || [];
    };
    
    // Get knowledge article by ID
    DataStore.getKnowledgeArticleById = async (articleId) => {
        const articles = await DataStore.getKnowledgeArticles();
        return articles.find(article => article.id === articleId);
    };
    
    // Create new knowledge article
    DataStore.createKnowledgeArticle = async (articleData) => {
        const data = await DataStore.getAllData();
        
        // Ensure the knowledgeArticles array exists
        if (!data.knowledgeArticles) {
            data.knowledgeArticles = [];
        }
        
        // Ensure the nextKnowledgeArticleNumber exists
        if (!data.nextKnowledgeArticleNumber) {
            data.nextKnowledgeArticleNumber = 1001;
        }
        
        const articleId = `KB-${data.nextKnowledgeArticleNumber}`;
        const timestamp = new Date().toISOString();
        
        const newArticle = {
            id: articleId,
            title: articleData.title,
            description: articleData.description,
            content: articleData.content,
            tags: articleData.tags || [],
            relatedSystems: articleData.relatedSystems || [],
            relatedTickets: articleData.relatedTickets || [],
            createdBy: articleData.createdBy || 'system',
            createdAt: timestamp,
            updatedAt: timestamp
        };
        
        data.knowledgeArticles.unshift(newArticle); // Add to beginning of array
        data.nextKnowledgeArticleNumber++;
        await DataStore.saveAllData(data);
        
        return newArticle;
    };
    
    // Update knowledge article
    DataStore.updateKnowledgeArticle = async (articleId, updates) => {
        const data = await DataStore.getAllData();
        
        // Ensure the knowledgeArticles array exists
        if (!data.knowledgeArticles) {
            data.knowledgeArticles = [];
            return null;
        }
        
        const articleIndex = data.knowledgeArticles.findIndex(article => article.id === articleId);
        
        if (articleIndex === -1) return null;
        
        const article = data.knowledgeArticles[articleIndex];
        const updatedArticle = { 
            ...article, 
            ...updates, 
            updatedAt: new Date().toISOString() 
        };
        
        data.knowledgeArticles[articleIndex] = updatedArticle;
        await DataStore.saveAllData(data);
        
        return updatedArticle;
    };
    
    // Delete knowledge article
    DataStore.deleteKnowledgeArticle = async (articleId) => {
        const data = await DataStore.getAllData();
        
        // Ensure the knowledgeArticles array exists
        if (!data.knowledgeArticles) {
            data.knowledgeArticles = [];
            return false;
        }
        
        const articleIndex = data.knowledgeArticles.findIndex(article => article.id === articleId);
        
        if (articleIndex === -1) return false;
        
        data.knowledgeArticles.splice(articleIndex, 1);
        await DataStore.saveAllData(data);
        
        return true;
    };
    
    // Search knowledge articles
    DataStore.searchKnowledgeArticles = async (query) => {
        const articles = await DataStore.getKnowledgeArticles();
        
        if (!query) return articles;
        
        const searchTerm = query.toLowerCase();
        
        return articles.filter(article => {
            return (
                article.title.toLowerCase().includes(searchTerm) ||
                article.description.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm) ||
                article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        });
    };
    
    // Filter knowledge articles by system
    DataStore.filterKnowledgeArticlesBySystem = async (systemId) => {
        const articles = await DataStore.getKnowledgeArticles();
        
        if (!systemId || systemId === 'all') return articles;
        
        return articles.filter(article => article.relatedSystems.includes(systemId));
    };
    
    // Filter knowledge articles by tags
    DataStore.filterKnowledgeArticlesByTags = async (tags) => {
        const articles = await DataStore.getKnowledgeArticles();
        
        if (!tags || tags.length === 0) return articles;
        
        return articles.filter(article => {
            return tags.some(tag => article.tags.includes(tag));
        });
    };
    
    // Get related articles for a ticket
    DataStore.getRelatedArticlesForTicket = async (ticketId) => {
        const ticket = await DataStore.getTicketById(ticketId);
        if (!ticket) return [];
        
        const allArticles = await DataStore.getKnowledgeArticles();
        
        // First, get articles directly related to this ticket
        const directlyRelated = allArticles.filter(article => 
            article.relatedTickets.includes(ticketId)
        );
        
        if (directlyRelated.length > 0) {
            return directlyRelated;
        }
        
        // Then, find articles related to the same system
        const systemRelated = allArticles.filter(article => 
            article.relatedSystems.includes(ticket.system)
        );
        
        // Score articles by relevance
        const scoredArticles = allArticles.map(article => {
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
    };
})();
