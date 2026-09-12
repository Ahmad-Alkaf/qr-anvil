import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;
let reservationCreationRatelimit: Ratelimit | null = null;
let reservationMutationRatelimit: Ratelimit | null = null;

function getRatelimit() {
  if (ratelimit) return ratelimit;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: true,
    prefix: "qr-anvil",
  });

  return ratelimit;
}

export async function checkRateLimit(identifier: string): Promise<{ success: boolean }> {
  const rl = getRatelimit();
  if (!rl) return { success: true };

  const result = await rl.limit(identifier);
  return { success: result.success };
}

function createRatelimit(
  limit: number,
  window: "1 m" | "1 h",
  prefix: string
): Ratelimit | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, window),
    analytics: true,
    prefix,
  });
}

/** Limit permanent short-code claims more strictly than normal API traffic. */
export async function checkReservationCreationRateLimit(
  userId: string
): Promise<{ success: boolean }> {
  reservationCreationRatelimit ??= createRatelimit(
    30,
    "1 h",
    "qr-anvil:reservation-create"
  );
  if (!reservationCreationRatelimit) return { success: true };
  const result = await reservationCreationRatelimit.limit(userId);
  return { success: result.success };
}

/** Allow normal keepalive and activation traffic, but stop request floods. */
export async function checkReservationMutationRateLimit(
  userId: string
): Promise<{ success: boolean }> {
  reservationMutationRatelimit ??= createRatelimit(
    60,
    "1 m",
    "qr-anvil:reservation-mutate"
  );
  if (!reservationMutationRatelimit) return { success: true };
  const result = await reservationMutationRatelimit.limit(userId);
  return { success: result.success };
}
