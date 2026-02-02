import { QUOTE_MODULE } from "./src/modules/quote";
import { APPROVAL_MODULE } from "./src/modules/approval";
import { COMPANY_MODULE } from "./src/modules/company";
import { loadEnv, defineConfig, Modules } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  admin: {
    // Disable admin on the worker instance to save RAM
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    vite: (config) => {
      return {
        server: {
          host: "0.0.0.0",
          allowedHosts: true,
        },
      }
    },
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // Connect to Redis for background task coordination
    redisUrl: process.env.REDIS_URL,
    // Set role: "server", "worker", or "shared"
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "server" | "worker") || "shared",
    
    databaseDriverOptions: process.env.NODE_ENV === "development" 
      ? { ssl: false } 
      : { ssl: { rejectUnauthorized: false } }, // Required for most cloud DBs
    
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  modules: {
    [COMPANY_MODULE]: {
      resolve: "./src/modules/company", // Fixed path to include /src/
    },
    [QUOTE_MODULE]: {
      resolve: "./src/modules/quote",
    },
    [APPROVAL_MODULE]: {
      resolve: "./src/modules/approval",
    },
    // PRODUCTION UPGRADE: Use Redis instead of In-Memory
    [Modules.CACHE]: {
      resolve: "@medusajs/medusa/cache-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    [Modules.EVENT_BUS]: {
      resolve: "@medusajs/medusa/event-bus-redis",
      options: { redisUrl: process.env.REDIS_URL },
    },
    [Modules.WORKFLOW_ENGINE]: {
      resolve: "@medusajs/medusa/workflow-engine-redis",
      options: { 
        redis: { url: process.env.REDIS_URL } 
      },
    },
  },
});