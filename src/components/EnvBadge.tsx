import './env-badge.css'

/**
 * Shows which deployment you are looking at — but only when it is *not*
 * production.
 *
 * Vercel sets VERCEL_ENV on every build; vite.config.ts inlines it as
 * __DEPLOY_ENV__. On a production build this returns null, so the badge and its
 * markup are absent from the live site entirely rather than merely hidden.
 */
export function EnvBadge() {
  if (__DEPLOY_ENV__ === 'production') return null

  const isPreview = __DEPLOY_ENV__ === 'preview'

  return (
    <div
      className={`env-badge ${isPreview ? 'env-badge--preview' : 'env-badge--local'}`}
      role="status"
      aria-live="off"
      aria-label={`${isPreview ? 'Preview' : 'Local development'} build — not the production site`}
    >
      <span className="env-badge__label">{isPreview ? 'Preview' : 'Local dev'}</span>
      {__DEPLOY_REF__ && <span className="env-badge__meta">{__DEPLOY_REF__}</span>}
      {__DEPLOY_SHA__ && <span className="env-badge__meta">{__DEPLOY_SHA__}</span>}
      <span className="env-badge__note">not production</span>
    </div>
  )
}
