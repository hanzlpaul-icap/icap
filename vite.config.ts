import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel sets these on every build. Inlining them at build time lets the client
// tell a preview deployment apart from production with no runtime lookup, and
// lets the production bundle drop the badge entirely via dead-code elimination.
// Locally they are undefined, which surfaces as 'development'.
const deployEnv = process.env.VERCEL_ENV ?? 'development'
const deployRef = process.env.VERCEL_GIT_COMMIT_REF ?? ''
const deploySha = (process.env.VERCEL_GIT_COMMIT_SHA ?? '').slice(0, 7)

export default defineConfig({
  plugins: [react()],
  define: {
    __DEPLOY_ENV__: JSON.stringify(deployEnv),
    __DEPLOY_REF__: JSON.stringify(deployRef),
    __DEPLOY_SHA__: JSON.stringify(deploySha),
  },
})
