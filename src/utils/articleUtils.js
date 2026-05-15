// Section colors — distinct muted blues within AuthKit palette (design.md)
export const sectionColors = {
  'world': '#98c0ef',
  'us': '#d8ecf8',
  'politics': '#7e92b8',
  'business': '#c7d3ea',
  'technology': '#b6d9fc',
  'science': '#88b8e8',
  'health': '#a8b0e0',
  'sports': '#9eb8d8',
  'arts': '#a890d8',
  'books': '#8a9cc8',
  'style': '#c0b0e8',
  'food': '#7eb0c8',
  'travel': '#7ac0e8',
  'magazine': '#b898e0',

  'opinion': '#9a88d8',
  'education': '#78c8f0',
  'upshot': '#8aa0d8',
  'climate': '#6ea8c0',
  'multimedia': '#7888a8',
  'movies': '#c088d0',
  'theater': '#a878c0',
  'television': '#8870d0',
  'music': '#6888e0',
  'obituaries': '#8898a8',
  'insider': '#68b0f0',
  'nyregion': '#5a98b8',
  'sundayreview': '#c8c0f0',
  'fashion': '#c080c8',
  'dining': '#80b0b8',
  'well': '#48c0d8',
  'realestate': '#8878d0',
  'automobiles': '#a8a0e0',
  'jobs': '#5878d0',
  'podcasts': '#60b0f8',
  'parenting': '#88b8d8',
  'smarter-living': '#48a8b0',
  'game': '#8878f0',
  'lens': '#8080b0',
  'economy': '#4088a8',
  'briefing': '#5878e8',
  'live': '#9870c0',
  'media': '#4868c8',

  'admin': '#7080a0',
  'foreign': '#6890e8',
  'national': '#60a0c0',
  'metro': '#50c0c8',
  'weekender': '#a8c8e8',
  'culture': '#b070d0',
  'homepage': '#7868f0',
  'research': '#58d0f0',
  'international': '#4868b8',
  'corrections': '#8888b0',
  'letters': '#b0a0f0',
  'watches': '#c080b8',
  'personaltech': '#7060f0',
  'entrepreneurship': '#3898a8',
  'your-money': '#c8c0f0',
  'dealbook': '#4880a0',
  'australia': '#58b0f0',
  'asia': '#50c8c8',
  'europe': '#5888f0',
  'africa': '#c068a8',
  'americas': '#5090b0',
  'middle-east': '#b898e0',
  'universal': '#5848c0',

  'default': '#9da7ba',
};

export const getSectionColor = (section) => {
  if (!section) return sectionColors.default;
  const normalizedSection = section.toLowerCase();
  return sectionColors[normalizedSection] || sectionColors.default;
};

export const calculateArticleSize = (article) => {
  let size = 1;

  if (article.des_facet && article.des_facet.length) {
    size += Math.min(article.des_facet.length * 0.1, 0.5);
  }

  if (article.counts) {
    if (article.counts.views) {
      size += Math.log10(article.counts.views) * 0.2;
    }
    if (article.counts.shares) {
      size += Math.log10(article.counts.shares) * 0.3;
    }
  }

  return Math.min(Math.max(size, 0.5), 3);
};

export const calculateOrbitPosition = (article) => {
  const pubDate = new Date(article.published_date || article.pub_date);
  const now = new Date();
  const hoursDiff = (now - pubDate) / (1000 * 60 * 60);

  if (hoursDiff < 1) return 0;
  if (hoursDiff < 3) return 1;
  if (hoursDiff < 6) return 2;
  if (hoursDiff < 12) return 3;
  if (hoursDiff < 24) return 4;
  return 5;
};

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

export const getOrbitSpeed = (orbitPosition) => {
  switch (orbitPosition) {
    case 0: return 0.01;
    case 1: return 0.008;
    case 2: return 0.006;
    case 3: return 0.004;
    case 4: return 0.002;
    case 5: return 0.001;
    default: return 0.005;
  }
};
