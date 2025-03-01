import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/canvas-api";
import Sidebar from "@/components/sidebar";
import CourseItem from "@/components/course-item";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, Upload } from "lucide-react";

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/canvas/courses"],
    queryFn: fetchCourses,
  });

  const filteredCourses = courses?.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
                <p className="text-muted-foreground">View and manage all your courses</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10 bg-background/50 backdrop-blur-sm border-primary/10 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <Button className="backdrop-blur-md bg-background/50 border-primary/10 hover:bg-background/80">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <span>Filter</span>
                </Button>
                
                <Button className="backdrop-blur-md bg-background/50 border-primary/10 hover:bg-background/80">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Upload</span>
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="backdrop-blur-md bg-background/30 border border-primary/10 rounded-lg p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <Skeleton className="h-7 w-64 mb-2" />
                        <Skeleton className="h-5 w-32 mb-3" />
                        <Skeleton className="h-4 w-full max-w-md mb-2" />
                        <Skeleton className="h-4 w-3/4 max-w-md" />
                      </div>
                      <Skeleton className="h-10 w-28 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses && filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {filteredCourses.map((course) => (
                  <CourseItem key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 backdrop-blur-md bg-background/30 border border-primary/10 rounded-lg">
                {courses && courses.length > 0 ? (
                  <>
                    <h3 className="text-lg font-medium mb-2">No courses match your search</h3>
                    <p className="text-muted-foreground">Try adjusting your search terms</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-medium mb-2">No courses found</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your Canvas URL and access token in settings to synchronize your courses.
                    </p>
                    <Button>Connect Canvas</Button>
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
