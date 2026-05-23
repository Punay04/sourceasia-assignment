declare module "next-pwa" {
  import type { NextConfig } from "next";

  type PwaOptions = {
    dest?: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: unknown;
    fallbacks?: {
      document?: string;
    };
  };

  function withPWA(options?: PwaOptions): (config: NextConfig) => NextConfig;

  export default withPWA;
}
