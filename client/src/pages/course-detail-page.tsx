import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseAssignments, fetchCourseDetails } from "@/lib/canvas-api";
import Sidebar from "@/components/sidebar";
import AssignmentCard from "@/components/assignment-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Search, 
  Upload, 
  ArrowLeft, 
  GraduationCap, 
  SortAsc, 
  FilterX, 
  BookOpen, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  SlidersHorizontal
} from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Sort types for assignments
type SortOption = 'dueDate' | 'name' | 'pointsPossible';
type FilterOption = 'all' | 'active' | 'upcoming' | 'completed' | 'overdue';

// Define the assignment interface
interface Assignment {
  id: number;
  name: string;
  description: string;
  dueAt: string | null;
  pointsPossible: number;
  submissionTypes: string[];
  courseId: number;
  status: 'active' | 'upcoming' | 'completed' | 'overdue';
  externalLinks?: string[];
  completed?: boolean;
  submittedAt?: string | null;
  graded?: boolean;
  grade?: string | null;
}

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const courseIdNumber = parseInt(courseId || "0");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('dueDate');
  const [activeTab, setActiveTab] = useState<FilterOption>('all');
  
  // Fetch course details
  const { data: courseDetails } = useQuery({
    queryKey: [`/api/canvas/courses/${courseIdNumber}/details`],
    queryFn: () => fetchCourseDetails(courseIdNumber),
    enabled: !!courseIdNumber,
  });
  
  const { data: assignments, isLoading } = useQuery({
    queryKey: [`/api/canvas/courses/${courseIdNumber}/assignments`],
    queryFn: () => fetchCourseAssignments(courseIdNumber),
    enabled: !!courseIdNumber,
  });

  // Filter assignments by search term
  const filteredAssignments = assignments?.filter((assignment: Assignment) => 
    assignment.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort assignments based on selected sort option
  const sortAssignments = (assignments: Assignment[] | undefined) => {
    if (!assignments) return [];
    
    return [...assignments].sort((a: Assignment, b: Assignment) => {
      switch (sortBy) {
        case 'dueDate':
          // Handle null due dates (put them at the end)
          if (!a.dueAt && !b.dueAt) return 0;
          if (!a.dueAt) return 1;
          if (!b.dueAt) return -1;
          return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'pointsPossible':
          return b.pointsPossible - a.pointsPossible;
        default:
          return 0;
      }
    });
  };

  // Filter assignments by status
  const getFilteredAssignments = (status: FilterOption) => {
    if (status === 'all') return sortAssignments(filteredAssignments);
    return sortAssignments(
      filteredAssignments?.filter((a: Assignment) => {
        if (status === 'active') return a.status === 'active';
        if (status === 'upcoming') return a.status === 'upcoming';
        if (status === 'completed') return a.status === 'completed';
        if (status === 'overdue') return a.status === 'overdue';
        return true;
      })
    );
  };

  const currentAssignments = getFilteredAssignments(activeTab);
  
  // Count assignments by status
  const assignmentCounts = {
    all: filteredAssignments?.length || 0,
    active: filteredAssignments?.filter(a => a.status === 'active').length || 0,
    upcoming: filteredAssignments?.filter(a => a.status === 'upcoming').length || 0,
    completed: filteredAssignments?.filter(a => a.status === 'completed').length || 0,
    overdue: filteredAssignments?.filter(a => a.status === 'overdue').length || 0
  };

  // Get status icon
  const getStatusIcon = (status: FilterOption) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'upcoming': return <BookOpen className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status: FilterOption) => {
    switch (status) {
      case 'active': return 'default';
      case 'upcoming': return 'outline';
      case 'completed': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b bg-card/50 backdrop-blur-sm">
            <div className="flex h-16 items-center gap-4 px-4 md:px-6">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
                asChild
              >
                <Link href="/courses">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">
                    {courseDetails?.name || "Loading course..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {courseDetails?.courseCode}
                  </p>
                </div>
              </div>
              
              <div className="ml-auto flex items-center gap-2">
                <div className="relative hidden md:block">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search assignments..."
                    className="pl-8 w-[200px] lg:w-[280px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-auto h-8 gap-1">
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>Sort & Filter</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem className="text-xs font-medium text-muted-foreground" disabled>
                      SORT BY
                    </DropdownMenuItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortBy === 'dueDate'}
                      onCheckedChange={() => setSortBy('dueDate')}
                    >
                      Due Date
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortBy === 'name'}
                      onCheckedChange={() => setSortBy('name')}
                    >
                      Name
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={sortBy === 'pointsPossible'}
                      onCheckedChange={() => setSortBy('pointsPossible')}
                    >
                      Points
                    </DropdownMenuCheckboxItem>
                    
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem className="text-xs font-medium text-muted-foreground" disabled>
                      VIEW
                    </DropdownMenuItem>
                    <DropdownMenuCheckboxItem 
                      checked={activeTab === 'all'}
                      onCheckedChange={() => setActiveTab('all')}
                    >
                      All Assignments
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={activeTab === 'active'}
                      onCheckedChange={() => setActiveTab('active')}
                    >
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={activeTab === 'upcoming'}
                      onCheckedChange={() => setActiveTab('upcoming')}
                    >
                      Upcoming
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={activeTab === 'completed'}
                      onCheckedChange={() => setActiveTab('completed')}
                    >
                      Completed
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem 
                      checked={activeTab === 'overdue'}
                      onCheckedChange={() => setActiveTab('overdue')}
                    >
                      Overdue
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {searchTerm && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSearchTerm("")}>
                    <FilterX className="h-4 w-4" />
                    <span className="sr-only">Clear filter</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile search */}
          <div className="md:hidden border-b bg-card/50 px-4 py-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search assignments..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="p-4 md:p-6 space-y-4">
            {/* Course Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Assignments</CardDescription>
                  <CardTitle>{assignmentCounts.all}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground">
                    {courseDetails?.term}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active</CardDescription>
                  <CardTitle>{assignmentCounts.active}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>In Progress</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Completed</CardDescription>
                  <CardTitle>{assignmentCounts.completed}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CheckCircle className="h-3 w-3" />
                    <span>Submitted</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Overdue</CardDescription>
                  <CardTitle>{assignmentCounts.overdue}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Past Due</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Assignment Filter Tabs */}
            <div>
              <Tabs 
                defaultValue="all" 
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as FilterOption)}
                className="w-full"
              >
                <div className="flex items-center">
                  <TabsList className="h-9">
                    <TabsTrigger value="all" className="text-xs px-3">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="active" className="text-xs px-3">
                      Active
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="text-xs px-3">
                      Upcoming
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="text-xs px-3">
                      Completed
                    </TabsTrigger>
                    <TabsTrigger value="overdue" className="text-xs px-3">
                      Overdue
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="ml-auto flex items-center text-sm font-medium">
                    <SortAsc className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Sorted by: {sortBy === 'dueDate' ? 'Due Date' : sortBy === 'name' ? 'Name' : 'Points'}
                    </span>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="relative min-h-[300px]">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i}>
                          <CardHeader className="p-4 pb-2 space-y-0">
                            <div className="flex justify-between items-start">
                              <Skeleton className="h-5 w-20 rounded" />
                              <Skeleton className="h-8 w-8 rounded-md" />
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-2 space-y-2">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : currentAssignments && currentAssignments.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {currentAssignments.map((assignment) => (
                        <AssignmentCard 
                          key={assignment.id} 
                          assignment={assignment} 
                          courseId={courseIdNumber} 
                        />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                        <div className="rounded-full bg-background p-3 border">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-medium text-lg">No assignments found</h3>
                          <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            {searchTerm 
                              ? "No assignments match your search terms. Try adjusting your filters."
                              : activeTab !== 'all'
                                ? `No ${activeTab} assignments found in this course.`
                                : "This course doesn't have any assignments yet, or your Canvas integration needs to be refreshed."
                            }
                          </p>
                        </div>
                        {searchTerm ? (
                          <Button variant="outline" onClick={() => setSearchTerm("")}>
                            <FilterX className="mr-2 h-4 w-4" />
                            Clear Search
                          </Button>
                        ) : activeTab !== 'all' ? (
                          <Button variant="outline" onClick={() => setActiveTab('all')}>
                            <FileText className="mr-2 h-4 w-4" />
                            View All Assignments
                          </Button>
                        ) : (
                          <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" />
                            Refresh Canvas Data
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
