import { useState } from 'react';
import styled from 'styled-components';
import { useNews } from '../hooks/useNews';
import { sectionColors } from '../utils/articleUtils';

const FilterContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 8px;
  padding: 15px;
  z-index: 100;
  width: 280px;
  color: white;
`;

const FilterTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 5px;
`;

const FilterGroup = styled.div`
  margin-bottom: 15px;
`;

const FilterLabel = styled.div`
  font-size: 14px;
  margin-bottom: 5px;
`;

const SectionFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
`;

const SectionButton = styled.button`
  background-color: ${props => props.active ? props.color : 'rgba(255, 255, 255, 0.1)'};
  color: ${props => props.active ? '#000' : '#fff'};
  border: 1px solid ${props => props.color};
  border-radius: 15px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.color};
    color: #000;
  }
`;

const TimeRangeSelector = styled.select`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #FDB813;
  }
  
  option {
    background-color: #222;
  }
`;

const SearchInput = styled.input`
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px;
  width: 100%;
  font-size: 14px;
  outline: none;
  
  &:focus {
    border-color: #FDB813;
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterControls = () => {
  const { filters, updateFilters } = useNews();
  const [searchValue, setSearchValue] = useState('');
  
  // Common sections in NYT
  const popularSections = [
    'all',
    'world',
    'us',
    'politics',
    'business',
    'technology',
    'science',
    'health',
    'sports',
    'arts'
  ];
  
  const handleSectionClick = (section) => {
    updateFilters({ section });
  };
  
  const handleTimeRangeChange = (e) => {
    updateFilters({ timeRange: parseInt(e.target.value) });
  };
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      updateFilters({ searchQuery: searchValue.trim() });
    }
  };
  
  return (
    <FilterContainer>
      <FilterTitle>Filter Controls</FilterTitle>
      
      <FilterGroup>
        <FilterLabel>Section</FilterLabel>
        <SectionFilters>
          {popularSections.map(section => (
            <SectionButton 
              key={section}
              color={sectionColors[section] || sectionColors.default}
              active={filters.section === section}
              onClick={() => handleSectionClick(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </SectionButton>
          ))}
        </SectionFilters>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel>Time Range (Popular Articles)</FilterLabel>
        <TimeRangeSelector 
          value={filters.timeRange} 
          onChange={handleTimeRangeChange}
        >
          <option value={1}>Last 24 Hours</option>
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
        </TimeRangeSelector>
      </FilterGroup>
      
      <FilterGroup>
        <FilterLabel>Search Historical Articles</FilterLabel>
        <form onSubmit={handleSearchSubmit}>
          <SearchInput 
            type="text"
            placeholder="Enter search term..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>
      </FilterGroup>
    </FilterContainer>
  );
};

export default FilterControls; 