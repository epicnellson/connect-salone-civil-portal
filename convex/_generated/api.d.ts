/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as adminLogs from "../adminLogs.js";
import type * as auth from "../auth.js";
import type * as chat from "../chat.js";
import type * as clear from "../clear.js";
import type * as diagnostic from "../diagnostic.js";
import type * as feedback from "../feedback.js";
import type * as http from "../http.js";
import type * as representatives from "../representatives.js";
import type * as router from "../router.js";
import type * as seed from "../seed.js";
import type * as services from "../services.js";
import type * as stats from "../stats.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  adminLogs: typeof adminLogs;
  auth: typeof auth;
  chat: typeof chat;
  clear: typeof clear;
  diagnostic: typeof diagnostic;
  feedback: typeof feedback;
  http: typeof http;
  representatives: typeof representatives;
  router: typeof router;
  seed: typeof seed;
  services: typeof services;
  stats: typeof stats;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
