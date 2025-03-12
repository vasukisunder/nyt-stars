import axios from 'axios';

// Use environment variable or fallback to the one you're currently using
const NYT_API_KEY = import.meta.env.VITE_NYT_API_KEY || "sgNq3YMInuHu0e2imoGXGGVZ1GckMLof";
const BASE_URL = 'https://api.nytimes.com/svc';

console.log('API Key available:', NYT_API_KEY ? 'Yes (length: ' + NYT_API_KEY.length + ')' : 'No');

if (!NYT_API_KEY) {
  console.error('NYT API KEY is missing. Please add VITE_NYT_API_KEY to your .env file.');
}

// Create axios instances for different NYT APIs
const newswireApi = axios.create({
  baseURL: `${BASE_URL}/news/v3/content`,
  params: {
    'api-key': NYT_API_KEY
  }
});

const popularApi = axios.create({
  baseURL: `${BASE_URL}/mostpopular/v2`,
  params: {
    'api-key': NYT_API_KEY
  }
});

const searchApi = axios.create({
  baseURL: `${BASE_URL}/search/v2`,
  params: {
    'api-key': NYT_API_KEY
  }
});

// Helper function to handle API errors
const handleApiError = (error, apiName) => {
  console.error(`Error in ${apiName}:`, error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('Response status:', error.response.status);
    console.error('Response data:', error.response.data);
    
    // Handle specific error codes
    if (error.response.status === 401) {
      throw new Error(`Authentication failed: Please check that your API key is correct and that you've subscribed to the ${apiName}`);
    } else if (error.response.status === 403) {
      throw new Error(`Access forbidden: Your API key doesn't have permission to use the ${apiName}`);
    } else if (error.response.status === 429) {
      throw new Error(`Rate limit exceeded for ${apiName}. Please try again later.`);
    } else {
      throw new Error(`${apiName} error: ${error.response.data.fault?.faultstring || error.message}`);
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
    throw new Error(`No response from NYT servers. Please check your internet connection.`);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error setting up request:', error.message);
    throw error;
  }
};

// Test the API key with a simple request
export const testApiKey = async () => {
  try {
    console.log('Testing API key with a simple request...');
    const response = await axios.get(`${BASE_URL}/mostpopular/v2/viewed/1.json`, {
      params: {
        'api-key': NYT_API_KEY
      }
    });
    console.log('API key test successful!');
    return { success: true, message: 'API key is valid' };
  } catch (error) {
    console.error('API key test failed:', error);
    return { 
      success: false, 
      message: error.response?.data?.fault?.faultstring || error.message,
      status: error.response?.status
    };
  }
};

// Call the test function immediately
testApiKey().then(result => {
  console.log('API key test result:', result);
});

// Newswire API (real-time articles)
export const fetchLatestArticles = async (source = 'all', section = 'all', limit = 20) => {
  try {
    console.log(`Fetching latest articles: source=${source}, section=${section}, limit=${limit}`);
    const url = `/${source}/${section}.json`;
    console.log(`Newswire API URL: ${newswireApi.defaults.baseURL}${url}`);
    
    const response = await newswireApi.get(url, {
      params: { limit }
    });
    
    if (!response.data || !response.data.results) {
      console.error('Invalid response from Newswire API:', response.data);
      throw new Error('Invalid response from NYT Newswire API');
    }
    
    console.log(`Received ${response.data.results.length} latest articles`);
    return response.data.results;
  } catch (error) {
    return handleApiError(error, 'Newswire API');
  }
};

// Most Popular API (popular articles)
export const fetchMostPopular = async (period = 1) => {
  try {
    console.log(`Fetching most popular articles for period: ${period}`);
    const url = `/viewed/${period}.json`;
    console.log(`Popular API URL: ${popularApi.defaults.baseURL}${url}`);
    
    const response = await popularApi.get(url);
    
    if (!response.data || !response.data.results) {
      console.error('Invalid response from Most Popular API:', response.data);
      throw new Error('Invalid response from NYT Most Popular API');
    }
    
    console.log(`Received ${response.data.results.length} popular articles`);
    return response.data.results;
  } catch (error) {
    return handleApiError(error, 'Most Popular API');
  }
};

// Article Search API (historical articles)
export const searchArticles = async (query, options = {}) => {
  try {
    console.log(`Searching articles with query: "${query}" and options:`, options);
    const url = '/articlesearch.json';
    console.log(`Search API URL: ${searchApi.defaults.baseURL}${url}`);
    
    const response = await searchApi.get(url, {
      params: {
        q: query,
        sort: options.sort || 'newest',
        begin_date: options.beginDate,
        end_date: options.endDate,
        page: options.page || 0,
        ...options
      }
    });
    
    if (!response.data || !response.data.response || !response.data.response.docs) {
      console.error('Invalid response from Article Search API:', response.data);
      throw new Error('Invalid response from NYT Article Search API');
    }
    
    console.log(`Received ${response.data.response.docs.length} search results`);
    return response.data.response.docs;
  } catch (error) {
    return handleApiError(error, 'Article Search API');
  }
}; 