import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Billboard, Html } from '@react-three/drei';
import { useNews } from '../hooks/useNews';
import { getSectionColor, sectionColors } from '../utils/articleUtils';
import * as THREE from 'three';
import styled from 'styled-components';

// Neo-modernist styled components
const ErrorContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(10, 10, 15, 0.85);
  color: #ff4444;
  padding: 20px 24px;
  border-radius: 4px;
  max-width: 80%;
  text-align: center;
  z-index: 100;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 300;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 70, 70, 0.2);
`;

const LoadingContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(10, 10, 15, 0.85);
  color: white;
  padding: 20px 24px;
  border-radius: 4px;
  max-width: 80%;
  text-align: center;
  z-index: 100;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 300;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const InfoText = styled.div`
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(10, 10, 15, 0.75);
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 2px;
  z-index: 100;
  font-size: 14px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-weight: 300;
  letter-spacing: 0.03em;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-left: 2px solid rgba(255, 255, 255, 0.3);
`;

// Toggle controls for article filtering - neo modernist style
const ToggleContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(10, 10, 15, 0.8);
  backdrop-filter: blur(10px);
  padding: 16px;
  z-index: 100;
  min-width: 200px;
  max-width: 320px;
  border-radius: 2px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  border-left: 2px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  .toggle-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 16px;
    
    span:first-child {
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 4px;
      color: white;
    }
    
    span:last-child {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
  
  .toggle-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
`;

const ToggleButton = styled.button`
  background-color: ${props => props.active ? props.activeColor : 'rgba(10, 10, 15, 0.6)'};
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 2px;
  cursor: pointer;
  font-weight: ${props => props.active ? '400' : '300'};
  font-size: 14px;
  transition: all 0.2s ease;
  letter-spacing: 0.03em;
  border-left: ${props => props.active ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid transparent'};
  
  &:hover {
    background-color: ${props => props.active ? props.activeColor : 'rgba(255, 255, 255, 0.1)'};
    transform: translateX(2px);
  }
`;

// Article overlay
const ArticleOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(5, 5, 16, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

// Article focus card
const ArticleFocusCard = styled.div`
  background-color: #0a0a1a;
  color: white;
  border-radius: 2px;
  padding: 24px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  border-left: 2px solid rgba(255, 255, 255, 0.3);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  .article-header {
    margin-bottom: 20px;
    
    h2 {
      font-size: 24px;
      margin: 0 0 12px 0;
      line-height: 1.3;
      font-weight: 500;
    }
    
    .section-tag {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
  
  .article-abstract {
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .article-byline {
    font-size: 14px;
    margin-bottom: 20px;
    color: rgba(255, 255, 255, 0.7);
  }
  
  .article-meta {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 24px;
  }
  
  .article-actions {
    display: flex;
    gap: 12px;
    
    .read-more-btn {
      background-color: rgba(0, 120, 255, 0.8);
      color: white;
      text-decoration: none;
      padding: 10px 16px;
      border-radius: 2px;
      font-size: 14px;
      border: none;
      cursor: pointer;
      
      &:hover {
        background-color: rgba(0, 120, 255, 1);
      }
    }
    
    .close-btn {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
      padding: 10px 16px;
      border-radius: 2px;
      font-size: 14px;
      border: none;
      cursor: pointer;
      
      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  }
`;

// Title hover label for stars - increased text size
const StarHoverLabel = styled.div`
  background-color: rgba(10, 10, 15, 0.85);
  color: white;
  padding: 10px 14px;
  border-radius: 2px;
  font-size: 16px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  backdrop-filter: blur(4px);
  white-space: nowrap;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
  border-left: 3px solid;
  transform: translateY(-4px);
  opacity: 0;
  animation: fadeUp 0.2s forwards;
  letter-spacing: 0.01em;
  font-weight: 400;
  
  @keyframes fadeUp {
    to { 
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

// Notification for new articles
const UpdateNotification = styled.div`
  position: absolute;
  top: 80px;
  right: 20px;
  background-color: rgba(0, 120, 255, 0.8);
  color: white;
  padding: 10px 16px;
  border-radius: 2px;
  z-index: 101;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0.03em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-left: 2px solid rgba(255, 255, 255, 0.8);
  transform: translateX(120%);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.3s ease;
  
  &.visible {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Modify the SectionFilterButton to make the color indicator more prominent
const SectionFilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.active ? 'rgba(255, 255, 255, 0.1)' : 'rgba(10, 10, 15, 0.6)'};
  color: white;
  border: none;
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 0;
  cursor: pointer;
  font-weight: ${props => props.active ? '400' : '300'};
  font-size: 13px;
  transition: all 0.2s ease;
  letter-spacing: 0.02em;
  border-left: ${props => props.active ? '2px solid rgba(255, 255, 255, 0.6)' : '2px solid transparent'};
  text-align: left;
  width: 100%;
  text-transform: capitalize;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateX(2px);
  }
