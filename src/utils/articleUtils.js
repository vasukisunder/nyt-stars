// Section to color mapping
export const sectionColors = {
  // Core sections
  'world': '#4285F4',     // Blue
  'us': '#34A853',        // Green
  'politics': '#EA4335',  // Red
  'business': '#FBBC05',  // Yellow
  'technology': '#7B1FA2', // Purple
  'science': '#0097A7',   // Teal
  'health': '#F06292',    // Pink
  'sports': '#FF9800',    // Orange
  'arts': '#9C27B0',      // Deep Purple
  'books': '#795548',     // Brown
  'style': '#E91E63',     // Pink
  'food': '#8BC34A',      // Light Green
  'travel': '#03A9F4',    // Light Blue
  'magazine': '#FF5722',  // Deep Orange

  // Additional sections with manually assigned colors
  'opinion': '#9575CD',   // Light Purple
  'education': '#00BCD4', // Cyan
  'upshot': '#26A69A',    // Teal/Green
  'climate': '#43A047',   // Medium Green
  'multimedia': '#5D4037', // Dark Brown
  'movies': '#D81B60',    // Pink/Red
  'theater': '#C62828',   // Deep Red
  'television': '#6A1B9A', // Deep Purple
  'music': '#283593',     // Indigo
  'obituaries': '#546E7A', // Blue Grey
  'insider': '#0288D1',   // Light Blue
  'nyregion': '#00796B',  // Teal
  'sundayreview': '#FFA000', // Amber
  'fashion': '#AD1457',   // Deep Pink
  'dining': '#AFB42B',    // Light Green/Yellow
  'well': '#00ACC1',      // Light Cyan
  'realestate': '#5E35B1', // Deep Purple
  'automobiles': '#F57C00', // Dark Orange
  'jobs': '#3949AB',      // Indigo
  'podcasts': '#039BE5',  // Light Blue
  'parenting': '#7CB342', // Light Green
  'smarter-living': '#00897B', // Teal
  'game': '#7C4DFF',      // Deep Purple
  'lens': '#6D4C41',      // Brown
  'economy': '#00838F',   // Teal
  'briefing': '#3F51B5',  // Indigo
  'live': '#D32F2F',      // Red
  'media': '#0D47A1',     // Dark Blue
  
  // More sections observed in API data
  'admin': '#607D8B',     // Blue Gray
  'foreign': '#1565C0',   // Strong Blue
  'national': '#2E7D32',  // Forest Green
  'metro': '#00BFA5',     // Teal/Green
  'weekender': '#C0CA33', // Lime
  'culture': '#D84315',   // Deep Orange
  'homepage': '#6200EA',  // Deep Purple
  'research': '#00B8D4',  // Light Cyan
  'international': '#1A237E', // Dark Indigo
  'corrections': '#6D4C41', // Brown
  'letters': '#B388FF',   // Light Purple
  'watches': '#DD2C00',   // Red/Orange
  'personaltech': '#6200EA', // Deep Purple
  'entrepreneurship': '#00695C', // Dark Teal
  'your-money': '#FFC400', // Amber
  'dealbook': '#1B5E20',  // Dark Green 
  'australia': '#0091EA', // Light Blue
  'asia': '#00BFA5',      // Teal/Green
  'europe': '#304FFE',    // Bright Blue
  'africa': '#DD2C00',    // Red/Orange
  'americas': '#1B5E20',  // Dark Green
  'middle-east': '#FF6F00', // Orange
  'universal': '#512DA8', // Deep Purple
  
  // Default color for any unmapped sections
  'default': '#9E9E9E'    // Gray
};

// Get color for a section
export const getSectionColor = (section) => {
  if (!section) return sectionColors.default;
  
  const normalizedSection = section.toLowerCase();
  
  // Return the predefined color or default gray
  return sectionColors[normalizedSection] || sectionColors.default;
};

// Calculate article size based on engagement metrics
export const calculateArticleSize = (article) => {
  // Base size
  let size = 1;
  
  // Adjust size based on available metrics
  if (article.des_facet && article.des_facet.length) {
    // More keywords/descriptors indicates a more substantial article
    size += Math.min(article.des_facet.length * 0.1, 0.5);
  }
  
  // If popular API data (has count metrics)
  if (article.counts) {
    // Adjust based on view count
    if (article.counts.views) {
      size += Math.log10(article.counts.views) * 0.2;
    }
    
    // Adjust based on shares
    if (article.counts.shares) {
      size += Math.log10(article.counts.shares) * 0.3;
    }
  }
  
  // Cap the size
  return Math.min(Math.max(size, 0.5), 3);
};

// Calculate orbit position based on publication time
export const calculateOrbitPosition = (article) => {
  const pubDate = new Date(article.published_date || article.pub_date);
  const now = new Date();
  const hoursDiff = (now - pubDate) / (1000 * 60 * 60);
  
  // Newer articles orbit closer to center
  if (hoursDiff < 1) {
    return 0; // Innermost orbit
  } else if (hoursDiff < 3) {
    return 1; // Second orbit
  } else if (hoursDiff < 6) {
    return 2; // Third orbit
  } else if (hoursDiff < 12) {
    return 3; // Fourth orbit
  } else if (hoursDiff < 24) {
    return 4; // Fifth orbit
  } else {
    return 5; // Outermost orbit
  }
};

// Group articles by section
export const groupArticlesBySection = (articles) => {
  return articles.reduce((groups, article) => {
    const section = article.section || 'default';
    if (!groups[section]) {
      groups[section] = [];
    }
    groups[section].push(article);
    return groups;
  }, {});
};

// Get orbit speed based on freshness
export const getOrbitSpeed = (orbitPosition) => {
  // Innermost orbits move faster
  switch(orbitPosition) {
    case 0: return 0.01;  // Fastest
    case 1: return 0.008;
    case 2: return 0.006;
    case 3: return 0.004;
    case 4: return 0.002;
    case 5: return 0.001; // Slowest
    default: return 0.005;
  }
}; 