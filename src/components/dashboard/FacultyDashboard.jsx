import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FacultyStatsCard } from "@/components/ui/faculty-stats-card";
import {
  Users,
  BookOpen,
  Trophy,
  FileText,
  Plus,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Award
} from "lucide-react";

export function FacultyDashboard() {
  const recentActivity = [
    { action: "New student joined CS101", time: "2h ago", type: "student" },
    { action: "Contest 'Binary Trees' ended", time: "4h ago", type: "contest" },
    { action: "Exam results published for DS Course", time: "1d ago", type: "exam" },
  ];

  const activeContests = [
    { name: "Data Structures Final", students: 45, endTime: "2h remaining" },
    { name: "Algorithm Design Contest", students: 28, endTime: "1d 4h remaining" },
  ];

  return (
    <div className="space-y-6">
      {/* Professional Teaching Overview */}
      <FacultyStatsCard 
        totalStudents={156}
        activeStudents={142}
        avgCompletion={78}
        classes={[
          { code: "CS101", students: 38, completion: 87 },
          { code: "CS201", students: 42, completion: 74 },
          { code: "CS301", students: 34, completion: 69 },
          { code: "CS401", students: 42, completion: 82 }
        ]}
      />

      {/* Enhanced Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">156</div>
            <p className="text-xs text-muted-foreground">+12 this semester</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10 border-success/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">4</div>
            <p className="text-xs text-muted-foreground">CS101, CS201, CS301, CS401</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contests</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">3</div>
            <p className="text-xs text-muted-foreground">2 ending today</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">78%</div>
            <p className="text-xs text-muted-foreground">Class completion avg</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to manage your classes and contests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button className="h-auto p-4 flex flex-col items-center gap-2">
              <Plus className="h-5 w-5" />
              <span className="text-sm">Create Contest</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm">New Class</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-sm">Schedule Exam</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Contests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Active Contests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeContests.map((contest, index) => (
                <div key={index} className="p-3 rounded-lg border bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{contest.name}</h4>
                    <Badge variant="secondary">{contest.students} students</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{contest.endTime}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">View Results</Button>
                    <Button size="sm" variant="outline">Monitor</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage All Contests
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${
                    activity.type === 'student' ? 'bg-primary/20' :
                    activity.type === 'contest' ? 'bg-warning/20' : 'bg-success/20'
                  }`}>
                    {activity.type === 'student' && <Users className="h-3 w-3" />}
                    {activity.type === 'contest' && <Trophy className="h-3 w-3" />}
                    {activity.type === 'exam' && <FileText className="h-3 w-3" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performing Students
          </CardTitle>
          <CardDescription>Students with highest problem-solving activity this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Alex Johnson", class: "CS301", solved: 23, streak: 12 },
              { name: "Sarah Chen", class: "CS201", solved: 19, streak: 8 },
              { name: "Mike Rodriguez", class: "CS401", solved: 17, streak: 15 },
              { name: "Emma Davis", class: "CS101", solved: 16, streak: 6 },
              { name: "David Kim", class: "CS301", solved: 14, streak: 9 },
              { name: "Lisa Wang", class: "CS201", solved: 13, streak: 11 }
            ].map((student, index) => (
              <div key={index} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{student.name}</h4>
                  <Badge variant="outline">{student.class}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle className="h-3 w-3" />
                    {student.solved} solved
                  </span>
                  <span className="flex items-center gap-1 text-accent">
                    <TrendingUp className="h-3 w-3" />
                    {student.streak} day streak
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}