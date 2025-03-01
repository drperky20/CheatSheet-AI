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
  Menu
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

  const SidebarContent = () => (
    <>
      <div className="p-5 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-accent flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div>
          <h1 className="font-['Poppins'] font-semibold text-lg">CheatSheet AI</h1>
          <p className="text-xs text-muted-foreground">AI-powered assignments</p>
        </div>
      </div>
      
      <div className="mt-8">
        <div className="px-5 pb-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Menu</p>
        </div>
        <ul>
          <li>
            <Link href="/courses">
              <a className={`flex items-center px-5 py-3 text-sm font-medium ${
                location.includes('/courses') 
                  ? 'bg-primary/20 border-l-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground transition-colors'
              }`}>
                <BookOpen className="w-5 h-5" />
                <span className="ml-3">Courses</span>
              </a>
            </Link>
          </li>
          <li>
            <a href="#" className="flex items-center px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <History className="w-5 h-5" />
              <span className="ml-3">History</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-5 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
              <span className="ml-3">Settings</span>
            </a>
          </li>
        </ul>
      </div>
      
      {courses && courses.length > 0 && (
        <div className="mt-8">
          <div className="px-5 pb-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">My Courses</p>
          </div>
          <ul className="max-h-[40vh] overflow-y-auto">
            {courses.map((course) => (
              <li key={course.id}>
                <Link href={`/courses/${course.id}`}>
                  <a className={`flex items-center px-5 py-3 text-sm font-medium hover:bg-background/20 transition-colors ${
                    location === `/courses/${course.id}` ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      course.status === 'active' 
                        ? 'bg-green-500' 
                        : course.status === 'upcoming'
                        ? 'bg-yellow-500'
                        : course.status === 'completed'
                        ? 'bg-gray-500'
                        : 'bg-red-500'
                    }`}></span>
                    <span className="ml-3 truncate">{course.name}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-xl p-3 flex items-center">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-sm font-medium">{user?.username.charAt(0).toUpperCase()}</span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[120px]">
              {user?.canvasUrl || "No Canvas URL"}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground transition"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 flex-shrink-0 hidden md:block border-r border-primary/10 backdrop-blur-md bg-background/30 h-screen overflow-y-auto relative">
        <SidebarContent />
      </div>
      
      {/* Mobile menu button */}
      <div className="fixed bottom-4 right-4 md:hidden z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-accent shadow-lg">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="backdrop-blur-md bg-background/95 border-r border-primary/10 p-0 w-72">
            <div className="h-full relative overflow-y-auto">
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
