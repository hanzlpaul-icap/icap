import { useEffect, useRef, useState } from 'react'
import './hero.css'
import { BrandMark } from '../components/BrandMark'

const VIDEO_SRC = '/media/icap-hero.mp4'
const POSTER_SRC = '/media/icap-hero-poster.jpg'

/** Scroll runway height in viewport-heights. */
const TRACK_VH = 480

type CardSpec = {
  key: string
  from: number
  to: number
  variant: 'hero' | 'glass'
  align: 'left' | 'center' | 'right'
}

const CARDS: CardSpec[] = [
  { key: 'hero', from: 0, to: 0.26, variant: 'hero', align: 'left' },
  { key: 'why', from: 0.3, to: 0.54, variant: 'glass', align: 'right' },
  { key: 'what', from: 0.58, to: 0.8, variant: 'glass', align: 'left' },
  { key: 'catalogue', from: 0.84, to: 1.2, variant: 'glass', align: 'center' },
]

function ramp(p: number, a: number, b: number): number {
  if (b <= a) return p >= b ? 1 : 0
  return Math.min(1, Math.max(0, (p - a) / (b - a)))
}

/**
 * Maivas-style cinematic hero: a fixed full-screen video stage scrubbed by
 * scroll position across a tall runway, with content cards floating in 3D
 * perspective. Falls back to a static poster hero when the video can't play,
 * on small screens, or when the user prefers reduced motion.
 */
