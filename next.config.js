import nextra from "nextra";

const withNextra = nextra({
  theme: "nextra-theme-docs",
  themeConfig: "./theme.config.tsx",
  defaultShowCopyCode: true,
  mdxOptions: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = withNextra({
  images: {
    domains: ["images.unsplash.com", "res.cloudinary.com", "www.octavertexmedia.com"],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"], // Ensure MDX support
  // ✅ Keep both App Router & Page Router active
  reactStrictMode: true,
  swcMinify: true,
  // Add async headers to ensure CORS headers are applied
  async headers() {
    return [
      {
        // Apply these headers to all API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*', // The middleware will override this with the specific origin if needed
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With, Accept, Cache-Control, X-Auth-Token, Origin',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ];
  },
});

export default nextConfig;