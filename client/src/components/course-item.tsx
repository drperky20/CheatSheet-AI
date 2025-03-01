import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface CourseProps {
  course: {
    id: number;
    name: string;
    courseCode: string;
    term?: string;
    startDate?: string;
    endDate?: string;
    status: 'active' | 'completed' | 'upcoming';
  };
}

export default function CourseItem({ course }: CourseProps) {
  // Determine status badge style based on course status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-green-500/20 text-green-400";
      case 'upcoming':
        return "bg-yellow-500/20 text-yellow-400";
      case 'completed':
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-red-500/20 text-red-400";
    }
  };

  const statusColor = getStatusColor(course.status);
  
  return (
    <div className="backdrop-blur-md bg-background/30 border border-primary/10 rounded-lg p-6 hover:border-primary/30 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="mb-4 md:mb-0">
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded text-xs font-medium mr-3 ${statusColor}`}>
              {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
            </span>
            <h3 className="text-lg font-semibold">{course.name}</h3>
          </div>
          <p className="text-muted-foreground text-sm mt-1">{course.courseCode} {course.term ? `• ${course.term}` : ''}</p>
          
          <div className="mt-4">
            <p className="text-sm">
              {course.startDate && course.endDate ? (
                <>
                  <span className="text-muted-foreground">Course dates: </span>
                  {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                </>
              ) : (
                <span className="text-muted-foreground">No date information available</span>
              )}
            </p>
          </div>
        </div>
        
        <Button 
          className="backdrop-blur-md bg-primary/20 hover:bg-primary/30 text-primary"
          asChild
        >
          <Link href={`/courses/${course.id}`}>
            <span className="mr-1">View Assignments</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
