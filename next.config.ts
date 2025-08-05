import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// TypeScript and ESLint configurations
	typescript: {
		ignoreBuildErrors: true,
	},
	eslint: {
		ignoreDuringBuilds: true,
	},

	// Image optimization configurations
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'placehold.co',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'zvcakriarjyfojikkhzm.supabase.co',
				port: '',
				pathname: '/storage/v1/object/public/**',
			},
		],
		domains: ['www.static-src.com', 'zvcakriarjyfojikkhzm.supabase.co', 'picsum.photos'],
	},

	serverExternalPackages: ['@prisma/client', 'bcryptjs', 'jsonwebtoken'],

	// Security headers
	async headers() {
		return [
			{
				source: '/(.*)',
				headers: [
					{
						key: 'X-DNS-Prefetch-Control',
						value: 'on',
					},
					{
						key: 'Strict-Transport-Security',
						value: 'max-age=63072000; includeSubDomains; preload',
					},
					{
						key: 'X-XSS-Protection',
						value: '1; mode=block',
					},
					{
						key: 'X-Frame-Options',
						value: 'SAMEORIGIN',
					},
					{
						key: 'X-Content-Type-Options',
						value: 'nosniff',
					},
					{
						key: 'Referrer-Policy',
						value: 'origin-when-cross-origin',
					},
				],
			},
		];
	},
};

export default nextConfig;