export function FlythroughHero({ onExplore }: { onExplore: () => void }) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const releaseRef = useRef<HTMLDivElement | null>(null)
  const progressRef = useRef<HTMLDivElement | null>(null)

  // Portrait phones AND landscape phones (coarse pointer, short viewport)
  // get the static hero — they should never download the scrub video.
  const SMALL_QUERY =
    '(max-width: 767px), ((pointer: coarse) and (max-height: 500px))'

  const [videoFailed, setVideoFailed] = useState(false)
  const [envStatic, setEnvStatic] = useState(() => {
    if (typeof window === 'undefined') return true
    return (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      (window.innerWidth > 0 && window.matchMedia(SMALL_QUERY).matches)
    )
  })
  const [splashGone, setSplashGone] = useState(false)
  const staticMode = envStatic || videoFailed

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const small = window.matchMedia(SMALL_QUERY)
    const update = () =>
      setEnvStatic(
        reduced.matches || (window.innerWidth > 0 && small.matches),
      )
    update()
    reduced.addEventListener('change', update)
    small.addEventListener('change', update)
    return () => {
      reduced.removeEventListener('change', update)
      small.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    if (staticMode) {
      setSplashGone(true)
      return
    }
    const video = videoRef.current
    const track = trackRef.current
    if (!video || !track) return

    let raf = 0
    let disposed = false
    let running = false
    let smoothedTime = 0
    let lastApplied = -1
    let objectUrl = ''
    const controller = new AbortController()

    const hideSplash = () => setSplashGone(true)
    const failToStatic = () => {
      setVideoFailed(true)
      setSplashGone(true)
    }

    video.addEventListener('canplaythrough', hideSplash, { once: true })
    video.addEventListener('error', failToStatic, { once: true })
    const splashTimeout = window.setTimeout(hideSplash, 6000)

    // Fetch the file and play it from a blob URL rather than pointing <video>
    // straight at the network. Cloudflare Pages serves static assets without
    // Range support (a Range request returns the whole file, 200, no
    // Accept-Ranges), which makes a streamed video non-seekable: currentTime
    // assignments are silently ignored and the scrub never moves. A blob is a
    // complete in-memory buffer, so it seeks. Costs no extra bytes — a
    // rangeless server hands over the entire file on any request anyway.
    fetch(VIDEO_SRC, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`video ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        if (disposed) return
        objectUrl = URL.createObjectURL(blob)
        video.src = objectUrl
        video.load()
      })
      .catch(() => {
        if (!disposed) failToStatic()
      })

    const frame = () => {
      if (disposed || !running) return
      const rect = track.getBoundingClientRect()
      const runway = rect.height - window.innerHeight
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(1, runway)))

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        const target = p * Math.max(0, video.duration - 0.08)
        smoothedTime += (target - smoothedTime) * 0.14
        // Never queue a seek while one is in flight — rapid-fire seeks can
        // stall the decoder and produce no painted frames at all.
        if (!video.seeking && Math.abs(smoothedTime - lastApplied) > 1 / 30) {
          video.currentTime = smoothedTime
          lastApplied = smoothedTime
        }
      }

      for (const spec of CARDS) {
        const el = cardRefs.current[spec.key]
        if (!el) continue
        const enter = ramp(p, spec.from, spec.from + 0.05)
        const exit = ramp(p, spec.to - 0.05, spec.to)
        const opacity = spec.key === 'hero' ? 1 - exit : enter * (1 - exit)
        const z = (1 - enter) * -160 + exit * 90
        const y = (1 - enter) * 34 - exit * 26
        el.style.opacity = opacity.toFixed(3)
        el.style.transform = `translate3d(0, ${y.toFixed(1)}px, ${z.toFixed(1)}px)`
        const active = opacity > 0.55
        el.classList.toggle('is-active', active)
        // Invisible cards must not keep focusable controls in the tab order.
        el.inert = !active
      }

      if (releaseRef.current) {
        releaseRef.current.style.opacity = ramp(p, 0.9, 1).toFixed(3)
      }
      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${p.toFixed(4)})`
        progressRef.current.style.opacity = p >= 1 ? '0' : '1'
      }

      raf = requestAnimationFrame(frame)
    }

    // Only run the scrub loop while the runway is on screen — no reason to
    // burn frames (and battery) once the reader is down in the content.
    const startLoop = () => {
      if (!running && !disposed) {
        running = true
        raf = requestAnimationFrame(frame)
      }
    }
    const stopLoop = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const visibility = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) startLoop()
      else stopLoop()
    })
    visibility.observe(track)
    startLoop()

    return () => {
      disposed = true
      stopLoop()
      visibility.disconnect()
      controller.abort()
      window.clearTimeout(splashTimeout)
      video.removeEventListener('canplaythrough', hideSplash)
      video.removeEventListener('error', failToStatic)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [staticMode])

  if (staticMode) {
    return (
      <header className="fly-static" id="top">
        <div
          className="fly-static__bg"
          style={{ backgroundImage: `url(${POSTER_SRC})` }}
          aria-hidden="true"
        />
        <div className="fly-static__scrim" aria-hidden="true" />
        <div className="fly-static__content container">
          <BrandMark tone="light" withText={false} className="fly-hero__mark" />
          <h1>
            Competent. Confident. <em>Compliant.</em>
          </h1>
          <p>
            Professional training and assessment for mining, construction and
            civil workforces across Australia.
          </p>
          <div className="fly-hero__ctas">
            <a className="pill pill--light" href="#contact">
              Book a free consultation
            </a>
            <button className="pill pill--ghost" type="button" onClick={onExplore}>
              Explore courses
            </button>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fly" id="top" ref={rootRef}>
      <div className="fly-stage" aria-hidden="true">
        {/* src is assigned a blob URL in the effect — see the fetch there. */}
        <video
          ref={videoRef}
          className="fly-stage__video"
          poster={POSTER_SRC}
          muted
          playsInline
          preload="none"
        />
        <div className="fly-stage__vignette" />
        <div className="fly-stage__release" ref={releaseRef} />
      </div>

      <div className={`fly-splash${splashGone ? ' gone' : ''}`} aria-hidden="true">
        <BrandMark tone="light" withText={false} className="fly-splash__mark" />
        <span className="fly-splash__label">Industry Compliance &amp; Proficiency Australia</span>
      </div>

      <div className="fly-track" ref={trackRef} style={{ height: `${TRACK_VH}vh` }}>
        <div className="fly-viewport">
          <div
            className="fly-card fly-card--hero"
            ref={(el) => {
              cardRefs.current.hero = el
            }}
          >
            <div className="fly-card__inner">
              <BrandMark tone="light" withText={false} className="fly-hero__mark" />
              <h1>
                Competent. Confident. <em>Compliant.</em>
              </h1>
              <p className="fly-hero__sub">
                Professional training and assessment for mining, construction
                and civil workforces across Australia.
              </p>
              <div className="fly-hero__ctas">
                <a className="pill pill--light" href="#contact">
                  Book a free consultation
                </a>
                <button className="pill pill--ghost" type="button" onClick={onExplore}>
                  Explore courses
                </button>
              </div>
              <span className="fly-hero__hint">Scroll</span>
            </div>
          </div>

          <div
            className="fly-card fly-card--right"
            ref={(el) => {
              cardRefs.current.why = el
            }}
          >
            <div className="fly-card__inner fly-card__inner--glass">
              <span className="kicker">Why competency matters</span>
              <h2>Competency isn&rsquo;t a box to tick.</h2>
              <p>
                It&rsquo;s the foundation of safety and productivity. ICAP helps
                you reduce operational risk, standardise training and
                verification, and lift the confidence of every crew on site.
              </p>
            </div>
          </div>

          <div
            className="fly-card fly-card--left"
            ref={(el) => {
              cardRefs.current.what = el
            }}
          >
            <div className="fly-card__inner fly-card__inner--glass">
              <span className="kicker">What ICAP does</span>
              <h2>Training. Assessment. Workforce capability.</h2>
              <ul className="fly-list">
                <li>Assessment tool development and assessor coaching</li>
                <li>Supervisor and frontline leadership programs</li>
                <li>Positive communication for the whole crew</li>
              </ul>
            </div>
          </div>

          <div
            className="fly-card fly-card--center"
            ref={(el) => {
              cardRefs.current.catalogue = el
            }}
          >
            <div className="fly-card__inner fly-card__inner--glass fly-card__inner--center">
              <span className="kicker">Course catalogue</span>
              <h2>See where your crew stands.</h2>
              <p>
                From assessor coaching to whole-of-crew communication — find
                the right program for every role on your site.
              </p>
              <button className="pill" type="button" onClick={onExplore}>
                View the course catalogue
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="fly-progress" aria-hidden="true">
        <div className="fly-progress__bar" ref={progressRef} />
      </div>
    </header>
  )
}
