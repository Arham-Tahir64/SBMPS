/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@sdmps/api-client",
    "@sdmps/domain",
    "@sdmps/scene",
    "@sdmps/ui"
  ]
};

export default nextConfig;
