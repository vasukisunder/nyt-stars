import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNews } from '../hooks/useNews';
import { getSectionColor } from '../utils/articleUtils';

const ClockContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ClockFace = styled.div`
  position: relative;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClockCenter = styled.div`
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  z-index: 10;
`;

const HourMark = styled.div`
  position: absolute;
  width: 2px;
  height: 10px;
  background-color: white;
  transform-origin: bottom center;
  transform: ${props => `rotate(${props.rotation}deg) translateY(-75px)`};
`;

const HourLabel = styled.div`
  position: absolute;
  color: white;
  font-size: 12px;
  transform-origin: center;
  transform: ${props => `rotate(${props.rotation}deg) translateY(-65px) rotate(${-props.rotation}deg)`};
`;

const ClockHand = styled.div`
  position: absolute;
  width: ${props => props.width || '2px'};
  height: ${props => props.length || '60px'};
  background-color: ${props => props.color || 'white'};
  transform-origin: bottom center;
  transform: ${props => `rotate(${props.rotation}deg) translateY(${-props.length / 2}px)`};
  z-index: 5;
`;

const ArticleDot = styled.div`
  position: absolute;
  width: ${props => props.size || '4px'};
  height: ${props => props.size || '4px'};
  background-color: ${props => props.color || 'white'};
  border-radius: 50%;
  transform: ${props => `rotate(${props.rotation}deg) translateY(-${props.distance}px)`};
  z-index: 2;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    width: ${props => props.size * 1.5 || '6px'};
    height: ${props => props.size * 1.5 || '6px'};
    box-shadow: 0 0 8px ${props => props.color || 'white'};
  }
`;

const TimeDisplay = styled.div`
  position: absolute;
  bottom: 40px;
  width: 100%;
  text-align: center;
  color: white;
  font-size: 12px;
`;

const ClockInterface = () => {
  const { latestArticles } = useNews();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate hours, minutes, seconds for the clock hands
  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const seconds = currentTime.getSeconds();
  
  const hourRotation = (hours % 12) * 30 + minutes * 0.5;
  const minuteRotation = minutes * 6 + seconds * 0.1;
  const secondRotation = seconds * 6;
  
  // Organize articles by hour
  const articlesByHour = latestArticles.reduce((acc, article) => {
    const pubDate = new Date(article.published_date || article.pub_date);
    const hour = pubDate.getHours();
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(article);
    return acc;
  }, {});
  
  return (
    <ClockContainer>
      <ClockFace>
        {/* Hour marks */}
        {[...Array(12)].map((_, i) => (
          <HourMark key={`hour-mark-${i}`} rotation={i * 30} />
        ))}
        
        {/* Hour labels */}
        {[...Array(12)].map((_, i) => (
          <HourLabel key={`hour-label-${i}`} rotation={i * 30}>
            {i === 0 ? '12' : i}
          </HourLabel>
        ))}
        
        {/* Articles dots positioned by publication hour */}
        {Object.entries(articlesByHour).map(([hour, articles]) => 
          articles.map((article, index) => {
            const hourAsNumber = parseInt(hour);
            const rotation = hourAsNumber * 30; // 30 degrees per hour
            const offsetAngle = (index / articles.length) * 15 - 7.5; // Spread articles within the hour
            const distance = 50 + (index % 3) * 8; // Vary distance from center
            const size = 4 + Math.min(articles.length / 10, 1) * 4; // Size increases with number of articles
            
            return (
              <ArticleDot
                key={`article-${hour}-${index}`}
                rotation={rotation + offsetAngle}
                distance={distance}
                size={size}
                color={getSectionColor(article.section)}
                title={article.title}
              />
            );
          })
        )}
        
        {/* Clock hands */}
        <ClockHand length={50} width="3px" rotation={hourRotation} color="rgba(255, 255, 255, 0.8)" />
        <ClockHand length={70} width="2px" rotation={minuteRotation} color="rgba(255, 255, 255, 0.9)" />
        <ClockHand length={75} width="1px" rotation={secondRotation} color="#FDB813" />
        
        {/* Center dot */}
        <ClockCenter />
        
        {/* Time display */}
        <TimeDisplay>
          {currentTime.toLocaleTimeString()}
        </TimeDisplay>
      </ClockFace>
    </ClockContainer>
  );
};

export default ClockInterface; 