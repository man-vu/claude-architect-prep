/// <reference lib="webworker" />
import { CacheFirst, NetworkFirst, Serwist, StaleWhileRevalidate } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (string | { url: string; revision: string | null })[];
};

// Static-export-appropriate caching (the Next server `defaultCache` preset does not
// serve exported HTML documents offline). Route HTML is precached via
// `additionalPrecacheEntries` in next.config; these runtime rules cover the rest.
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: false,
  runtimeCaching: [
    {
      // HTML pages: fresh when online, fall back to cache offline.
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({ cacheName: "pages", networkTimeoutSeconds: 3 }),
    },
    {
      matcher: ({ request }) =>
        request.destination === "style" ||
        request.destination === "script" ||
        request.destination === "worker",
      handler: new StaleWhileRevalidate({ cacheName: "assets" }),
    },
    {
      matcher: ({ request }) =>
        request.destination === "image" || request.destination === "font",
      handler: new CacheFirst({ cacheName: "media" }),
    },
  ],
});
serwist.addEventListeners();
