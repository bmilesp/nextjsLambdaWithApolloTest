import type { NextConfig } from "next";
const isDev = process.env.NODE_ENV !== 'production';
const version = require('./package.json').version;


const nextConfig: NextConfig = {
  //for caching optimization, create and use a cloudfront url for the assetPrefix
  assetPrefix: isDev ? '' : `https://${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET_NAME}/${version}`
};

export default nextConfig;
