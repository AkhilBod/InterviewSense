"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Award, 
  Target, 
  Calendar,
  Zap,
  Star,
  Trophy,
  ChevronRight,
  Clock,
  BarChart3,
  Users,
  Flame,
  CheckCircle
} from 'lucide-react';
import { useSession } from 'next-auth/react';

interface UserProgress {
  totalInterviews: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;
  xpProgress: number;
  bestScore: number;
  averageScore: number;
  weeklyProgress: number;
  monthlyProgress: number;
  weeklyGoal: number;
  monthlyGoal: number;
  percentile: number;
  retentionMetrics: {
    streakMotivation: string;
    goalProgress: {
      weekly: number;
      monthly: number;
    };
    nextMilestone: {
      type: string;
      target: number;
      current: number;
    };
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  unlocked: boolean;
  isNew: boolean;
  progress: number;
  progressText: string;
}

export default function RetentionDashboard() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData();
    }
  }, [session?.user?.id]);

  const fetchDashboardData = async () => {
    try {
      const [progressRes, achievementsRes] = await Promise.all([
        fetch(`/api/progress/${session?.user?.id}`),
        fetch(`/api/achievements/${session?.user?.id}/recommended`),
      ]);

      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setProgress(progressData);
        setRecentSessions(progressData.recentSessions || []);
      }

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json();
        setAchievements(achievementsData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!progress) {
    return <div className="p-6">Failed to load progress data</div>;
  }

  const rarityColors = {
    common: 'border-gray-300 bg-gray-50',
    rare: 'border-blue-300 bg-blue-50',
    epic: 'border-purple-300 bg-purple-50',
    legendary: 'border-yellow-300 bg-yellow-50',
  };

  const rarityIcons = {
    common: '🥉',
    rare: '🥈',
    epic: '🥇',
    legendary: '👑',
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Interviewer'}! 
        </h1>
        <p className="text-gray-600">{progress.retentionMetrics.streakMotivation}</p>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Level & XP */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-blue-100 text-sm">Level</p>
                <p className="text-2xl font-bold">{progress.level}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-300" />
            </div>
            <Progress value={progress.xpProgress} className="mb-2 bg-blue-400" />
            <p className="text-xs text-blue-100">
              {progress.totalXP % 1000}/{1000} XP to next level
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-orange-100 text-sm">Current Streak</p>
                <p className="text-2xl font-bold flex items-center gap-1">
                  {progress.currentStreak}
                  <Flame className="h-6 w-6 text-yellow-300" />
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-300" />
            </div>
            <p className="text-xs text-orange-100">
              Best: {progress.longestStreak} days
            </p>
            {progress.currentStreak === 0 && (
              <Button size="sm" className="mt-2 bg-white text-orange-600 hover:bg-orange-50">
                Start Today!
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-green-100 text-sm">Best Score</p>
                <p className="text-2xl font-bold">{progress.bestScore.toFixed(0)}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-300" />
            </div>
            <p className="text-xs text-green-100">
              Avg: {progress.averageScore.toFixed(1)} | {progress.totalInterviews} interviews
            </p>
          </CardContent>
        </Card>

        {/* Percentile */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-indigo-100 text-sm">Top</p>
                <p className="text-2xl font-bold">{100 - progress.percentile}%</p>
              </div>
              <Users className="h-8 w-8 text-yellow-300" />
            </div>
            <p className="text-xs text-indigo-100">
              Better than {progress.percentile}% of users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Goals & Motivation */}
        <div className="space-y-4">
          {/* Weekly Goal */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-500" />
                Weekly Goal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-medium">
                    {progress.weeklyProgress}/{progress.weeklyGoal} interviews
                  </span>
                </div>
                <Progress value={progress.retentionMetrics.goalProgress.weekly} />
                {progress.retentionMetrics.goalProgress.weekly >= 100 ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Goal completed! Amazing work! 🎉
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">
                    {progress.weeklyGoal - progress.weeklyProgress} more to reach your goal
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Milestone */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5 text-purple-500" />
                Next Milestone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 capitalize">
                    {progress.retentionMetrics.nextMilestone.type}
                  </span>
                  <span className="text-sm font-medium">
                    {progress.retentionMetrics.nextMilestone.current}/
                    {progress.retentionMetrics.nextMilestone.target}
                  </span>
                </div>
                <Progress 
                  value={(progress.retentionMetrics.nextMilestone.current / progress.retentionMetrics.nextMilestone.target) * 100} 
                />
                <p className="text-xs text-gray-500">
                  {progress.retentionMetrics.nextMilestone.target - progress.retentionMetrics.nextMilestone.current} more to unlock achievement!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-yellow-500" />
                Quick Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-between" variant="outline">
                Behavioral Interview
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                Technical Interview
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button className="w-full justify-between" variant="outline">
                Resume Analysis
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Performance */}
        <div className="space-y-4">
          {/* Recent Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-green-500" />
                Recent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentSessions.length > 0 ? (
                <div className="space-y-3">
                  {recentSessions.slice(0, 3).map((session, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          session.score >= 85 ? 'bg-green-500' : 
                          session.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-sm text-gray-600">
                          {new Date(session.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.score?.toFixed(0) || 'N/A'}</span>
                        {session.scoreImprovement > 0 && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-3">
                    View All Sessions
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No sessions yet</p>
                  <Button>Start Your First Interview</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* This Week's Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {progress.weeklyProgress}
                  </div>
                  <div className="text-xs text-blue-600">Interviews</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(progress.retentionMetrics.goalProgress.weekly)}%
                  </div>
                  <div className="text-xs text-green-600">Goal Progress</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Achievements */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements to Unlock
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="space-y-3">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div 
                      key={achievement.id}
                      className={`p-3 rounded-lg border ${rarityColors[achievement.rarity as keyof typeof rarityColors]}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{achievement.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{achievement.name}</h4>
                            <span className="text-xs">{rarityIcons[achievement.rarity as keyof typeof rarityIcons]}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-medium">{achievement.progressText}</span>
                            </div>
                            <Progress value={achievement.progress} />
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline" className="text-xs">
                              +{achievement.xpReward} XP
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {Math.round(achievement.progress)}% complete
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Achievements
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Loading achievements...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Motivational Call-to-Action */}
      {progress.currentStreak === 0 && (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <Flame className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to start your streak?</h3>
            <p className="text-blue-100 mb-4">
              Practice today and begin building your interview skills! Even 10 minutes makes a difference.
            </p>
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Start Practice Session
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
