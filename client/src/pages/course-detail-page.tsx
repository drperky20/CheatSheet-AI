import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { fetchCourseAssignments, fetchCourseDetails } from "@/lib/canvas-api";
import Sidebar from "@/components/sidebar";
import AssignmentCard from "@/components/assignment-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Upload, ArrowLeft, BookOpen, ArrowUpDown } from "lucide-react";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Sort types for assignments
type SortOption = 'dueDate' | 'name' | 'pointsPossible';

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
  const upcomingAssignments = sortAssignments(
    filteredAssignments?.filter((a: Assignment) => a.status === 'upcoming' || a.status === 'active')
  );
  const completedAssignments = sortAssignments(
    filteredAssignments?.filter((a: Assignment) => a.status === 'completed')
  );
  const overdueAssignments = sortAssignments(
    filteredAssignments?.filter((a: Assignment) => a.status === 'overdue')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center mb-2">
                  <Button
                    variant="link"
                    className="p-0 mr-2 text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link href="/courses">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      <span>Back to Courses</span>
                    </Link>
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">
                      {courseDetails?.name || "Loading course..."}
                    </h1>
                    <p className="text-muted-foreground">
                      {courseDetails?.courseCode} {courseDetails?.term ? `• ${courseDetails.term}` : ''}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search assignments..."
                    className="pl-10 bg-background/50 backdrop-blur-sm border-primary/10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="backdrop-blur-md bg-background/50 border-primary/10 hover:bg-background/80">
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      <span>Sort by</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setSortBy('dueDate')}>
                      Due Date {sortBy === 'dueDate' && '✓'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      Name {sortBy === 'name' && '✓'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('pointsPossible')}>
                      Points {sortBy === 'pointsPossible' && '✓'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Button className="backdrop-blur-md bg-background/50 border-primary/10 hover:bg-background/80">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Upload</span>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="backdrop-blur-md bg-background/30 border-primary/10">
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <Skeleton className="h-6 w-24 rounded-md" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-8 w-32 rounded-md" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredAssignments && filteredAssignments.length > 0 ? (
              <div className="space-y-8">
                {/* Overdue assignments */}
                {overdueAssignments && overdueAssignments.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                      Overdue
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {overdueAssignments.map((assignment) => (
                        <AssignmentCard 
                          key={assignment.id} 
                          assignment={assignment} 
                          courseId={courseIdNumber} 
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Upcoming assignments */}
                {upcomingAssignments && upcomingAssignments.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                      Upcoming & Active
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {upcomingAssignments.map((assignment) => (
                        <AssignmentCard 
                          key={assignment.id} 
                          assignment={assignment} 
                          courseId={courseIdNumber} 
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Completed assignments */}
                {completedAssignments && completedAssignments.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="h-3 w-3 rounded-full bg-gray-500 mr-2"></span>
                      Completed
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {completedAssignments.map((assignment) => (
                        <AssignmentCard 
                          key={assignment.id} 
                          assignment={assignment} 
                          courseId={courseIdNumber} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-12 backdrop-blur-md bg-background/30 border border-primary/10 rounded-lg">
                {assignments && assignments.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No assignments match your search</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No assignments found</h3>
                    <p className="text-muted-foreground mb-4">
                      This course doesn't have any assignments yet, or your Canvas integration needs to be refreshed.
                    </p>
                    <Button>Refresh Canvas Data</Button>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
