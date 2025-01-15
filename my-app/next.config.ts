import type { NextConfig } from "next";
const isDev = process.env.NODE_ENV !== 'production';
const version = require('./package.json').version;

const nextConfig: NextConfig = {
  output: "standalone",
  //for caching optimization, create and use a cloudfront url for the assetPrefix
  images: {
    remotePatterns: [{
      protocol: 'http',
      hostname: 'nexyjs-app-asset-hosting-bucket.s3-website.us-east-2.amazonaws.com',
    }],
  },
  assetPrefix: isDev ? '' : `https://${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${version}`
};

export default nextConfig;
