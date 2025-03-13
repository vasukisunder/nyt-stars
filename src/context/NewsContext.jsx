import { createContext, useState, useEffect, useCallback } from 'react';
import { fetchLatestArticles, searchArticles } from '../services/nytApi';

// Create the context
export const NewsContext = createContext();

// Create a provider component
export const NewsProvider = ({ children }) => {
  // State for articles from the last 24 hours
  const [latestArticles, setLatestArticles] = useState([]);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);
  const [latestError, setLatestError] = useState(null);

  // State for historical articles (time machine)
  const [historicalArticles, setHistoricalArticles] = useState([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [historicalError, setHistoricalError] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({
    section: 'all',
    searchQuery: '',
  });

  // Function to fetch articles from last 24 hours
  const fetchLatest = useCallback(async () => {
    setIsLoadingLatest(true);
    setLatestError(null);
    try {
      console.log('Fetching articles from last 24 hours...');
      // Fetch up to 100 articles, filtering for the last 24 hours is done in the API function
      const articles = await fetchLatestArticles('all', filters.section, 100);
      console.log('Articles received:', articles.length);
      
      if (articles && articles.length > 0) {
        setLatestArticles(articles);
      } else {
        console.warn('No articles returned from API for the last 24 hours');
        setLatestError('No articles found from the last 24 hours. Please try again later.');
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
      setLatestError(error.message || 'Failed to fetch articles');
    } finally {
      setIsLoadingLatest(false);
    }
  }, [filters.section]);

  // Function to search historical articles
  const fetchHistorical = useCallback(async (query, options = {}) => {
    if (!query) return;
    
    setIsLoadingHistorical(true);
    setHistoricalError(null);
    try {
      console.log(`Searching for articles with query: ${query}`);
      const articles = await searchArticles(query, options);
      console.log('Historical search results:', articles);
      if (articles && articles.length > 0) {
        setHistoricalArticles(articles);
      } else {
        console.warn('No historical articles returned from API');
        setHistoricalError('No articles found for your search query');
      }
    } catch (error) {
      console.error('Error searching articles:', error);
      setHistoricalError(error.message || 'Failed to search articles');
    } finally {
      setIsLoadingHistorical(false);
    }
  }, []);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Fetch latest articles on initial load and when section filter changes
  useEffect(() => {
    console.log('Initializing articles fetch...');
    fetchLatest();
    // Set up polling for updates (every 5 seconds instead of 60)
    const intervalId = setInterval(fetchLatest, 5000);
    return () => clearInterval(intervalId);
  }, [fetchLatest]);

  // Fetch historical articles when search query changes
  useEffect(() => {
    if (filters.searchQuery) {
      fetchHistorical(filters.searchQuery);
    }
  }, [filters.searchQuery, fetchHistorical]);

  // Value to be provided by the context
  const value = {
    latestArticles,
    isLoadingLatest,
    latestError,
    historicalArticles,
    isLoadingHistorical,
    historicalError,
    filters,
    updateFilters,
    fetchHistorical
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
}; 