import { Serwist } from "serwist";
import type { SerwistGlobalConfig } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: any;
  }
}
declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [], // Empty array to disable runtime caching
  precacheEntries: self.__SW_MANIFEST || [], // Handle manifest while keeping precaching disabled
});

serwist.addEventListeners();
