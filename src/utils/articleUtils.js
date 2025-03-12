// Section to color mapping
export const sectionColors = {
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
  'realestate': '#607D8B', // Blue Gray
  'opinion': '#9E9E9E',   // Gray
  'default': '#424242'    // Dark Gray
};

// Additional vibrant colors for sections without predefined colors
const additionalColors = [
  '#00BCD4', // Cyan
  '#673AB7', // Deep Purple
  '#CDDC39', // Lime
  '#2196F3', // Blue
  '#009688', // Teal
  '#FFC107', // Amber
  '#9C27B0', // Purple
  '#FF5722', // Deep Orange
  '#4CAF50', // Green
  '#3F51B5', // Indigo
  '#E91E63', // Pink
  '#8BC34A', // Light Green
  '#00BCD4', // Cyan
  '#FF9800', // Orange
  '#9E9E9E', // Grey
  '#607D8B'  // Blue Grey
];

// Cache for dynamically assigned colors to ensure consistency
const dynamicColorCache = {};
let colorIndex = 0;

// Generate a hash code from a string (for consistent color mapping)
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

// Get color for a section
export const getSectionColor = (section) => {
  if (!section) return sectionColors.default;
  
  const normalizedSection = section.toLowerCase();
  
  // If we have a predefined color, use it
  if (sectionColors[normalizedSection]) {
    return sectionColors[normalizedSection];
  }
  
  // If we've already assigned a dynamic color to this section, reuse it
  if (dynamicColorCache[normalizedSection]) {
    return dynamicColorCache[normalizedSection];
  }
  
  // Assign a new color from the additional colors array
  // Use consistent hash-based assignment so the same section always gets the same color
  const hash = hashCode(normalizedSection);
  const color = additionalColors[hash % additionalColors.length];
  
  // Cache the color for future use
  dynamicColorCache[normalizedSection] = color;
  
  return color;
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