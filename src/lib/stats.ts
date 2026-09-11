import { prisma } from "./prisma";

export {formatCount} from './format-count';

export interface SiteStats {
  qrCount: number;
  userCount: number;
  scanCount: number;
}

const MIN_PUBLIC_USER_COUNT = 100;

/**
 * Site-wide counters shown on the home and about pages.
 * Returns null when the database is unreachable so a DB outage
 * (or a build without DATABASE_URL) never breaks page rendering.
 */
export async function getSiteStats(): Promise<SiteStats | null> {
  // The Docker build has no database. Skip the query instead of logging
  // a connection error; the page is revalidated after deploy.
  if (process.env.NEXT_PHASE === "phase-production-build") return null;

  try {
    const userCount = await prisma.user.count();
    if (userCount < MIN_PUBLIC_USER_COUNT) return null;

    const [qrCount, scanCount] = await Promise.all([
      prisma.qRGenEvent.count(),
      prisma.scan.count(),
    ]);
    return { qrCount, userCount, scanCount };
  } catch (error) {
    console.error("Site stats unavailable:", error);
    return null;
  }
}
