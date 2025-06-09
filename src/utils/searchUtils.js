import Fuse from 'fuse.js';

/**
 * Simple fuzzy matching function for basic text searching
 * @param {string} text - Text to search in
 * @param {string} query - Search query
 * @returns {boolean} - Whether the text matches the query
 */
export const fuzzyMatch = (text, query) => {
    if (!text || !query) return false;
    
    const normalizedText = text.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    // Direct substring match
    if (normalizedText.includes(normalizedQuery)) {
        return true;
    }
    
    // Character sequence matching (allows for typos and missing characters)
    let textIndex = 0;
    let queryIndex = 0;
    
    while (textIndex < normalizedText.length && queryIndex < normalizedQuery.length) {
        if (normalizedText[textIndex] === normalizedQuery[queryIndex]) {
            queryIndex++;
        }
        textIndex++;
    }
    
    // If we've matched all characters in the query, it's a fuzzy match
    return queryIndex === normalizedQuery.length;
};

/**
 * Advanced fuzzy search using Fuse.js for more sophisticated matching
 * @param {Array} items - Array of items to search
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Array} - Filtered and ranked results
 */
export const fuzzySearch = (items, query, options = {}) => {
    if (!query || !items.length) return items;
    
    const defaultOptions = {
        keys: ['title', 'description'],
        threshold: 0.4, // Lower = more strict matching
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 2,
        ignoreLocation: true,
        findAllMatches: true,
        ...options
    };
    
    const fuse = new Fuse(items, defaultOptions);
    const results = fuse.search(query);
    
    // Return items with match information
    return results.map(result => ({
        ...result.item,
        _searchScore: result.score,
        _searchMatches: result.matches
    }));
};

/**
 * Highlight matched text in a string
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @param {string} highlightClass - CSS class for highlighted text
 * @returns {string} - HTML string with highlighted matches
 */
export const highlightMatches = (text, query, highlightClass = 'bg-yellow-200 font-medium') => {
    if (!text || !query) return text;
    
    const normalizedQuery = query.toLowerCase();
    const normalizedText = text.toLowerCase();
    
    // Find all match positions
    const matches = [];
    let index = normalizedText.indexOf(normalizedQuery);
    
    while (index !== -1) {
        matches.push({
            start: index,
            end: index + normalizedQuery.length
        });
        index = normalizedText.indexOf(normalizedQuery, index + 1);
    }
    
    if (matches.length === 0) return text;
    
    // Build highlighted string
    let result = '';
    let lastEnd = 0;
    
    matches.forEach(match => {
        // Add text before match
        result += text.slice(lastEnd, match.start);
        // Add highlighted match
        result += `<span class="${highlightClass}">${text.slice(match.start, match.end)}</span>`;
        lastEnd = match.end;
    });
    
    // Add remaining text
    result += text.slice(lastEnd);
    
    return result;
};

/**
 * Simple text highlighting using React-safe approach
 * @param {string} text - Original text
 * @param {string} query - Search query
 * @returns {Array} - Array of text parts with highlight information
 */
export const getHighlightedParts = (text, query) => {
    if (!text || !query) return [{ text, highlighted: false }];
    
    const normalizedQuery = query.toLowerCase();
    const normalizedText = text.toLowerCase();
    
    const parts = [];
    let currentIndex = 0;
    
    let matchIndex = normalizedText.indexOf(normalizedQuery);
    
    while (matchIndex !== -1) {
        // Add text before match
        if (matchIndex > currentIndex) {
            parts.push({
                text: text.slice(currentIndex, matchIndex),
                highlighted: false
            });
        }
        
        // Add highlighted match
        parts.push({
            text: text.slice(matchIndex, matchIndex + normalizedQuery.length),
            highlighted: true
        });
        
        currentIndex = matchIndex + normalizedQuery.length;
        matchIndex = normalizedText.indexOf(normalizedQuery, currentIndex);
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
        parts.push({
            text: text.slice(currentIndex),
            highlighted: false
        });
    }
    
    return parts;
};

/**
 * Check if a task matches the search query
 * @param {Object} task - Task object with title and description
 * @param {string} query - Search query
 * @returns {boolean} - Whether the task matches
 */
export const taskMatchesSearch = (task, query) => {
    if (!query) return true;
    
    const titleMatch = fuzzyMatch(task.title || '', query);
    const descriptionMatch = fuzzyMatch(task.description || '', query);
    
    return titleMatch || descriptionMatch;
};