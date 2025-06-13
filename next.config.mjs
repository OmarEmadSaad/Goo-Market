/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["img.freepik.com"],
  },
  matcher: ["/admin/:path*"],
};

export default nextConfig;
