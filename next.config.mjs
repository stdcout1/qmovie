/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        serverComponentsExternalPackages: ["@node-rs/argon2"]
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "image.tmdb.org",
                port: '',
                pathname: '/t/p/**'
            }
        ]
    },
    //TODO: REMOVE THESE
    eslint: {
        ignoreDuringBuilds: true
    },
    typescript: {
        ignoreBuildErrors: true
    },
};

export default nextConfig
