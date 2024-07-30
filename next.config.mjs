/** @type {import('next').NextConfig} */
const nextConfig = {
  // Other configurations...
  async rewrites() {
    return [
      {
        source: "/tmp/:path*",
        destination: "/.tmp/:path*",
      },
    ];
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: "file-loader",
          options: {
            publicPath: "/_next/static/images",
            outputPath: "static/images",
            name: "[name].[ext]",
          },
        },
      ],
    });
    return config;
  },
};

export default nextConfig;
