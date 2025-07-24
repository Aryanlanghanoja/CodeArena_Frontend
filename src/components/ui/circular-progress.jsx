import { cn } from "@/lib/utils";

export function CircularProgress({ 
  value = 0, 
  max = 100, 
  size = 200, 
  strokeWidth = 8,
  className = "",
  children 
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="opacity-30"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
          style={{
            background: `conic-gradient(
              hsl(var(--success)) 0deg ${(value * 0.3 / max) * 360}deg,
              hsl(var(--warning)) ${(value * 0.3 / max) * 360}deg ${(value * 0.7 / max) * 360}deg,
              hsl(var(--danger)) ${(value * 0.7 / max) * 360}deg ${(value / max) * 360}deg,
              transparent ${(value / max) * 360}deg 360deg
            )`
          }}
        />
      </svg>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children || (
          <>
            <div className="text-3xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">/{max}</div>
          </>
        )}
      </div>
    </div>
  );
}