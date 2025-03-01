import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreVertical, Calendar } from "lucide-react";
import { Link } from "wouter";

interface AssignmentCardProps {
  assignment: {
    id: number;
    name: string;
    description: string;
    dueAt: string | null;
    status: 'active' | 'upcoming' | 'completed' | 'overdue';
  };
  courseId: number;
}

export default function AssignmentCard({ assignment, courseId }: AssignmentCardProps) {
  // Format due date
  const formatDueDate = (dueAt: string | null) => {
    if (!dueAt) return "No due date";
    
    const dueDate = new Date(dueAt);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Was due ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} ago`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return `Due ${dueDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })}`;
    }
  };
  
  // Get appropriate status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'active':
        return "bg-green-500/20 text-green-400";
      case 'upcoming':
        return "bg-yellow-500/20 text-yellow-400";
      case 'completed':
        return "bg-gray-500/20 text-gray-400";
      case 'overdue':
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-muted/20 text-muted-foreground";
    }
  };
  
  // Generate status text
  const getStatusText = (status: string, dueAt: string | null) => {
    switch (status) {
      case 'active':
        return formatDueDate(dueAt);
      case 'upcoming':
        return "Upcoming";
      case 'completed':
        return "Completed";
      case 'overdue':
        return "Overdue";
      default:
        return formatDueDate(dueAt);
    }
  };
  
  const statusStyle = getStatusBadgeStyle(assignment.status);
  const statusText = getStatusText(assignment.status, assignment.dueAt);
  
  // Truncate description and remove HTML tags
  const truncateDescription = (description: string) => {
    // Remove HTML tags
    const plainText = description.replace(/<[^>]*>/g, '');
    // Truncate to 100 characters
    return plainText.length > 100 
      ? plainText.substring(0, 100) + '...' 
      : plainText;
  };
  
  return (
    <Card className="backdrop-blur-md bg-background/30 border-primary/10 hover:shadow-lg transition cursor-pointer group rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className={`px-2 py-1 rounded-md text-xs font-medium ${statusStyle}`}>
            {statusText}
          </div>
          <button className="text-muted-foreground hover:text-foreground transition">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
        <h3 className="font-medium text-lg mb-2 group-hover:text-primary transition">{assignment.name}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3">
          {truncateDescription(assignment.description)}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 mr-1" />
            <span>
              {assignment.dueAt 
                ? new Date(assignment.dueAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  }) 
                : "No due date"}
            </span>
          </div>
          <Button 
            className="backdrop-blur-md bg-background/50 hover:bg-primary/20 transition text-xs h-7 px-3"
            asChild
          >
            <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>
              {assignment.status === 'completed' ? 'View Submission' : 'Start Assignment'}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}
