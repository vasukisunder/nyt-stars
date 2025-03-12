import { createContext, useState, useEffect, useCallback } from 'react';
import { fetchLatestArticles, fetchMostPopular, searchArticles } from '../services/nytApi';

// Create the context
export const NewsContext = createContext();

// Create a provider component
export const NewsProvider = ({ children }) => {
  // State for latest articles (real-time orbital stream)
  const [latestArticles, setLatestArticles] = useState([]);
  const [isLoadingLatest, setIsLoadingLatest] = useState(false);
  const [latestError, setLatestError] = useState(null);

  // State for popular articles (constellation backdrop)
  const [popularArticles, setPopularArticles] = useState([]);
  const [isLoadingPopular, setIsLoadingPopular] = useState(false);
  const [popularError, setPopularError] = useState(null);

  // State for historical articles (time machine)
  const [historicalArticles, setHistoricalArticles] = useState([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(false);
  const [historicalError, setHistoricalError] = useState(null);

  // State for filters
  const [filters, setFilters] = useState({
    section: 'all',
    timeRange: 1, // For popular articles: 1, 7, or 30 days
    searchQuery: '',
  });

  // Function to fetch latest articles
  const fetchLatest = useCallback(async () => {
    setIsLoadingLatest(true);
    setLatestError(null);
    try {
      console.log('Fetching latest articles...');
      // Fetch up to 100 articles (API maximum) instead of default 20
      const articles = await fetchLatestArticles('all', filters.section, 100);
      console.log('Latest articles received:', articles);
      
      // Filter to only include articles from the current day
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const todaysArticles = articles.filter(article => {
        const pubDate = new Date(article.published_date || article.pub_date);
        return pubDate >= today;
      });
      
      console.log(`Filtered to ${todaysArticles.length} articles from today`);
      
      if (todaysArticles && todaysArticles.length > 0) {
        setLatestArticles(todaysArticles);
      } else {
        console.warn('No latest articles returned from API for today');
        // Fall back to all articles if none from today
        setLatestArticles(articles);
      }
    } catch (error) {
      console.error('Error fetching latest articles:', error);
      setLatestError(error.message || 'Failed to fetch latest articles');
    } finally {
      setIsLoadingLatest(false);
    }
  }, [filters.section]);

  // Function to fetch popular articles
  const fetchPopular = useCallback(async () => {
    setIsLoadingPopular(true);
    setPopularError(null);
    try {
      console.log('Fetching popular articles...');
      const articles = await fetchMostPopular(filters.timeRange);
      console.log('Popular articles received:', articles);
      
      // Filter to only include articles from the current day
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today
      
      const todaysArticles = articles.filter(article => {
        const pubDate = new Date(article.published_date || article.pub_date);
        return pubDate >= today;
      });
      
      console.log(`Filtered to ${todaysArticles.length} popular articles from today`);
      
      if (todaysArticles && todaysArticles.length > 0) {
        setPopularArticles(todaysArticles);
      } else {
        console.warn('No popular articles returned from API for today');
        // Fall back to all articles if none from today
        setPopularArticles(articles);
      }
    } catch (error) {
      console.error('Error fetching popular articles:', error);
      setPopularError(error.message || 'Failed to fetch popular articles');
    } finally {
      setIsLoadingPopular(false);
    }
  }, [filters.timeRange]);

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
    console.log('Initializing latest articles fetch...');
    fetchLatest();
    // Set up polling for real-time updates (every 60 seconds)
    const intervalId = setInterval(fetchLatest, 60000);
    return () => clearInterval(intervalId);
  }, [fetchLatest]);

  // Fetch popular articles on initial load and when timeRange filter changes
  useEffect(() => {
    console.log('Initializing popular articles fetch...');
    fetchPopular();
    // Popular articles update daily, so no need for frequent polling
  }, [fetchPopular]);

  // Fetch historical articles when search query changes
  useEffect(() => {
    if (filters.searchQuery) {
      fetchHistorical(filters.searchQuery);
    }
  }, [filters.searchQuery, fetchHistorical]);

  // Value to be provided by the context
  const value = {
    latestArticles,
    popularArticles,
    historicalArticles,
    isLoadingLatest,
    isLoadingPopular,
    isLoadingHistorical,
    latestError,
    popularError,
    historicalError,
    filters,
    updateFilters,
    fetchLatest,
    fetchPopular,
    fetchHistorical,
  };

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
}; 