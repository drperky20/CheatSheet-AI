import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/canvas-api";
import { 
  BookOpen, 
  History, 
  Settings, 
  LogOut,
  Menu,
  LightbulbIcon,
  Home,
  GraduationCap,
  Calendar,
  User
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const { data: courses } = useQuery({
    queryKey: ["/api/canvas/courses"],
    queryFn: fetchCourses,
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Convert path to menu ID for active state
  const getActiveMenu = (path: string) => {
    if (path === "/") return "home";
    if (path.includes("/courses") && !path.includes("/courses/")) return "courses";
    return "";
  };

  const activeMenu = getActiveMenu(location);
  
  // Count active courses
  const activeCourses = courses?.filter(c => c.status === 'active')?.length || 0;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-md bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center shadow-md">
            <LightbulbIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight">CheatSheet AI</h1>
            <p className="text-xs text-muted-foreground">Powered by Gemini</p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 px-3">
        <nav className="space-y-1">
          <Link href="/">
            <a className={`flex items-center px-3 py-2 rounded-md text-sm font-medium group transition-all ${
              activeMenu === 'home' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
            }`}>
              <Home className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Dashboard</span>
            </a>
          </Link>
          
          <Link href="/courses">
            <a className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium group transition-all ${
              activeMenu === 'courses' 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
            }`}>
              <div className="flex items-center">
                <GraduationCap className="w-4 h-4 mr-3 flex-shrink-0" />
                <span>Courses</span>
              </div>
              {activeCourses > 0 && (
                <Badge variant="outline" className="bg-primary/20 text-xs px-2">
                  {activeCourses}
                </Badge>
              )}
            </a>
          </Link>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-all group">
                  <Calendar className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>Upcoming</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a href="#" className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-all group">
                  <History className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span>History</span>
                </a>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="text-xs">Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>
      
      {courses && courses.length > 0 && (
        <div className="mt-6 px-3">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-medium text-muted-foreground">MY COURSES</h3>
            <Badge className="bg-primary/20 hover:bg-primary/30 text-xs px-2">
              {courses.length}
            </Badge>
          </div>
          
          <div className="mt-1 max-h-[40vh] overflow-y-auto pr-1 sidebar-courses">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <a className={`flex items-center px-3 py-2 my-1 rounded-md text-sm transition-all ${
                  location === `/courses/${course.id}` 
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-primary/10 text-muted-foreground hover:text-foreground'
                }`}>
                  <div className="w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                    course.status === 'active' 
                      ? 'bg-green-500' 
                      : course.status === 'upcoming'
                      ? 'bg-amber-500'
                      : 'bg-muted'
                  }"></div>
                  <span className="truncate">{course.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-auto">
        <Separator className="my-4" />
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start text-muted-foreground hover:text-foreground group"
            onClick={() => {}}
          >
            <Settings className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
            Settings
          </Button>
          
          <div className="mt-4 bg-primary/5 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-md bg-primary/20 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div className="ml-3 flex-1 overflow-hidden">
                <p className="text-sm font-medium">{user?.username}</p>
                <p className="text-xs text-muted-foreground truncate w-[140px]">
                  {user?.canvasUrl || "No Canvas URL"}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="text-muted-foreground hover:text-destructive transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 flex-shrink-0 hidden md:block border-r bg-card/50 h-screen overflow-hidden relative">
        <SidebarContent />
      </div>
      
      {/* Mobile menu button */}
      <div className="fixed bottom-5 right-5 md:hidden z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 w-12 rounded-full bg-primary shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r bg-card/90 backdrop-blur-md">
            <div className="h-full overflow-hidden">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
