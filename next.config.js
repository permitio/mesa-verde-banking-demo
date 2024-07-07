/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://api.permit.io/v2/:path*", // Proxy to external API
      },
    ];
  },
};

module.exports = nextConfig;
