import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCourses } from "@/lib/canvas-api";
import { Link } from "wouter";
import { 
  BookOpen, 
  ArrowRight, 
  Settings, 
  LightbulbIcon,
  GraduationCap
} from "lucide-react";
import { ApiKeyBanner } from "@/components/api-key-banner";
import { useState } from "react";
import { ApiKeySettings } from "@/components/api-key-settings";

export default function HomePage() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/canvas/courses"],
    queryFn: fetchCourses,
  });
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  // Animation delay generator
  const getDelay = (index: number) => ({
    animationDelay: `${index * 0.1}s`
  });

  return (
    <div className="min-h-screen">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto relative">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(var(--primary),0.15),transparent_40%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(var(--primary),0.1),transparent_30%)]"></div>
          
          {/* Content */}
          <div className="relative z-10 p-6 md:p-8 max-w-5xl mx-auto">
            {/* API Key Banner */}
            <ApiKeyBanner />
            
            {/* Welcome Header */}
            <div className="mb-8 slide-up">
              <h1 className="text-3xl font-bold mb-3 glow-text">Welcome back, {user?.username}</h1>
              <p className="text-white/70 text-lg">Your AI-powered assignment assistant</p>
            </div>
            
            {/* AI Assistant Card */}
            <div className="mb-8 fade-in" style={getDelay(1)}>
              <Card className="glass-card border-none overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary/40 to-primary/10 flex items-center justify-center pulse">
                        <LightbulbIcon className="h-12 w-12 text-primary" />
                      </div>
                      <div className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-green-500 h-4 w-4" />
                    </div>
                    
                    <div className="text-center md:text-left flex-1">
                      <h2 className="text-xl font-semibold mb-2">Gemini AI Assistant</h2>
                      <p className="text-white/70 mb-4">Ready to help you analyze assignments and generate drafts</p>
                      <Button
                        className="bg-primary/40 hover:bg-primary/60 border-none"
                        onClick={() => setShowApiKeySettings(true)}
                      >
                        Configure AI
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Courses Section */}
            <div className="slide-up" style={getDelay(2)}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold glow-text">My Courses</h2>
                <Button 
                  variant="ghost" 
                  className="text-white/70 hover:text-white hover-scale" 
                  asChild
                >
                  <Link href="/courses">
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-5">
                        <Skeleton className="h-6 w-3/4 mb-3 bg-white/5" />
                        <Skeleton className="h-4 w-1/2 mb-5 bg-white/5" />
                        <div className="flex justify-between">
                          <Skeleton className="h-4 w-16 bg-white/5" />
                          <Skeleton className="h-8 w-8 rounded-full bg-white/5" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {courses.slice(0, 3).map((course, index) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <Card className="glass-card border-none h-full hover-scale hover:shadow-lg hover:shadow-primary/10" style={getDelay(index + 3)}>
                        <CardContent className="p-5">
                          <div className="flex justify-between mb-3">
                            <div className={`px-2 py-1 rounded-md text-xs font-medium ${
                              course.status === 'active' 
                                ? 'bg-green-500/20 text-green-300' 
                                : course.status === 'upcoming'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-white/10 text-white/60'
                            }`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </div>
                            <div className="h-8 w-8 rounded-md glass flex items-center justify-center">
                              <GraduationCap className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          
                          <h3 className="font-medium text-base mb-1 line-clamp-2">{course.name}</h3>
                          <p className="text-sm text-white/50 mb-4">{course.courseCode}</p>
                          
                          <div className="mt-auto flex justify-end">
                            <Button variant="ghost" size="sm" className="text-xs hover:bg-black/20 group">
                              <span>View Assignments</span>
                              <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="glass-card border-none">
                  <CardContent className="p-8 text-center">
                    <BookOpen className="h-12 w-12 text-white/30 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No courses found</h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                      Connect your Canvas account to sync your courses and assignments.
                    </p>
                    <Button asChild className="bg-primary/40 hover:bg-primary/60 border-none">
                      <Link href="/courses">Go to Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* API Key Settings Dialog */}
            <ApiKeySettings
              open={showApiKeySettings}
              onOpenChange={setShowApiKeySettings}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
