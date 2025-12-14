import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get usage by service type
    const usage = await prisma.creditLedger.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Group by service type
    const byService = Object.keys(SERVICE_COSTS).reduce(
      (acc, service) => {
        acc[service] = { count: 0, totalCredits: 0 };
        return acc;
      },
      {} as Record<string, { count: number; totalCredits: number }>
    );

    usage.forEach((entry: any) => {
      if (entry.serviceType in byService) {
        byService[entry.serviceType].count++;
        byService[entry.serviceType].totalCredits += entry.creditsDeducted;
      }
    });

    return NextResponse.json({
      recentUsage: usage,
      usageByService: byService,
      totalCreditsUsed: usage.reduce(
        (sum: number, entry: any) => sum + entry.creditsDeducted,
        0
      ),
    });
  } catch (error) {
    console.error("Error fetching credit usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const SERVICE_COSTS = {
  resume_review: 1,
  behavioral_interview: 3,
  technical_interview: 3,
  cover_letter: 1,
  system_design: 4,
  portfolio_review: 3,
};
