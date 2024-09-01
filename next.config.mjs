/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'logo.clearbit.com',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'img.icons8.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
