import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from "lucide-react";

const ratingData = [
  { contest: "Contest 120", rating: 1534, date: "Nov 1" },
  { contest: "Contest 121", rating: 1587, date: "Nov 8" },
  { contest: "Contest 122", rating: 1542, date: "Nov 15" },
  { contest: "Contest 123", rating: 1689, date: "Nov 22" },
  { contest: "Contest 124", rating: 1723, date: "Nov 29" },
  { contest: "Contest 125", rating: 1698, date: "Dec 6" },
  { contest: "Contest 126", rating: 1756, date: "Dec 13" },
  { contest: "Contest 127", rating: 1812, date: "Dec 20" },
];

export function ContestRatingChart() {
  return (
    <Card className="glass backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Contest Rating Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ratingData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="rating" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <div className="text-2xl font-bold text-primary">1812</div>
          <p className="text-sm text-muted-foreground">Current Rating (+278 from start)</p>
        </div>
      </CardContent>
    </Card>
  );
}