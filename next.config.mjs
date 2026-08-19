/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Re-enabled during the hardening pass. Type errors now fail the build
    // (they were previously silenced with `ignoreBuildErrors: true`).
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
  },
  // Anchor the workspace root to this project so Next does not walk up to a
  // stray lockfile in the user home dir (C:\Users\HP\package-lock.json) and
  // emit a "multiple lockfiles" warning.
  turbopack: {
    root: ".",
  },
}

export default nextConfig
