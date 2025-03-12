import { useContext } from 'react';
import { NewsContext } from '../context/NewsContext';

export const useNews = () => {
  const context = useContext(NewsContext);
  if (context === undefined) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
}; 