`;

// Add a color indicator component for the buttons
const ColorIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
`;

// Container for section filters
const SectionFilterContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

// Background Star component (non-interactive)
const BackgroundStar = ({ position, size }) => {
  const meshRef = useRef();
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      // Subtle twinkling effect
      const pulse = 0.6 + Math.sin(time * 0.2 + position[0] * position[1]) * 0.1;
      meshRef.current.material.opacity = pulse;
    }
  });
  
  return (
    <mesh position={position} scale={[size, size, size]} ref={meshRef}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial 
        color="#ffffff" 
        transparent 
        opacity={0.5}
      />
    </mesh>
  );
};

// Generate static background stars
const BackgroundStars = ({ count = 300 }) => {
  // Create star positions once
  const stars = useMemo(() => {
    const tempStars = [];
    for (let i = 0; i < count; i++) {
      // Position farther away from the center than article stars
      const position = [
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300 - 50
      ];
      
      // Smaller size for background stars
      const size = Math.random() * 0.2 + 0.1;
      
      tempStars.push({
        position,
        size
      });
    }
    return tempStars;
  }, [count]);
  
  return (
    <group>
      {stars.map((star, i) => (
        <BackgroundStar 
          key={`bg-star-${i}`}
          position={star.position}
          size={star.size}
        />
      ))}
    </group>
  );
};

// Article Star component (interactive)
const ArticleStar = ({ article, index, onSelectArticle, isNew }) => {
  const meshRef = useRef();
  const glowRef = useRef();
  const [hovered, setHovered] = useState(false);
  const sectionColor = getSectionColor(article.section);
  const animationProgress = useRef(0);
  
  // Position - stored in a ref to avoid recalculation
  const positionRef = useRef();
  
  // Calculate position only once and store it
  useEffect(() => {
    // Position articles in a distributed pattern
    positionRef.current = [
      (Math.random() - 0.5) * 100,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 100
    ];
  }, []);
  
  // Size - make the stars more visible
  const size = 0.7;
  // Larger invisible hitbox for better clickability
  const hitboxSize = 3;
  
  // Simple twinkling effect
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const time = clock.getElapsedTime();
      // Enhanced pulsing
      const pulse = 1.2 + Math.sin(time * 0.5 + index * 2) * 0.3;
      meshRef.current.material.emissiveIntensity = pulse;
      
      // Special animation for new stars
      if (isNew) {
        // Increment animation progress
        animationProgress.current = Math.min(animationProgress.current + 0.005, 1);
        
        // Add a highlight effect that fades over time (for new stars)
        if (animationProgress.current < 1) {
          const highlightFactor = 1 - animationProgress.current;
          meshRef.current.material.emissiveIntensity = pulse + highlightFactor * 2;
          
          if (glowRef.current) {
            const extraGlow = highlightFactor * 3;
            glowRef.current.scale.set(
              size * (2 + extraGlow),
              size * (2 + extraGlow),
              size * (2 + extraGlow)
            );
            glowRef.current.material.opacity = 0.5 * (1 - animationProgress.current) + 0.3;
          }
        }
      }
      
      // Animate the glow effect
      if (glowRef.current && !isNew) {
        // Pulse the glow slightly larger than the star
        const glowPulse = 1.5 + Math.sin(time * 0.5 + index * 2) * 0.5;
        const hoverBoost = hovered ? 1.5 : 1; // Make glow larger when hovered
        glowRef.current.scale.set(
          size * glowPulse * hoverBoost, 
          size * glowPulse * hoverBoost, 
          size * glowPulse * hoverBoost
        );
        // Fade the glow in and out slightly
        glowRef.current.material.opacity = (0.3 + Math.sin(time * 0.5 + index * 2) * 0.1) * (hovered ? 1.5 : 1);
      }
      
      // Highlight color when hovered
      if (meshRef.current.material) {
        if (hovered) {
          meshRef.current.material.emissive.set(new THREE.Color(sectionColor).lerp(new THREE.Color(1, 1, 1), 0.5));
        } else if (isNew && animationProgress.current < 1) {
          // Brighter color for new stars
          meshRef.current.material.emissive.set(new THREE.Color(sectionColor).lerp(new THREE.Color(1, 1, 1), 0.3 * (1 - animationProgress.current)));
        } else {
          meshRef.current.material.emissive.set(sectionColor);
        }
      }
    }
  });

  // Handle star hover state
  const handlePointerOver = useCallback((e) => {
    e.stopPropagation();
    setHovered(true);
  }, []);
  
  const handlePointerOut = useCallback((e) => {
    e.stopPropagation();
    setHovered(false);
  }, []);

  // Handle click on star to show article
  const handleStarClick = useCallback((e) => {
    e.stopPropagation();
    console.log("Star clicked, showing article:", article.title);
    onSelectArticle(article);
  }, [article, onSelectArticle]);

  return (
    <group position={positionRef.current}>
      {/* Invisible larger hitbox for easier clicking */}
      <mesh
        scale={[hitboxSize, hitboxSize, hitboxSize]}
        onClick={handleStarClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        visible={false}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Glow effect around the star */}
      <mesh
        ref={glowRef}
        scale={[size * 2, size * 2, size * 2]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={sectionColor}
          transparent
          opacity={isNew ? 0.6 : 0.3}
        />
      </mesh>
      
      {/* The actual visible star */}
      <mesh
        ref={meshRef}
        scale={[size, size, size]}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={sectionColor}
          emissive={sectionColor}
          emissiveIntensity={isNew ? 2 : 1.2}
          metalness={0.2}
          roughness={0.3}
        />
      </mesh>
      
      {/* Hover title that appears above the star */}
      {hovered && (
        <Html center position={[0, size * 3, 0]} distanceFactor={10}>
          <StarHoverLabel style={{ borderColor: sectionColor }}>
            {article.title}
          </StarHoverLabel>
        </Html>
      )}
    </group>
  );
};

