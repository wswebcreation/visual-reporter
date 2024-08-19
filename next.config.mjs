/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(process.env.NEXT_PUBLIC_BUILD_MODE === "static"
    ? {
        // assetPrefix: "./",
        output: "export",
      }
    : {}),
  // async rewrites() {
  //   return [
  //     {
  //       source: "/tmp/:path*",
  //       destination: "/.tmp/:path*",
  //     },
  //   ];
  // },
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
