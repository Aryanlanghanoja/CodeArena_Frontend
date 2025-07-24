import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";

// Generate activity data organized by weeks
const generateActivityData = () => {
  const weeks = [];
  const today = new Date();
  
  // Start from Sunday of the week that was 52 weeks ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (today.getDay() + 364));
  
  // Generate 53 weeks of data
  for (let week = 0; week < 53; week++) {
    const weekData = [];
    
    // Generate 7 days for each week (Sunday to Saturday)
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (week * 7) + day);
      
      // Skip if date is in the future
      if (date > today) {
        weekData.push(null);
        continue;
      }
      
      // Random activity level (0-4)
      const level = Math.random() > 0.3 ? Math.floor(Math.random() * 5) : 0;
      
      weekData.push({
        date: date.toISOString().split('T')[0],
        level,
        problems: level * Math.floor(Math.random() * 3) + level,
        dayOfWeek: day
      });
    }
    
    weeks.push(weekData);
  }
  
  return weeks;
};

const activityData = generateActivityData();

const getIntensityClass = (level) => {
  const intensities = {
    0: 'bg-muted/30',
    1: 'bg-success/30',
    2: 'bg-success/50', 
    3: 'bg-success/80',
    4: 'bg-success'
  };
  return intensities[level] || 'bg-muted/30';
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
};

export function StreakActivityMap() {
  const weeks = generateActivityData();
  
  // Calculate stats from the flattened data
  const allDays = weeks.flat().filter(day => day !== null);
  const currentStreak = 47;
  const longestStreak = 89;
  const totalContributions = allDays.filter(d => d.level > 0).length;

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5" />
          Problem Solving Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{currentStreak}</div>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">{longestStreak}</div>
              <p className="text-xs text-muted-foreground">Longest Streak</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{totalContributions}</div>
              <p className="text-xs text-muted-foreground">Active Days</p>
            </div>
          </div>

          {/* Activity Map */}
          <div className="space-y-2">
            <div className="flex gap-[2px]">
              {/* Day labels */}
              <div className="flex flex-col gap-[2px] mr-2">
                <div className="w-[10px] h-[10px]"></div> {/* Spacer for alignment */}
                {dayLabels.map((day, index) => (
                  <div 
                    key={index} 
                    className="w-[10px] h-[10px] flex items-center justify-center text-xs text-muted-foreground"
                    style={{ fontSize: '8px' }}
                  >
                    {index % 2 === 1 ? day : ''}
                  </div>
                ))}
              </div>
              
              {/* Activity grid */}
              <div className="flex gap-[2px]">
                {weeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
                        className={`w-[10px] h-[10px] rounded-sm ${
                          day ? getIntensityClass(day.level) : 'bg-transparent'
                        } hover:scale-110 transition-all duration-200 cursor-pointer border border-border/20`}
                        title={day ? `${formatDate(day.date)}: ${day.problems} problems solved` : ''}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`w-[10px] h-[10px] rounded-sm ${getIntensityClass(level)} border border-border/20`}
                    />
                  ))}
                </div>
                <span>More</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}