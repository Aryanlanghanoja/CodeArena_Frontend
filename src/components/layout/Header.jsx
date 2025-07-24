import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Code2, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Moon,
  Sun,
  Menu,
  Sparkles
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ userRole, onRoleSwitch }) {
  const [darkMode, setDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Code2 className="h-8 w-8 text-primary animate-pulse" />
            <Sparkles className="h-3 w-3 text-primary absolute -top-1 -right-1" />
          </div>
          <div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              CodeArena
            </span>
            <p className="text-xs text-muted-foreground -mt-1">Competitive Programming</p>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Role Switch with enhanced styling */}
        <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-full">
          <Badge 
            variant={userRole === 'student' ? 'default' : 'secondary'}
            className={`cursor-pointer transition-all px-4 py-2 ${
              userRole === 'student' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-primary/10'
            }`}
            onClick={() => onRoleSwitch('student')}
          >
            Student
          </Badge>
          <Badge 
            variant={userRole === 'faculty' ? 'default' : 'secondary'}
            className={`cursor-pointer transition-all px-4 py-2 ${
              userRole === 'faculty' 
                ? 'bg-primary text-primary-foreground' 
                : 'hover:bg-primary/10'
            }`}
            onClick={() => onRoleSwitch('faculty')}
          >
            Faculty
          </Badge>
        </div>

        {/* Dark mode toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleDarkMode}
          className="hover:bg-primary/10 relative overflow-hidden"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 transition-transform rotate-0 scale-100 text-warning" />
          ) : (
            <Moon className="h-5 w-5 transition-transform rotate-0 scale-100 text-primary" />
          )}
        </Button>

        {/* Enhanced Notifications */}
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 group">
          <Bell className="h-5 w-5 group-hover:text-primary transition-colors" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-primary animate-pulse">
            3
          </Badge>
        </Button>

        {/* Enhanced User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 relative">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-primary/20">
            <DropdownMenuLabel className="font-semibold">
              <div className="flex flex-col">
                <span>{userRole === 'faculty' ? 'Dr. Smith' : 'John Doe'}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  {userRole === 'faculty' ? 'Faculty' : 'Student'}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem className="hover:bg-primary/10">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-primary/10">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-primary/20" />
            <DropdownMenuItem className="hover:bg-danger/10 text-danger">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}