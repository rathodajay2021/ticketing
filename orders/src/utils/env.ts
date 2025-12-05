import { z } from "zod";

if (process.env.NODE_ENV !== "test") {
  // 1. Define Zod schema for your environment variables
  const envSchema = z.object({
    JWT_KEY: z.string().min(1),
    MONGO_URI: z.string().min(1),
    NATS_URL: z.string().min(1),
    NATS_CLUSTER_ID: z.string().min(1),
    NATS_CLIENT_ID: z.string().min(1),
  });

  // 2. Parse process.env (throws if invalid)
  // const parsedEnv = envSchema.parse(process.env);
  envSchema.parse(process.env);
}
// 3. Merge validated values into process.env
// Object.entries(parsedEnv).forEach(([key, value]) => {
//   process.env[key] = String(value);
// });

// 4. Tell TypeScript that these env variables always exist
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_KEY: string;
      MONGO_URI: string;
      NATS_URL: string;
      NATS_CLUSTER_ID: string;
      NATS_CLIENT_ID: string;
    }
  }
}