// Format date for display - utility function 
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Main visualization component
const StarfieldVisualization = () => {
  const { 
    latestArticles, 
    isLoadingLatest, 
    latestError
  } = useNews();
  
  // State for section filtering
  const [selectedSections, setSelectedSections] = useState([]);
  const [showSectionFilter, setShowSectionFilter] = useState(false);
  
  // State for selected article
  const [selectedArticle, setSelectedArticle] = useState(null);
  
  // Track article IDs to detect new articles
  const [knownArticleIds, setKnownArticleIds] = useState(new Set());
  const [newArticles, setNewArticles] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  
  const [articleCount, setArticleCount] = useState(0);

  // Get unique sections from articles
  const uniqueSections = useMemo(() => {
    const sections = new Set();
    
    if (latestArticles?.length) {
      latestArticles.forEach(article => sections.add(article.section));
    }
    
    return [...sections].sort();
  }, [latestArticles]);

  // Toggle a section for filtering
  const toggleSection = useCallback((section) => {
    setSelectedSections(prev => {
      if (prev.includes(section)) {
        return prev.filter(s => s !== section);
      } else {
        return [...prev, section];
      }
    });
  }, []);

  // Handle article selection
  const handleSelectArticle = useCallback((article) => {
    console.log("Article selected:", article.title);
    setSelectedArticle(article);
  }, []);

  // Close article modal
  const handleCloseArticle = useCallback(() => {
    console.log("Closing article modal");
    setSelectedArticle(null);
  }, []);

  // Filter articles based on selected sections
  const filteredArticles = useMemo(() => {
    if (selectedSections.length === 0) {
      return latestArticles;
    }
    return latestArticles?.filter(article => selectedSections.includes(article.section)) || [];
  }, [latestArticles, selectedSections]);

  useEffect(() => {
    if (latestArticles?.length) {
      setArticleCount(latestArticles.length);
    }
  }, [latestArticles]);

  // Track new articles when latestArticles changes
  useEffect(() => {
    if (latestArticles?.length) {
      // Identify new articles
      const currentIds = new Set(latestArticles.map(article => 
        article.uri || article.url || article.id || JSON.stringify(article)
      ));
      
      // Find articles that aren't in our known set
      const newArticleIds = [];
      const newArticlesList = [];
      
      latestArticles.forEach(article => {
        const articleId = article.uri || article.url || article.id || JSON.stringify(article);
        if (!knownArticleIds.has(articleId)) {
          newArticleIds.push(articleId);
          newArticlesList.push(article);
        }
      });
      
      // If we have new articles, show notification
      if (newArticlesList.length > 0 && knownArticleIds.size > 0) {
        setNewArticles(newArticlesList);
        setNotificationCount(newArticlesList.length);
        setShowNotification(true);
        
        // Hide notification after 5 seconds
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
      
      // Update known article IDs
      setKnownArticleIds(prev => {
        const updatedSet = new Set(prev);
        newArticleIds.forEach(id => updatedSet.add(id));
        return updatedSet;
      });
    }
  }, [latestArticles]);

  // Add key press handler for escape to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedArticle) {
        console.log("Escape key pressed, closing article");
        setSelectedArticle(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedArticle]);

  // Display loading state
  if (isLoadingLatest && latestArticles.length === 0) {
    return (
      <LoadingContainer>
        <h3>Loading NYT News Starfield</h3>
        <p>Fetching article data...</p>
        <div className="loading-spinner"></div>
      </LoadingContainer>
    );
  }

  // Display error state
  if (latestError && latestArticles.length === 0) {
    return (
      <ErrorContainer>
        <h3>Error Loading Data</h3>
        <p>{latestError}</p>
        <p>Please check your API key and connection.</p>
      </ErrorContainer>
    );
  }

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Canvas 
        camera={{ position: [0, 0, 50], fov: 60 }} 
        gl={{ antialias: true }}
      >
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 20]} intensity={0.8} />
        
        {/* Background stars (non-interactive) */}
        <BackgroundStars count={400} />
        
        {/* Articles as stars */}
        {filteredArticles && filteredArticles.length > 0 && filteredArticles.map((article, index) => {
          // Check if this article is new
          const articleId = article.uri || article.url || article.id || JSON.stringify(article);
          const isNewArticle = newArticles.some(a => 
            (a.uri || a.url || a.id || JSON.stringify(a)) === articleId
          );
          
          return (
            <ArticleStar 
              key={`article-${index}`} 
              article={article} 
              index={index}
              onSelectArticle={handleSelectArticle}
              isNew={isNewArticle}
            />
          );
        })}
        
        {/* Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={300}
          maxPolarAngle={Math.PI * 0.75}
          dampingFactor={0.1}
          rotateSpeed={0.5}
          zoomSpeed={0.7}
        />
      </Canvas>
      
      {/* Article Overlay (modal) */}
      {selectedArticle && (
        <ArticleOverlay onClick={handleCloseArticle}>
          <ArticleFocusCard onClick={(e) => e.stopPropagation()}>
            <div className="article-header">
              <h2>{selectedArticle.title}</h2>
              <div className="section-tag" style={{ backgroundColor: getSectionColor(selectedArticle.section) }}>
                {selectedArticle.section}
              </div>
            </div>
            
            {selectedArticle.abstract && (
              <p className="article-abstract">{selectedArticle.abstract}</p>
            )}
            
            {selectedArticle.byline && (
              <p className="article-byline">{selectedArticle.byline.original || selectedArticle.byline}</p>
            )}
            
            <div className="article-meta">
              <span>Published: {new Date(selectedArticle.published_date || selectedArticle.pub_date).toLocaleString()}</span>
            </div>
            
            <div className="article-actions">
              <a 
                href={selectedArticle.url || selectedArticle.web_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="read-more-btn"
              >
                Read Full Article
              </a>
              <button onClick={handleCloseArticle} className="close-btn">
                Close
              </button>
            </div>
          </ArticleFocusCard>
        </ArticleOverlay>
      )}
      
      {/* Section filter controls */}
      <ToggleContainer>
        <div className="toggle-header">
          <span>NYT News Observatory</span>
          <span>{articleCount} articles from last 24 hours</span>
        </div>
        
        <div className="toggle-buttons">
          <SectionFilterButton 
            onClick={() => setShowSectionFilter(!showSectionFilter)}
            active={showSectionFilter}
          >
            Filter by Section {showSectionFilter ? '▲' : '▼'}
          </SectionFilterButton>
        </div>
        
        {showSectionFilter && (
          <SectionFilterContainer>
            {uniqueSections.map(section => (
              <SectionFilterButton
                key={section}
                onClick={() => toggleSection(section)}
                active={selectedSections.includes(section)}
              >
                <ColorIndicator style={{ backgroundColor: getSectionColor(section) }} />
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </SectionFilterButton>
            ))}
          </SectionFilterContainer>
        )}
      </ToggleContainer>
      
      {/* New Articles Notification */}
      <UpdateNotification className={showNotification ? 'visible' : ''}>
        🔔 {notificationCount} new articles added
      </UpdateNotification>
      
      {/* Info text */}
      <InfoText>
        {selectedArticle 
          ? 'Press ESC or click outside to close' 
          : 'Hover to see titles • Click on stars to view articles'}
      </InfoText>
    </div>
  );
};

export default StarfieldVisualization; 