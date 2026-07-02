/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: ["three"],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
