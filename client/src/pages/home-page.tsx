import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCourses } from "@/lib/canvas-api";
import { Link } from "wouter";
import { CalendarDays, FileText, BookOpen, BarChart, ArrowRight, Settings } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {/* API Key Banner */}
            <ApiKeyBanner />
            <section className="mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.username}</h1>
                  <p className="text-muted-foreground">Here's what's happening with your courses</p>
                </div>
                <Button asChild className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                  <Link href="/courses">
                    <span className="mr-2">View All Courses</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="backdrop-blur-md bg-background/30 border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Active Courses</p>
                        {isLoading ? (
                          <Skeleton className="h-8 w-16 mt-1" />
                        ) : (
                          <p className="text-2xl font-bold">{courses?.length || 0}</p>
                        )}
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-background/30 border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Upcoming Assignments</p>
                        <p className="text-2xl font-bold">5</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-background/30 border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Due This Week</p>
                        <p className="text-2xl font-bold">3</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <CalendarDays className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-background/30 border-primary/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm">Completed</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <BarChart className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Recent courses */}
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Recent Courses</h2>
              {isLoading ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="backdrop-blur-md bg-background/30 border-primary/10">
                      <CardHeader>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : courses && courses.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {courses.slice(0, 3).map((course) => (
                    <Link key={course.id} href={`/courses/${course.id}`}>
                      <Card className="backdrop-blur-md bg-background/30 border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                        <CardHeader>
                          <CardTitle>{course.name}</CardTitle>
                          <CardDescription>{course.courseCode}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{course.term || "Current Term"}</span>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              course.status === 'active' 
                                ? 'bg-green-500/20 text-green-400' 
                                : course.status === 'upcoming'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="backdrop-blur-md bg-background/30 border-primary/10">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground mb-4">No courses found. Add your Canvas URL and access token in settings.</p>
                    <Button asChild>
                      <Link href="/courses">Go to Courses</Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Quick actions */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="backdrop-blur-md bg-background/30 border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-1">Upload Assignment</h3>
                    <p className="text-xs text-muted-foreground">Upload an assignment for AI analysis</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-background/30 border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-1">Due Today</h3>
                    <p className="text-xs text-muted-foreground">View assignments due today</p>
                  </CardContent>
                </Card>
                
                <Card className="backdrop-blur-md bg-background/30 border-primary/10 cursor-pointer hover:border-primary/30 transition-all">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <h3 className="font-medium mb-1">Recent Submissions</h3>
                    <p className="text-xs text-muted-foreground">View your recent submissions</p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="backdrop-blur-md bg-background/30 border-primary/10 cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => setShowApiKeySettings(true)}
                >
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <Settings className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-medium mb-1">AI Settings</h3>
                    <p className="text-xs text-muted-foreground">Configure your Gemini API key</p>
                  </CardContent>
                </Card>
                
                {/* API Key Settings Dialog */}
                <ApiKeySettings
                  open={showApiKeySettings}
                  onOpenChange={setShowApiKeySettings}
                />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
