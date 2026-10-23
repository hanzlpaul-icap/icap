import { useCallback, useEffect, useState } from 'react'
import { EnvBadge } from './components/EnvBadge'
import { Nav } from './components/Nav'
import { FlythroughHero } from './hero/FlythroughHero'
import { Courses } from './sections/Courses'
import { TemplateStore } from './sections/TemplateStore'
import { Results } from './sections/Results'
import { About } from './sections/About'
import { Contact } from './sections/Contact'
import { Footer } from './sections/Footer'
import { CourseExplorer } from './explorer/CourseExplorer'
import './styles/sections.css'

export default function App() {
  /** null = explorer closed; '' = open at overview; slug = open at a course. */
  const [explorerSlug, setExplorerSlug] = useState<string | null>(null)

  const openExplorer = useCallback((slug: string = '') => {
    setExplorerSlug(slug)
    history.pushState(null, '', slug ? `#catalogue/${slug}` : '#catalogue')
  }, [])

  const closeExplorer = useCallback(() => {
    setExplorerSlug(null)
    if (window.location.hash.startsWith('#catalogue')) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  // Keep explorer state in sync with the URL, including back/forward.
  useEffect(() => {
    const applyHash = () => {
      const match = window.location.hash.match(/^#catalogue(?:\/([\w-]+))?$/)
      setExplorerSlug(match ? (match[1] ?? '') : null)
    }
    applyHash()
    window.addEventListener('hashchange', applyHash)
    window.addEventListener('popstate', applyHash)
    return () => {
      window.removeEventListener('hashchange', applyHash)
      window.removeEventListener('popstate', applyHash)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = explorerSlug !== null ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [explorerSlug])

  return (
    <>
      <EnvBadge />
      <Nav />
      <FlythroughHero onExplore={() => openExplorer()} />
      <div className="content" id="content-start">
        <main>
          <Courses onExplore={openExplorer} />
          <TemplateStore />
          <Results />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
      {explorerSlug !== null && (
        <CourseExplorer initialSlug={explorerSlug} onClose={closeExplorer} />
      )}
    </>
  )
}
