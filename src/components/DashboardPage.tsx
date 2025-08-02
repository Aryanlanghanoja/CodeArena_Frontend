import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const DashboardPage = () => {
  const { user } = useAuth();

  // Prepare chart data
  const submissionData = [
    { name: 'Easy', value: user.submissionStats.easy.solved, total: user.submissionStats.easy.total, color: '#10B981' },
    { name: 'Medium', value: user.submissionStats.medium.solved, total: user.submissionStats.medium.total, color: '#F59E0B' },
    { name: 'Hard', value: user.submissionStats.hard.solved, total: user.submissionStats.hard.total, color: '#EF4444' }
  ];

  const skillsData = Object.entries(user.skills).map(([skill, level]) => ({
    skill,
    level,
    fullMark: 100
  }));

  const formatRatingTooltip = (value, name, props) => {
    if (name === 'rating') {
      return [`Rating: ${value}`, props.payload.contest];
    }
    return [value, name];
  };

  const formatHeatmapTooltip = (value, date) => {
    if (!value || !value.count) return null;
    return `${value.count} submissions on ${value.date}`;
  };

  const getHeatmapClassForValue = (value) => {
    if (!value || value.count === 0) return 'color-empty';
    if (value.count === 1) return 'color-scale-1';
    if (value.count === 2) return 'color-scale-2';
    if (value.count <= 3) return 'color-scale-3';
    return 'color-scale-4';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}! Here's your coding progress overview.
        </p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Problems Solved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{user.problemsSolved}</div>
            <div className="text-sm text-muted-foreground mt-1">
              out of {user.submissionStats.easy.total + user.submissionStats.medium.total + user.submissionStats.hard.total} total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{user.rating}</div>
            <Badge variant="secondary" className="mt-1">
              {user.rank}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Acceptance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{user.acceptanceRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {user.problemsSolved} / {user.totalSubmissions} submissions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Badges Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning">{user.badges.length}</div>
            <div className="text-sm text-muted-foreground mt-1">achievements unlocked</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* User Profile Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.profilePhoto} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{user.name}</h3>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="text-sm text-muted-foreground">{user.university}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Easy Problems</span>
                  <span>{user.submissionStats.easy.solved}/{user.submissionStats.easy.total}</span>
                </div>
                <Progress value={(user.submissionStats.easy.solved / user.submissionStats.easy.total) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Medium Problems</span>
                  <span>{user.submissionStats.medium.solved}/{user.submissionStats.medium.total}</span>
                </div>
                <Progress value={(user.submissionStats.medium.solved / user.submissionStats.medium.total) * 100} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Hard Problems</span>
                  <span>{user.submissionStats.hard.solved}/{user.submissionStats.hard.total}</span>
                </div>
                <Progress value={(user.submissionStats.hard.solved / user.submissionStats.hard.total) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Problems Solved Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Submission Statistics</CardTitle>
            <CardDescription>Distribution of solved problems by difficulty</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={submissionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {submissionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating History */}
        <Card className="lg:col-span-2 xl:col-span-1">
          <CardHeader>
            <CardTitle>Rating History</CardTitle>
            <CardDescription>Your contest performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={user.ratingHistory}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} formatter={formatRatingTooltip} />
                <Line 
                  type="monotone" 
                  dataKey="rating" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Heatmap */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Activity Map</CardTitle>
            <CardDescription>Your coding activity over the past year</CardDescription>
          </CardHeader>
          <CardContent>
            <style>
              {`
                .react-calendar-heatmap .color-empty { fill: hsl(var(--muted)); }
                .react-calendar-heatmap .color-scale-1 { fill: hsl(var(--primary) / 0.3); }
                .react-calendar-heatmap .color-scale-2 { fill: hsl(var(--primary) / 0.5); }
                .react-calendar-heatmap .color-scale-3 { fill: hsl(var(--primary) / 0.7); }
                .react-calendar-heatmap .color-scale-4 { fill: hsl(var(--primary)); }
                .react-calendar-heatmap text { fill: hsl(var(--muted-foreground)); font-size: 10px; }
              `}
            </style>
            <CalendarHeatmap
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              values={user.activityData}
              classForValue={getHeatmapClassForValue}
              tooltipDataAttrs={(value) => {
                return {
                  'data-tip': formatHeatmapTooltip(value, value?.date),
                };
              }}
              showWeekdayLabels={true}
            />
          </CardContent>
        </Card>

        {/* Skills Radar Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Skill Breakdown</CardTitle>
            <CardDescription>Your proficiency across different topics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={skillsData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                  tickCount={6}
                />
                <Radar
                  name="Skill Level"
                  dataKey="level"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Badges Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
          <CardDescription>Badges you've earned for your coding accomplishments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {user.badges.map((badge, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <div className="text-2xl">{badge.icon}</div>
                <div>
                  <h4 className="font-medium">{badge.name}</h4>
                  <p className="text-sm text-muted-foreground">{badge.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;