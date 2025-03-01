import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  fetchAssignmentDetails, 
  submitAssignment,
  analyzeExternalLink 
} from "@/lib/canvas-api";
import { 
  analyzeAssignment, 
  generateDraft 
} from "@/lib/ai-service";
import Sidebar from "@/components/sidebar";
import Editor from "@/components/editor";
import ProgressOverlay from "@/components/progress-overlay";
import ExternalLinkModal from "@/components/external-link-modal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Brain, 
  Link2, 
  Upload, 
  FileText, 
  Download,
  Send,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AssignmentDetailPage() {
  const { courseId, assignmentId } = useParams();
  const courseIdNumber = parseInt(courseId || "0");
  const assignmentIdNumber = parseInt(assignmentId || "0");
  const { toast } = useToast();
  
  const [editorContent, setEditorContent] = useState("");
  const [showProgressOverlay, setShowProgressOverlay] = useState(false);
  const [showExternalLinkModal, setShowExternalLinkModal] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisSteps, setAnalysisSteps] = useState<{
    step: string;
    status: "completed" | "in_progress" | "pending";
    details?: string;
  }[]>([]);
  const [externalLinkToAnalyze, setExternalLinkToAnalyze] = useState("");
  
  // Fetch assignment details
  const { data: assignment, isLoading } = useQuery({
    queryKey: [`/api/canvas/courses/${courseIdNumber}/assignments/${assignmentIdNumber}`],
    queryFn: () => fetchAssignmentDetails(courseIdNumber, assignmentIdNumber),
    enabled: !!courseIdNumber && !!assignmentIdNumber,
    onSuccess: (data) => {
      if (data.externalLinks && data.externalLinks.length > 0) {
        setExternalLinkToAnalyze(data.externalLinks[0]);
      }
    }
  });

  // AI Analysis mutation
  const analysisMutation = useMutation({
    mutationFn: async (details: string) => {
      setShowProgressOverlay(true);
      setAnalysisProgress(10);
      setAnalysisSteps([
        { step: "Extracting assignment details", status: "in_progress" },
        { step: "Analyzing requirements", status: "pending" },
        { step: "Generating solution", status: "pending" }
      ]);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 5;
        });
        
        // Update steps based on progress
        setAnalysisSteps(prev => {
          if (analysisProgress > 20 && prev[0].status !== "completed") {
            return [
              { ...prev[0], status: "completed" },
              { ...prev[1], status: "in_progress" },
              { ...prev[2], status: "pending" }
            ];
          } else if (analysisProgress > 60 && prev[1].status !== "completed") {
            return [
              { ...prev[0], status: "completed" },
              { ...prev[1], status: "completed" },
              { ...prev[2], status: "in_progress" }
            ];
          }
          return prev;
        });
      }, 300);
      
      const result = await analyzeAssignment(details);
      clearInterval(progressInterval);
      
      setAnalysisProgress(100);
      setAnalysisSteps([
        { step: "Extracting assignment details", status: "completed", details: "Identified key requirements" },
        { step: "Analyzing requirements", status: "completed", details: `${result.assignmentType} assignment identified` },
        { step: "Generating solution", status: "completed", details: "Draft ready for review" }
      ]);
      
      // After a short delay, hide the overlay and return the result
      setTimeout(() => {
        setShowProgressOverlay(false);
      }, 1000);
      
      return result;
    }
  });
  
  // Draft generation mutation
  const draftMutation = useMutation({
    mutationFn: async (params: { 
      details: string;
      analysisResult: Awaited<ReturnType<typeof analyzeAssignment>>;
      externalContent?: string;
    }) => {
      const { details, analysisResult, externalContent } = params;
      return await generateDraft(details, analysisResult, externalContent);
    },
    onSuccess: (data) => {
      setEditorContent(data.content);
      toast({
        title: "Draft generated",
        description: "You can now review and edit your assignment",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating draft",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // External link analysis
  const linkAnalysisMutation = useMutation({
    mutationFn: (url: string) => analyzeExternalLink(url),
    onSuccess: (data) => {
      toast({
        title: "Link analyzed",
        description: "Content extracted successfully",
      });
      
      // If we have already analyzed the assignment, generate a draft with the external content
      if (analysisMutation.data) {
        draftMutation.mutate({
          details: assignment?.description || "",
          analysisResult: analysisMutation.data,
          externalContent: data.content
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error analyzing link",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Assignment submission
  const submissionMutation = useMutation({
    mutationFn: () => submitAssignment(
      courseIdNumber, 
      assignmentIdNumber, 
      { 
        assignmentId: assignmentIdNumber, 
        body: editorContent,
        submittedAt: new Date().toISOString()
      }
    ),
    onSuccess: () => {
      toast({
        title: "Assignment submitted",
        description: "Your work has been submitted to Canvas",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Handle analyze button click
  const handleAnalyze = () => {
    if (assignment) {
      analysisMutation.mutate(assignment.description);
    }
  };

  // Handle external link analysis
  const handleAnalyzeExternalLink = (url: string) => {
    setShowExternalLinkModal(false);
    linkAnalysisMutation.mutate(url);
  };

  // Handle download as PDF
  const handleDownload = () => {
    // In a real implementation, this would create a PDF from the content
    // For now, just show a toast
    toast({
      title: "Download started",
      description: "Your assignment is being prepared for download",
    });
  };

  // Handle save draft
  const handleSaveDraft = () => {
    toast({
      title: "Draft saved",
      description: "Your work has been saved",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/90 to-background">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-primary/10 backdrop-blur-md bg-background/30">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="mr-4 backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
                  asChild
                >
                  <Link href={`/courses/${courseId}`}>
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                </Button>
                {isLoading ? (
                  <Skeleton className="h-8 w-64" />
                ) : (
                  <h1 className="text-xl font-semibold">{assignment?.name}</h1>
                )}
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-32 mt-4 sm:mt-0" />
              ) : (
                <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  {/* Status badge */}
                  <div className="backdrop-blur-md bg-background/30 px-3 py-1 rounded-full flex items-center border border-primary/10">
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      assignment?.status === 'active' 
                        ? 'bg-green-500' 
                        : assignment?.status === 'upcoming'
                        ? 'bg-yellow-500'
                        : assignment?.status === 'overdue'
                        ? 'bg-red-500'
                        : 'bg-gray-500'
                    }`}></span>
                    <span className="text-sm">
                      {assignment?.status === 'active' && "Due in 5 days"}
                      {assignment?.status === 'upcoming' && "Upcoming"}
                      {assignment?.status === 'overdue' && "Overdue"}
                      {assignment?.status === 'completed' && "Completed"}
                    </span>
                  </div>

                  {/* Completion badge */}
                  {assignment?.completed && (
                    <div className="backdrop-blur-md bg-green-500/20 px-3 py-1 rounded-full flex items-center border border-green-500/30">
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">Submitted</span>
                    </div>
                  )}
                  
                  {/* Grade badge - only show if graded */}
                  {assignment?.graded && (
                    <div className="backdrop-blur-md bg-blue-500/20 px-3 py-1 rounded-full flex items-center border border-blue-500/30">
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        Grade: {assignment.grade}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button 
                className="backdrop-blur-md bg-primary/20 hover:bg-primary/30 text-primary border-primary/20"
                onClick={handleAnalyze}
                disabled={analysisMutation.isPending}
              >
                <Brain className="mr-2 h-4 w-4" />
                <span>Analyze Assignment</span>
              </Button>
              
              {/* Generate button - only shown when analysis is complete but draft hasn't been generated yet */}
              {analysisMutation.data && !editorContent && (
                <Button 
                  className="backdrop-blur-md bg-accent/20 hover:bg-accent/30 text-accent border-accent/20"
                  onClick={() => draftMutation.mutate({
                    details: assignment?.description || "",
                    analysisResult: analysisMutation.data
                  })}
                  disabled={draftMutation.isPending}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>{draftMutation.isPending ? "Generating Draft..." : "Generate Draft"}</span>
                </Button>
              )}
              
              {assignment?.externalLinks && assignment.externalLinks.length > 0 && (
                <Button 
                  className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
                  onClick={() => setShowExternalLinkModal(true)}
                  disabled={linkAnalysisMutation.isPending}
                >
                  <Link2 className="mr-2 h-4 w-4" />
                  <span>Analyze External Links</span>
                </Button>
              )}
              
              <Button className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50">
                <Upload className="mr-2 h-4 w-4" />
                <span>Upload File</span>
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Assignment details */}
            <div className="w-full md:w-1/3 border-r border-primary/10 p-6 overflow-y-auto backdrop-blur-sm bg-background/20">
              {isLoading ? (
                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-6 w-32 mb-2" />
                    <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-4">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                  
                  <div>
                    <Skeleton className="h-6 w-40 mb-2" />
                    <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Skeleton className="h-6 w-36 mb-2" />
                    <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-2">Description</h2>
                    <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-4">
                      <div dangerouslySetInnerHTML={{ __html: assignment?.description || "" }} />
                    </div>
                  </div>
                  
                  {assignment?.externalLinks && assignment.externalLinks.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-medium mb-2">External Resources</h2>
                      <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-4">
                        {assignment.externalLinks.map((link, index) => (
                          <div key={index} className="flex items-center text-sm mb-3 last:mb-0">
                            <Link2 className="text-primary mr-2 h-4 w-4" />
                            <a href={link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                              {link.length > 40 ? link.substring(0, 40) + '...' : link}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h2 className="text-lg font-medium mb-2">Submission Details</h2>
                    <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Due Date:</span>
                        <span>{new Date(assignment?.dueAt || "").toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Points:</span>
                        <span>{assignment?.pointsPossible}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Submission Type:</span>
                        <span>{assignment?.submissionTypes?.join(', ') || "Online"}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Editor */}
            <div className="w-full md:w-2/3 p-6 overflow-y-auto bg-background/10 backdrop-blur-sm">
              <Editor 
                content={editorContent} 
                onChange={setEditorContent} 
                isGenerating={draftMutation.isPending}
              />
              
              <div className="mt-6 flex justify-between">
                <div>
                  <Button 
                    className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
                    onClick={handleSaveDraft}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    <span>Save Draft</span>
                  </Button>
                </div>
                <div className="space-x-3">
                  <Button 
                    className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
                    onClick={handleDownload}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    <span>Download</span>
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
                    onClick={() => submissionMutation.mutate()}
                    disabled={submissionMutation.isPending || !editorContent}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    <span>Submit to Canvas</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress Overlay */}
      <ProgressOverlay 
        visible={showProgressOverlay}
        progress={analysisProgress}
        title="Analyzing Assignment"
        description="Using AI to process your assignment requirements..."
        steps={analysisSteps}
      />
      
      {/* External Link Modal */}
      <ExternalLinkModal 
        visible={showExternalLinkModal}
        onClose={() => setShowExternalLinkModal(false)}
        onAnalyze={() => handleAnalyzeExternalLink(externalLinkToAnalyze)}
        externalLinks={assignment?.externalLinks || []}
      />
    </div>
  );
}
