import { useEffect } from 'react';
import styled from 'styled-components';
import { colors, fonts, shadows, surfaces } from '../styles/designTokens';

const DetailContainer = styled.div`
  position: fixed;
  inset: 0;
  background-color: ${surfaces.overlay};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(14px);
`;

const DetailCard = styled.div`
  background: rgba(0, 0, 0, 0.55);
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  border-radius: 0;
  box-shadow: ${shadows.login};
  border: 1px solid ${surfaces.glassBorder};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-family: ${fonts.body};
`;

const DetailHeader = styled.div`
  padding: var(--spacing-20);
  background: rgba(0, 0, 0, 0.35);
  border-bottom: 1px solid ${surfaces.glassBorder};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const Title = styled.h2`
  margin: 0;
  font-family: ${fonts.body};
  color: ${colors.ghostWhite};
  font-size: var(--text-heading);
  line-height: var(--leading-heading);
  flex: 1;
`;

const CloseButton = styled.button`
  background: transparent;
  border: 1px solid ${surfaces.glassBorder};
  border-radius: 0;
  color: ${colors.arcticMist};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  margin-left: var(--spacing-20);
  padding: 10px 14px;

  &:hover {
    color: ${colors.comet};
    border-color: rgba(186, 215, 247, 0.28);
  }
`;

const DetailBody = styled.div`
  padding: var(--card-padding);
  overflow-y: auto;
  color: ${colors.comet};
`;

const MetaData = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-20);
  font-size: var(--text-body);
  color: ${colors.azureGlow};
`;

const SectionBadge = styled.div`
  padding: 4px var(--spacing-8);
  border-radius: 0;
  background: rgba(0, 0, 0, 0.45);
  color: ${colors.arcticMist};
  border: 1px solid ${surfaces.glassBorder};
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
`;

const Date = styled.div`
  font-family: ${fonts.mono};
  font-size: var(--text-caption);
  color: ${colors.interstellarGray};
  letter-spacing: 0.05em;
`;

const Abstract = styled.p`
  font-size: var(--text-subheading);
  line-height: var(--leading-subheading);
  margin-bottom: var(--spacing-20);
  color: ${colors.comet};
`;

const ImageContainer = styled.div`
  margin-bottom: var(--spacing-20);

  img {
    width: 100%;
    border-radius: 0;
    border: 1px solid ${surfaces.glassBorder};
  }

  figcaption {
    font-size: var(--text-caption);
    color: ${colors.whisperBlue};
    margin-top: var(--spacing-8);
  }
`;

const Keywords = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--element-gap);
  margin-top: var(--spacing-20);
`;

const Keyword = styled.span`
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid ${surfaces.glassBorder};
  border-radius: 0;
  padding: 4px var(--spacing-12);
  font-size: var(--text-caption);
  color: ${colors.arcticMist};
`;

const ReadMoreLink = styled.a`
  display: inline-block;
  margin-top: var(--spacing-20);
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.45);
  color: ${colors.arcticMist};
  text-decoration: none;
  border: 1px solid ${surfaces.glassBorder};
  border-radius: 0;
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  &:hover {
    color: ${colors.comet};
    border-color: rgba(186, 215, 247, 0.28);
  }
`;

const ArticleDetail = ({ article, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const pubDate = new Date(article.published_date || article.pub_date);
  const formattedDate = pubDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const multimedia = article.multimedia || [];
  const mainImage =
    multimedia.find((media) => media.format === 'superJumbo') ||
    multimedia.find((media) => media.format === 'mediumThreeByTwo440') ||
    multimedia[0];

  return (
    <DetailContainer onClick={onClose}>
      <DetailCard onClick={(e) => e.stopPropagation()}>
        <DetailHeader>
          <Title>{article.title}</Title>
          <CloseButton onClick={onClose} aria-label="Close">
            Close
          </CloseButton>
        </DetailHeader>

        <DetailBody>
          <MetaData>
            <SectionBadge>{article.section || 'News'}</SectionBadge>
            <Date>{formattedDate}</Date>
          </MetaData>

          {mainImage && (
            <ImageContainer>
              <img
                src={
                  mainImage.url.startsWith('http')
                    ? mainImage.url
                    : `https://static01.nyt.com/${mainImage.url}`
                }
                alt={article.title}
              />
              <figcaption>{mainImage.caption}</figcaption>
            </ImageContainer>
          )}

          <Abstract>{article.abstract}</Abstract>

          {article.byline && <p style={{ color: colors.azureGlow }}>{article.byline}</p>}

          {article.des_facet && article.des_facet.length > 0 && (
            <Keywords>
              {article.des_facet.slice(0, 10).map((keyword, index) => (
                <Keyword key={index}>{keyword}</Keyword>
              ))}
            </Keywords>
          )}

          <ReadMoreLink href={article.url} target="_blank" rel="noopener noreferrer">
            Read full article
          </ReadMoreLink>
        </DetailBody>
      </DetailCard>
    </DetailContainer>
  );
};

export default ArticleDetail;
