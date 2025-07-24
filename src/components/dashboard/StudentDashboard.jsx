import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProblemProgressCard } from "@/components/ui/problem-progress-card";
import { ContestRatingChart } from "@/components/ui/contest-rating-chart";
import { StreakActivityMap } from "@/components/ui/streak-activity-map";
import {
  Trophy,
  Code,
  BookOpen,
  Clock,
  TrendingUp,
  Target,
  Calendar,
  Award,
  Zap,
  Brain
} from "lucide-react";

export function StudentDashboard() {
  const recentSubmissions = [
    { problem: "Two Sum", status: "Accepted", time: "2h ago", difficulty: "Easy" },
    { problem: "Binary Tree Traversal", status: "Wrong Answer", time: "4h ago", difficulty: "Medium" },
    { problem: "Longest Substring", status: "Accepted", time: "1d ago", difficulty: "Medium" },
  ];

  const upcomingContests = [
    { name: "Weekly Contest 127", date: "Tomorrow, 10:00 AM", participants: 234 },
    { name: "Algorithms Challenge", date: "Dec 15, 2:00 PM", participants: 156 },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
            <Code className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">510</div>
            <p className="text-xs text-muted-foreground">+23 from last week</p>
          </CardContent>
        </Card>

        <Card className="bg-success/5 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">73.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-warning/5 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contest Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">#1,247</div>
            <p className="text-xs text-muted-foreground">Top 15% globally</p>
          </CardContent>
        </Card>

        <Card className="bg-accent/5 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">47 days</div>
            <p className="text-xs text-muted-foreground">Personal best!</p>
          </CardContent>
        </Card>
      </div>

      {/* Problem Solving Progress & Contest Rating */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProblemProgressCard 
          solved={510}
          total={3625}
          attempting={8}
          difficulties={{
            easy: { solved: 162, total: 886 },
            medium: { solved: 287, total: 1884 },
            hard: { solved: 61, total: 855 }
          }}
        />
        <ContestRatingChart />
      </div>

      {/* Problem Solving Activity - Full Width */}
      <StreakActivityMap />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions.map((submission, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{submission.problem}</span>
                    <span className="text-xs text-muted-foreground">{submission.time}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge 
                      variant={submission.difficulty === 'Easy' ? 'secondary' : submission.difficulty === 'Medium' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {submission.difficulty}
                    </Badge>
                    <Badge 
                      variant={submission.status === 'Accepted' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-3">
              View All Submissions
            </Button>
          </CardContent>
        </Card>

        {/* Skills Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Skills Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { skill: "Dynamic Programming", progress: 78, problems: 45 },
                { skill: "Graphs & Trees", progress: 62, problems: 38 },
                { skill: "Array & Strings", progress: 89, problems: 67 },
                { skill: "Binary Search", progress: 54, problems: 23 }
              ].map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{skill.skill}</span>
                    <span className="text-xs text-muted-foreground">{skill.problems} solved</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {skill.progress}%
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View Detailed Analysis
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Contests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Contests
          </CardTitle>
          <CardDescription>
            Join contests to improve your ranking and skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcomingContests.map((contest, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{contest.name}</h4>
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">{contest.date}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs">{contest.participants} participants</span>
                  <Button size="sm">Register</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}