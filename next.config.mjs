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
}

export default nextConfig
