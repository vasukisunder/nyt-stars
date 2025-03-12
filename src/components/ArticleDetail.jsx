import { useEffect } from 'react';
import styled from 'styled-components';
import { getSectionColor } from '../utils/articleUtils';

const DetailContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
`;

const DetailCard = styled.div`
  background-color: #111;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const DetailHeader = styled.div`
  padding: 20px;
  background-color: ${props => props.color || '#333'};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Title = styled.h2`
  margin: 0;
  color: white;
  font-size: 24px;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  margin-left: 20px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const DetailBody = styled.div`
  padding: 20px;
  overflow-y: auto;
  color: white;
`;

const MetaData = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;
  color: #ccc;
`;

const Section = styled.div`
  padding: 4px 10px;
  border-radius: 15px;
  background-color: ${props => props.color || '#333'};
  color: #000;
  font-weight: bold;
  font-size: 12px;
  text-transform: uppercase;
`;

const Date = styled.div``;

const Abstract = styled.p`
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const ImageContainer = styled.div`
  margin-bottom: 20px;
  
  img {
    width: 100%;
    border-radius: 5px;
  }
  
  figcaption {
    font-size: 12px;
    color: #999;
    margin-top: 5px;
  }
`;

const Keywords = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
`;

const Keyword = styled.span`
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 4px 10px;
  font-size: 12px;
  color: #ccc;
`;

const ReadMoreLink = styled.a`
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #FDB813;
  color: black;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  
  &:hover {
    background-color: #FFD700;
  }
`;

const ArticleDetail = ({ article, onClose }) => {
  // Handle escape key press to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);
  
  if (!article) return null;
  
  // Format date
  const pubDate = new Date(article.published_date || article.pub_date);
  const formattedDate = pubDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Get the section color
  const sectionColor = getSectionColor(article.section);
  
  // Get the multimedia if available
  const multimedia = article.multimedia || [];
  const mainImage = multimedia.find(media => media.format === 'superJumbo') || 
                  multimedia.find(media => media.format === 'mediumThreeByTwo440') ||
                  multimedia[0];
  
  return (
    <DetailContainer onClick={onClose}>
      <DetailCard onClick={e => e.stopPropagation()}>
        <DetailHeader color={sectionColor}>
          <Title>{article.title}</Title>
          <CloseButton onClick={onClose}>×</CloseButton>
        </DetailHeader>
        
        <DetailBody>
          <MetaData>
            <Section color={sectionColor}>
              {article.section || 'News'}
            </Section>
            <Date>{formattedDate}</Date>
          </MetaData>
          
          {mainImage && (
            <ImageContainer>
              <img 
                src={mainImage.url.startsWith('http') ? mainImage.url : `https://static01.nyt.com/${mainImage.url}`} 
                alt={article.title} 
              />
              <figcaption>{mainImage.caption}</figcaption>
            </ImageContainer>
          )}
          
          <Abstract>{article.abstract}</Abstract>
          
          {article.byline && <p>{article.byline}</p>}
          
          {article.des_facet && article.des_facet.length > 0 && (
            <Keywords>
              {article.des_facet.slice(0, 10).map((keyword, index) => (
                <Keyword key={index}>{keyword}</Keyword>
              ))}
            </Keywords>
          )}
          
          <ReadMoreLink href={article.url} target="_blank" rel="noopener noreferrer">
            Read Full Article
          </ReadMoreLink>
        </DetailBody>
      </DetailCard>
    </DetailContainer>
  );
};

export default ArticleDetail; 