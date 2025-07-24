import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircularProgress } from "./circular-progress";
import { Users, GraduationCap, BookOpen } from "lucide-react";

export function FacultyStatsCard({ 
  totalStudents = 156,
  activeStudents = 142,
  avgCompletion = 76,
  classes = [
    { code: "CS101", students: 38, completion: 87 },
    { code: "CS201", students: 42, completion: 74 },
    { code: "CS301", students: 34, completion: 69 },
    { code: "CS401", students: 42, completion: 82 }
  ]
}) {
  const activePercentage = Math.round((activeStudents / totalStudents) * 100);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">Teaching Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Circular Progress for Student Activity */}
          <div className="flex flex-col items-center space-y-4">
            <CircularProgress 
              value={activeStudents} 
              max={totalStudents} 
              size={180}
              strokeWidth={12}
            >
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">{activeStudents}</div>
                <div className="text-sm text-muted-foreground">/{totalStudents}</div>
                <div className="flex items-center justify-center gap-1 mt-2 text-primary">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">Active</span>
                </div>
              </div>
            </CircularProgress>
            
            <div className="text-center space-y-1">
              <div className="text-2xl font-bold text-success">{avgCompletion}%</div>
              <div className="text-sm text-muted-foreground">Avg. Completion</div>
            </div>
          </div>

          {/* Class Breakdown */}
          <div className="flex-1 space-y-6">
            {classes.map((classItem, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant="outline"
                      className="min-w-[70px] justify-center text-xs font-bold"
                    >
                      {classItem.code}
                    </Badge>
                    <span className="text-2xl font-bold text-foreground">
                      {classItem.students}
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      students
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="h-2 bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                    style={{ width: `${classItem.completion}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Course Progress</span>
                  <span>{classItem.completion}% completed</span>
                </div>
              </div>
            ))}
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="font-medium">Overall Teaching Performance</span>
                </div>
                <span className="font-bold text-primary">{avgCompletion}% Success Rate</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}