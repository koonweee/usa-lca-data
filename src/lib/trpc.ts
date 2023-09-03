import type { ServerRouter } from "@/server/router";
import { createReactQueryHooks } from "@trpc/react";

// trpc hook to make API calls
export const trpc = createReactQueryHooks<ServerRouter>();
