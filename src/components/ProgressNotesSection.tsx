"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  Flame, 
  Trophy, 
  Target, 
  Award,
  Calendar,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

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
  };
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  progress: number;
  progressText: string;
}

interface ProgressNotesSectionProps {
  progress: UserProgress | null;
  achievements: Achievement[];
  isLoading: boolean;
}

export default function ProgressNotesSection({ progress, achievements, isLoading }: ProgressNotesSectionProps) {
  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-zinc-100 mb-6">All Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-zinc-800/50 rounded-xl animate-pulse border border-zinc-700/50"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!progress) return null;

  const rarityColors = {
    common: 'border-zinc-600 bg-zinc-800/30',
    rare: 'border-blue-500/30 bg-blue-900/20',
    epic: 'border-purple-500/30 bg-purple-900/20',
    legendary: 'border-yellow-500/30 bg-yellow-900/20',
  };

  const rarityIcons = {
    common: '🥉',
    rare: '🥈',
    epic: '🥇',
    legendary: '👑',
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-zinc-100 mb-6">All Notes</h2>
      
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Level & XP */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-zinc-400 text-sm">Level</p>
                <p className="text-2xl font-bold text-zinc-100">{progress.level}</p>
              </div>
              <Star className="h-8 w-8 text-blue-400" />
            </div>
            <Progress value={progress.xpProgress} className="mb-2" />
            <p className="text-xs text-zinc-400">
              {progress.totalXP % 1000}/{1000} XP to next level
            </p>
          </CardContent>
        </Card>

        {/* Streak */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-zinc-400 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-zinc-100 flex items-center gap-1">
                  {progress.currentStreak}
                  <Flame className="h-6 w-6 text-orange-400" />
                </p>
              </div>
              <Flame className="h-8 w-8 text-orange-400" />
            </div>
            <p className="text-xs text-zinc-400">
              Best: {progress.longestStreak} days
            </p>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-zinc-400 text-sm">Best Score</p>
                <p className="text-2xl font-bold text-zinc-100">{progress.bestScore.toFixed(0)}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
            <p className="text-xs text-zinc-400">
              Avg: {progress.averageScore.toFixed(1)} | {progress.totalInterviews} interviews
            </p>
          </CardContent>
        </Card>

        {/* Weekly Goal */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-zinc-400 text-sm">Weekly Goal</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {progress.weeklyProgress}/{progress.weeklyGoal}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
            <Progress value={progress.retentionMetrics.goalProgress.weekly} className="mb-1" />
            <p className="text-xs text-zinc-400">
              {progress.retentionMetrics.goalProgress.weekly >= 100 ? "Goal completed! 🎉" : `${progress.weeklyGoal - progress.weeklyProgress} more to go`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Achievements */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
              <Award className="h-5 w-5 text-purple-400" />
              Recent Achievements
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
                          <h4 className="font-medium text-sm text-zinc-100 truncate">{achievement.name}</h4>
                          <span className="text-xs">{rarityIcons[achievement.rarity as keyof typeof rarityIcons]}</span>
                        </div>
                        <p className="text-xs text-zinc-400 mb-2">{achievement.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs border-zinc-600 text-zinc-300">
                            +{achievement.xpReward} XP
                          </Badge>
                          <span className="text-xs text-zinc-500">
                            {Math.round(achievement.progress)}% complete
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Award className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                <p className="text-zinc-400">No achievements yet</p>
                <p className="text-zinc-500 text-sm">Complete interviews to unlock achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card className="bg-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-zinc-100">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Progress Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-zinc-300">Total Interviews</span>
                </div>
                <span className="font-semibold text-zinc-100">{progress.totalInterviews}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm text-zinc-300">Total XP</span>
                </div>
                <span className="font-semibold text-zinc-100">{progress.totalXP.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-purple-400" />
                  <span className="text-sm text-zinc-300">Percentile</span>
                </div>
                <span className="font-semibold text-zinc-100">Top {100 - progress.percentile}%</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-zinc-700/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-zinc-300">This Month</span>
                </div>
                <span className="font-semibold text-zinc-100">{progress.monthlyProgress} interviews</span>
              </div>
            </div>

            {/* Motivational Message */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/20">
              <p className="text-sm text-zinc-200 text-center">
                {progress.retentionMetrics?.streakMotivation || "Keep up the great work!"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
