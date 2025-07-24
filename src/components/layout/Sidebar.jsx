import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  BarChart3,
  BookOpen,
  Calendar,
  Code,
  Home,
  Trophy,
  Users,
  Zap,
  Settings,
  FileText,
  Sparkles
} from "lucide-react";

export function AppSidebar({ userRole, activeTab, onTabChange }) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  
  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'problems', label: 'Problems', icon: Code },
    { id: 'contests', label: 'Contests', icon: Trophy },
    { id: 'classes', label: 'My Classes', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: BarChart3 },
  ];

  const facultyNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'problems', label: 'Problem Bank', icon: Code },
    { id: 'contests', label: 'Manage Contests', icon: Trophy },
    { id: 'classes', label: 'My Classes', icon: Users },
    { id: 'exams', label: 'Exams', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const navItems = userRole === 'student' ? studentNavItems : facultyNavItems;

  return (
    <Sidebar className="border-r border-primary/20" collapsible="icon">
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onTabChange(item.id)}
                    isActive={activeTab === item.id}
                    className={cn(
                      "transition-all hover:bg-primary/10 group",
                      activeTab === item.id && "bg-primary text-primary-foreground hover:bg-primary/90"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform group-hover:scale-110",
                      activeTab === item.id && "text-primary-foreground"
                    )} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-primary/10">
                  <Settings className="h-5 w-5" />
                  {!isCollapsed && <span>Settings</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Progress Stats - Only show when expanded */}
        {!isCollapsed && (
          <div className="mt-auto p-4">
            <div className="p-4 bg-muted/50 rounded-xl border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-full bg-primary/20">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-semibold">Progress</span>
                <Sparkles className="h-3 w-3 text-primary ml-auto" />
              </div>
              {userRole === 'student' ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Problems Solved</span>
                    <span className="font-bold text-primary">47/200</span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{width: '23.5%'}}></div>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    🔥 12-day streak!
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Active Contests</span>
                    <Badge variant="secondary" className="text-xs">3</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Total Students</span>
                    <Badge variant="secondary" className="text-xs">156</Badge>
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    📊 87% active rate
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}