/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*", // when frontend calls /api/anything
        destination: "https://recruitly-ecommerce-project.onrender.com/api/:path*", // forward to backend
      },
    ];
  },
};

export default nextConfig;
