import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/canvas-api";
import { 
  BookOpen, 
  LogOut,
  Menu,
  LightbulbIcon,
  Home,
  GraduationCap
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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

  // Check if a path is active
  const isActive = (path: string) => {
    if (path === "/" && location === path) return true;
    if (path === "/courses" && location.includes("/courses")) return true;
    if (path.startsWith("/courses/") && location === path) return true;
    return false;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 flex items-center space-x-3 fade-in">
        <div className="w-10 h-10 rounded-xl glass flex items-center justify-center pulse">
          <LightbulbIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight glow-text">CheatSheet AI</h1>
          <p className="text-xs text-white/50">Gemini-powered</p>
        </div>
      </div>
      
      {/* Main Nav */}
      <div className="mt-6 px-4 slide-up">
        <nav className="space-y-2">
          <Link href="/">
            <a className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive("/") 
                ? 'glass bg-primary/40 text-white' 
                : 'text-white/70 hover:bg-black/20 hover:text-white'
            }`}>
              <Home className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>Dashboard</span>
            </a>
          </Link>
          
          <Link href="/courses">
            <a className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive("/courses") && !location.includes("/courses/")
                ? 'glass bg-primary/40 text-white' 
                : 'text-white/70 hover:bg-black/20 hover:text-white'
            }`}>
              <GraduationCap className="w-4 h-4 mr-3 flex-shrink-0" />
              <span>All Courses</span>
            </a>
          </Link>
        </nav>
      </div>
      
      {/* Courses List */}
      {courses && courses.length > 0 && (
        <div className="mt-6 px-4 slide-up" style={{ animationDelay: "0.1s" }}>
          <h3 className="text-xs font-medium text-white/50 px-4 mb-2">MY COURSES</h3>
          
          <div className="max-h-[40vh] overflow-y-auto pr-1 space-y-1">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <a className={`flex items-center px-4 py-2 rounded-lg text-sm transition-all hover-scale ${
                  isActive(`/courses/${course.id}`) 
                    ? 'glass bg-primary/40 text-white'
                    : 'text-white/70 hover:bg-black/20 hover:text-white'
                }`}>
                  <BookOpen className="w-3.5 h-3.5 mr-3 flex-shrink-0 opacity-70" />
                  <span className="truncate">{course.name}</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* User profile & logout */}
      <div className="mt-auto p-4 slide-up" style={{ animationDelay: "0.2s" }}>
        <div className="glass rounded-xl p-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/40 to-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold glow-text">{user?.username.charAt(0).toUpperCase()}</span>
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-medium">{user?.username}</p>
              <p className="text-xs text-white/50 truncate w-[140px]">
                {user?.canvasUrl || "No Canvas URL"}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white/70 hover:text-white hover:bg-black/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 flex-shrink-0 hidden md:block glass border-none h-screen overflow-hidden">
        <SidebarContent />
      </div>
      
      {/* Mobile menu button */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button className="h-14 w-14 rounded-full glass bg-primary/30 hover:bg-primary/50 border-none shadow-lg">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-none glass">
            <div className="h-full overflow-hidden">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
