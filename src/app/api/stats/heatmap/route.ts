import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cache, cacheKeys } from '@/lib/cache';

// GET /api/stats/heatmap — Get daily activity counts for the calendar heatmap
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ── Try cache first (5 min TTL) ──
    const cacheKey = cacheKeys.heatmap(user.id);
    const cached = await cache.get<{ heatmap: { day: string; count: number }[] }>(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    // Get activity counts grouped by day
    const activities = await (prisma as any).activityLog.groupBy({
      by: ['createdAt'],
      where: {
        userId: user.id,
        createdAt: { gte: oneYearAgo },
      },
      _count: { id: true },
    });

    // Since Prisma groupBy on DateTime is tricky, let's query raw activities and group in JS
    const rawActivities = await (prisma as any).activityLog.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: oneYearAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dayCounts: Record<string, number> = {};
    for (const act of rawActivities) {
      const day = new Date(act.createdAt).toISOString().split('T')[0];
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }

    const heatmapData = Object.entries(dayCounts).map(([day, count]) => ({
      day,
      count,
    }));

    const payload = { heatmap: heatmapData };

    // Cache for 5 minutes — heatmap data barely changes
    await cache.set(cacheKey, payload, 300);

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Error fetching heatmap data:', error);
    return NextResponse.json({ error: 'Failed to fetch heatmap' }, { status: 500 });
  }
}
