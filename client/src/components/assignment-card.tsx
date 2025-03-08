import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Calendar, Clock, FileText, CheckCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

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
  
  // Get status properties
  const getStatusProperties = (status: string) => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          icon: <Clock className="h-3 w-3 mr-1" />,
          text: "Active"
        };
      case 'upcoming':
        return {
          variant: 'outline' as const,
          icon: <Calendar className="h-3 w-3 mr-1" />,
          text: "Upcoming"
        };
      case 'completed':
        return {
          variant: 'secondary' as const,
          icon: <CheckCircle className="h-3 w-3 mr-1" />,
          text: "Completed"
        };
      case 'overdue':
        return {
          variant: 'destructive' as const,
          icon: <AlertTriangle className="h-3 w-3 mr-1" />,
          text: "Overdue"
        };
      default:
        return {
          variant: 'outline' as const,
          icon: <FileText className="h-3 w-3 mr-1" />,
          text: "Assignment"
        };
    }
  };
  
  const statusProps = getStatusProperties(assignment.status);
  const dueText = formatDueDate(assignment.dueAt);
  
  // Truncate description and remove HTML tags
  const truncateDescription = (description: string) => {
    // Remove HTML tags
    const plainText = description.replace(/<[^>]*>/g, '');
    // Truncate to 120 characters
    return plainText.length > 120 
      ? plainText.substring(0, 120) + '...' 
      : plainText;
  };
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/50 group">
      <CardHeader className="p-4 pb-3 space-y-0">
        <div className="flex justify-between items-start">
          <Badge variant={statusProps.variant} className="px-2 py-0.5 h-5">
            <div className="flex items-center">
              {statusProps.icon}
              <span className="text-[10px] font-medium">{statusProps.text}</span>
            </div>
          </Badge>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                Generate draft with AI
              </DropdownMenuItem>
              <DropdownMenuItem>
                View assignment details
              </DropdownMenuItem>
              <DropdownMenuItem>
                Download instructions
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 space-y-2">
        <h3 className="font-medium group-hover:text-primary transition-colors text-base line-clamp-2">
          {assignment.name}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {truncateDescription(assignment.description)}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {assignment.dueAt 
              ? new Date(assignment.dueAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                }) 
              : "No due date"}
          </span>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 text-xs gap-1 px-2" 
          asChild
        >
          <Link href={`/courses/${courseId}/assignments/${assignment.id}`}>
            <span>{assignment.status === 'completed' ? 'View' : 'Start'}</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
