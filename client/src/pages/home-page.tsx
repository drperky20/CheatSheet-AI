import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCourses } from "@/lib/canvas-api";
import { Link } from "wouter";
import { 
  CalendarDays, 
  FileText, 
  BookOpen, 
  BarChart, 
  ArrowRight, 
  Settings, 
  Plus, 
  Clock, 
  LightbulbIcon,
  GraduationCap,
  BookOpenCheck
} from "lucide-react";
import { ApiKeyBanner } from "@/components/api-key-banner";
import { useState } from "react";
import { ApiKeySettings } from "@/components/api-key-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  const { user } = useAuth();
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/canvas/courses"],
    queryFn: fetchCourses,
  });
  const [showApiKeySettings, setShowApiKeySettings] = useState(false);

  const activeCourses = courses?.filter(c => c.status === 'active')?.length || 0;
  const upcomingCourses = courses?.filter(c => c.status === 'upcoming')?.length || 0;
  const completedCourses = courses?.filter(c => c.status === 'completed')?.length || 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b bg-card/50 backdrop-blur-sm">
            <div className="flex h-16 items-center px-4 md:px-6">
              <h1 className="text-lg font-semibold">Dashboard</h1>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/courses">
                    All Courses
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-6">
            {/* API Key Banner */}
            <ApiKeyBanner />
            
            {/* Welcome section with quick stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-full lg:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl">
                    Welcome back, {user?.username}
                  </CardTitle>
                  <CardDescription>
                    Track your courses and assignments with AI assistance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          Courses
                        </p>
                        <p className="text-lg font-bold">
                          {isLoading ? (
                            <Skeleton className="h-7 w-8 mt-1" />
                          ) : (
                            activeCourses + upcomingCourses
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          Due Soon
                        </p>
                        <p className="text-lg font-bold">3</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                        <BookOpenCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">
                          Completed
                        </p>
                        <p className="text-lg font-bold">7</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4 pb-0">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <Link href="/courses">
                      <span>View all courses</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      AI Assistant
                    </CardTitle>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowApiKeySettings(true)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-center py-4">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                        <LightbulbIcon className="h-12 w-12 text-primary-foreground" />
                      </div>
                      <div className="absolute bottom-0 right-0 rounded-full border-2 border-background bg-green-500 h-4 w-4" />
                    </div>
                  </div>
                  <div className="text-center mt-2">
                    <h3 className="text-sm font-medium">Gemini AI</h3>
                    <p className="text-xs text-muted-foreground mt-1">Ready to help with your assignments</p>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button className="w-full" size="sm" onClick={() => setShowApiKeySettings(true)}>
                    Configure
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Tabs for Recent & Quick Actions */}
            <Tabs defaultValue="recent">
              <div className="flex items-center justify-between mb-3">
                <TabsList>
                  <TabsTrigger value="recent">Recent Courses</TabsTrigger>
                  <TabsTrigger value="actions">Quick Actions</TabsTrigger>
                </TabsList>
              </div>
              
              {/* Recent Courses Tab Content */}
              <TabsContent value="recent" className="mt-0">
                {isLoading ? (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                      <Card key={i}>
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
                    {courses.slice(0, 6).map((course) => (
                      <Link key={course.id} href={`/courses/${course.id}`}>
                        <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <Badge variant={
                                course.status === 'active' ? 'default' : 
                                course.status === 'upcoming' ? 'outline' : 'secondary'
                              } className="mb-2">
                                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                              </Badge>
                              <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="h-4 w-4 text-primary" />
                              </div>
                            </div>
                            <CardTitle className="text-lg">{course.name}</CardTitle>
                            <CardDescription>{course.courseCode}</CardDescription>
                          </CardHeader>
                          <CardContent className="pb-2">
                            <div className="flex flex-col gap-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">67%</span>
                              </div>
                              <Progress value={67} className="h-1.5" />
                            </div>
                          </CardContent>
                          <CardFooter className="border-t pt-3 text-xs text-muted-foreground">
                            {course.term || "Current Term"}
                          </CardFooter>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <div className="flex flex-col items-center py-5">
                        <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-medium">No courses found</h3>
                        <p className="text-sm text-muted-foreground mb-5 max-w-md">
                          Add your Canvas URL and access token in settings to sync your courses.
                        </p>
                        <Button variant="outline" asChild>
                          <Link href="/courses">Go to Courses</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* Quick Actions Tab Content */}
              <TabsContent value="actions" className="mt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Plus className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">New Assignment</h3>
                      <p className="text-xs text-muted-foreground">Create a new assignment draft</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Clock className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">Due Today</h3>
                      <p className="text-xs text-muted-foreground">View assignments due today</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <BarChart className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">Assignment Stats</h3>
                      <p className="text-xs text-muted-foreground">View your assignment statistics</p>
                    </CardContent>
                  </Card>
                  
                  <Card 
                    className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                    onClick={() => setShowApiKeySettings(true)}
                  >
                    <CardContent className="p-5 flex flex-col items-center text-center">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Settings className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm mb-1">AI Settings</h3>
                      <p className="text-xs text-muted-foreground">Configure your Gemini API key</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
            
            {/* Recent Activity Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Recent Activity</h2>
                <Button variant="ghost" size="sm" className="gap-1">
                  <span>View all</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border-b last:border-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-medium">Assignment #{i} Draft Generated</p>
                            <Badge variant="outline" className="text-xs">
                              3 days ago
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Generated draft with AI for "Introduction to Psychology" course
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
