/*
  Warnings:

  - You are about to drop the column `duration` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `feedback` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `fillerWords` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `metrics` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the column `scoreImprovement` on the `InterviewSession` table. All the data in the column will be lost.
  - You are about to drop the `Achievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DailyActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResumeAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserAchievement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DailyActivity" DROP CONSTRAINT "DailyActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "ResumeAnalysis" DROP CONSTRAINT "ResumeAnalysis_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_achievementId_fkey";

-- DropForeignKey
ALTER TABLE "UserAchievement" DROP CONSTRAINT "UserAchievement_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserProgress" DROP CONSTRAINT "UserProgress_userId_fkey";

-- AlterTable
ALTER TABLE "InterviewSession" DROP COLUMN "duration",
DROP COLUMN "feedback",
DROP COLUMN "fillerWords",
DROP COLUMN "metrics",
DROP COLUMN "score",
DROP COLUMN "scoreImprovement";

-- DropTable
DROP TABLE "Achievement";

-- DropTable
DROP TABLE "DailyActivity";

-- DropTable
DROP TABLE "ResumeAnalysis";

-- DropTable
DROP TABLE "UserAchievement";

-- DropTable
DROP TABLE "UserProgress";

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "duration" INTEGER,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "improvements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserStats" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActivityDate" TIMESTAMP(3),
    "weeklyGoal" INTEGER NOT NULL DEFAULT 3,
    "weeklyProgress" INTEGER NOT NULL DEFAULT 0,
    "weeklyGoalsMet" INTEGER NOT NULL DEFAULT 0,
    "lastWeekReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bestInterviewScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestResumeScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestTechnicalScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bestBehavioralScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalInterviews" INTEGER NOT NULL DEFAULT 0,
    "totalResumeChecks" INTEGER NOT NULL DEFAULT 0,
    "totalTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "lastScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "recentSessions" JSONB NOT NULL DEFAULT '[]',
    "scoreImprovement" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "streakImprovement" INTEGER NOT NULL DEFAULT 0,
    "strongestArea" TEXT,
    "improvementArea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeSession_userId_createdAt_idx" ON "PracticeSession"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PracticeSession_type_score_idx" ON "PracticeSession"("type", "score");

-- CreateIndex
CREATE UNIQUE INDEX "UserStats_userId_key" ON "UserStats"("userId");

-- CreateIndex
CREATE INDEX "UserStats_dailyStreak_idx" ON "UserStats"("dailyStreak");

-- CreateIndex
CREATE INDEX "UserStats_weeklyProgress_idx" ON "UserStats"("weeklyProgress");

-- CreateIndex
CREATE INDEX "UserStats_bestInterviewScore_idx" ON "UserStats"("bestInterviewScore");

-- CreateIndex
CREATE INDEX "InterviewSession_type_idx" ON "InterviewSession"("type");

-- AddForeignKey
ALTER TABLE "PracticeSession" ADD CONSTRAINT "PracticeSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
