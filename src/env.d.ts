/**
 * Build-time constants injected by `define` in vite.config.ts.
 *
 * On Vercel these come from the system environment variables it sets for every
 * build. Locally they fall back to 'development' / empty strings.
 */
declare const __DEPLOY_ENV__: 'production' | 'preview' | 'development'
declare const __DEPLOY_REF__: string
declare const __DEPLOY_SHA__: string
