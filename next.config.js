const { DeleteSourceMapsPlugin } = require("webpack-delete-sourcemaps-plugin");

const isPro = process.env.NODE_ENV === "production";
const isDev = process.env.NODE_ENV === "development";

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  productionBrowserSourceMaps: false,
  trailingSlash: false,
  httpAgentOptions: {
    keepAlive: false
  },
  eslint: {
    ignoreDuringBuilds: false
  },
  webpack: (config, { isServer }) => {
    config.plugins.push(new DeleteSourceMapsPlugin({ isServer, keepServerSourcemaps: true }));
    if (isPro) {
      config.cache = false;
    }
    return config;
  }
};

module.exports = nextConfig;
