import { useState } from 'react'
import { NewsProvider } from './context/NewsContext'
import StarfieldVisualization from './components/OrbitalVisualization'
import ArticleDetail from './components/ArticleDetail'
import { useNews } from './hooks/useNews'
import styled from 'styled-components'
import './App.css'

const AppHeader = styled.header`
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  
  h1 {
    font-size: 18px;
    font-weight: 400;
    color: rgba(255, 255, 255, 0.9);
    margin: 0;
    letter-spacing: 0.03em;
    background-color: rgba(0, 0, 0, 0.4);
    padding: 10px 16px;
    border-radius: 8px;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.05);
  }
`;

// A component to handle article selection
const ArticleManager = () => {
  const [selectedArticle, setSelectedArticle] = useState(null)
  const { latestArticles, popularArticles } = useNews()

  // Function to handle article selection
  const handleArticleSelect = (article) => {
    setSelectedArticle(article)
  }

  // Function to close article detail
  const handleCloseDetail = () => {
    setSelectedArticle(null)
  }

  return (
    <>
      {/* Pass the handleArticleSelect function to child components if needed */}
      {selectedArticle && (
        <ArticleDetail article={selectedArticle} onClose={handleCloseDetail} />
      )}
    </>
  )
}

// Main App component
function App() {
  return (
    <NewsProvider>
      <div className="app-container">
      
        
        <main className="app-content">
          {/* Star field visualization */}
          <StarfieldVisualization />
          
          {/* Article manager for handling article selection */}
          <ArticleManager />
        </main>
      </div>
    </NewsProvider>
  )
}

export default App
