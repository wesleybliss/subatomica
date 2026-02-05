/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: {
        // false
        position: 'bottom-right',
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        unoptimized: true,
    },
    
    transpilePackages: ['react-wire-persisted'],
    experimental: { externalDir: true },
}

export default nextConfig
