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
}

export default nextConfig
