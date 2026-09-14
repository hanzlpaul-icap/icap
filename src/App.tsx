import { useCallback, useEffect, useState } from 'react'
import { EnvBadge } from './components/EnvBadge'
import { Nav } from './components/Nav'
import { FlythroughHero } from './hero/FlythroughHero'
import { Courses } from './sections/Courses'
import { TemplateStore } from './sections/TemplateStore'
import { Results } from './sections/Results'
import { About } from './sections/About'
import { Contact, type OrderRequest } from './sections/Contact'
import { Footer } from './sections/Footer'
import { CourseExplorer } from './explorer/CourseExplorer'
import './styles/sections.css'

export default function App() {
  /** null = explorer closed; '' = open at overview; slug = open at a course. */
  const [explorerSlug, setExplorerSlug] = useState<string | null>(null)

  /**
   * The product a visitor asked to order, handed to the contact form. It lives
   * here because the store and the form are siblings — the same reason
   * onExplore does.
   */
  const [order, setOrder] = useState<OrderRequest | null>(null)

  const openExplorer = useCallback((slug: string = '') => {
    setExplorerSlug(slug)
    history.pushState(null, '', slug ? `#catalogue/${slug}` : '#catalogue')
  }, [])

  const requestOrder = useCallback((next: OrderRequest) => {
    setOrder(next)
    // The pack cards are anchors to #contact, so the browser handles the jump.
    // The machine rows are buttons and need moving there explicitly.
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })
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
          <TemplateStore onOrder={requestOrder} />
          <Results />
          <About />
          <Contact order={order} onClearOrder={() => setOrder(null)} />
        </main>
        <Footer />
      </div>
      {explorerSlug !== null && (
        <CourseExplorer initialSlug={explorerSlug} onClose={closeExplorer} />
      )}
    </>
  )
}
