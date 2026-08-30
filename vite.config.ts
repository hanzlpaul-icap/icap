import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel sets these on every build. Inlining them at build time lets the client
// tell a preview deployment apart from production with no runtime lookup, and
// lets the production bundle drop the badge entirely via dead-code elimination.
// Locally they are undefined, which surfaces as 'development'.
const deployEnv = process.env.VERCEL_ENV ?? 'development'
const deployRef = process.env.VERCEL_GIT_COMMIT_REF ?? ''
const deploySha = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7)

// The site's canonical origin, used for canonical/og tags.
//
// VERCEL_PROJECT_PRODUCTION_URL is always the *production* domain even on a
// preview build, and Vercel swaps it to the custom domain once one is attached.
// So this resolves to the temporary .vercel.app host today and to icap.com.au
// automatically once that domain is added — no code change needed.
// SITE_URL overrides it if we ever need to pin the value by hand.
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? ''
const siteUrl = (process.env.SITE_URL ?? (productionHost ? `https://${productionHost}` : '')).replace(/\/$/, '')

/**
 * Injects absolute-URL metadata into index.html at build time, and keeps
 * anything that is not production out of search results.
 */
function htmlMeta(): Plugin {
  return {
    name: 'icap-html-meta',
    transformIndexHtml: {
      order: 'pre',
      handler(html: string) {
        const tags = []

        if (siteUrl) {
          // Canonical always points at production, including from previews, so
          // a stray indexed preview credits the real site rather than competing
          // with it.
          tags.push({ tag: 'link', attrs: { rel: 'canonical', href: `${siteUrl}/` }, injectTo: 'head' as const })
          tags.push({ tag: 'meta', attrs: { property: 'og:url', content: `${siteUrl}/` }, injectTo: 'head' as const })
          tags.push({
            tag: 'meta',
            attrs: { property: 'og:image', content: `${siteUrl}/media/icap-hero-poster.jpg` },
            injectTo: 'head' as const,
          })
        }

        if (deployEnv !== 'production') {
          // Belt and braces alongside Vercel's own preview headers: without
          // this, preview URLs can end up in search results competing with the
          // live site.
          tags.push({
            tag: 'meta',
            attrs: { name: 'robots', content: 'noindex, nofollow' },
            injectTo: 'head' as const,
          })
        }

        return { html, tags }
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), htmlMeta()],
  define: {
    __DEPLOY_ENV__: JSON.stringify(deployEnv),
    __DEPLOY_REF__: JSON.stringify(deployRef),
    __DEPLOY_SHA__: JSON.stringify(deploySha),
  },
})
