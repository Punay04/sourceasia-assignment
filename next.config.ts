import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline",
  },
  runtimeCaching: [
    {
      urlPattern: /\/search\/results/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "flight-search",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60,
        },
      },
    },
    {
      urlPattern: /\/bookings/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "bookings",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60,
        },
      },
    },
    {
      urlPattern: /^https?:.*\/_next\/static\//i,
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
    {
      urlPattern: /^https?:.*\.(?:png|jpg|jpeg|svg|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        },
      },
    },
  ],
});

export default withPWAConfig(nextConfig);
