import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NewsProvider } from './context/NewsContext'
import StarfieldVisualization from './components/OrbitalVisualization'
import ArticleDetail from './components/ArticleDetail'
import IntroScreen from './components/IntroScreen'
import { useNews } from './hooks/useNews'
import './App.css'

const ArticleManager = () => {
  const [selectedArticle, setSelectedArticle] = useState(null)

  const handleCloseDetail = () => {
    setSelectedArticle(null)
  }

  return (
    <>
      {selectedArticle && (
        <ArticleDetail article={selectedArticle} onClose={handleCloseDetail} />
      )}
    </>
  )
}

function App() {
  const [hasEntered, setHasEntered] = useState(false)

  return (
    <NewsProvider>
      <AnimatePresence mode="wait">
        {!hasEntered && (
          <IntroScreen key="intro" onEnter={() => setHasEntered(true)} />
        )}
      </AnimatePresence>

      {hasEntered && (
        <motion.div
          className="app-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: 'easeOut' }}
        >
          <main className="app-content">
            <StarfieldVisualization />
            <ArticleManager />
          </main>
        </motion.div>
      )}
    </NewsProvider>
  )
}

export default App
