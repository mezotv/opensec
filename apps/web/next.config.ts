import "@opensec/env/web";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  reactCompiler: true,
  turbopack: {
    root: new URL("../..", import.meta.url).pathname,
  },
};

export default nextConfig;
