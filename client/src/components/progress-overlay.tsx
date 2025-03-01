import { CheckCircle, Loader2 } from "lucide-react";

interface ProgressStep {
  step: string;
  status: "completed" | "in_progress" | "pending";
  details?: string;
}

interface ProgressOverlayProps {
  visible: boolean;
  progress: number;
  title: string;
  description: string;
  steps: ProgressStep[];
}

export default function ProgressOverlay({
  visible,
  progress,
  title,
  description,
  steps,
}: ProgressOverlayProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/95 backdrop-blur-md">
      <div className="backdrop-blur-md bg-background/50 border border-primary/10 rounded-xl p-8 max-w-md w-full text-center shadow-lg">
        <div className="w-20 h-20 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto"></div>
        <h3 className="text-xl font-medium mt-6">{title}</h3>
        <p className="text-muted-foreground mt-2">{description}</p>
        <div className="mt-8">
          <div className="w-full bg-background/50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-right text-sm text-muted-foreground mt-1">{progress}%</p>
        </div>
        <div className="mt-6 text-left">
          {steps.map((step, index) => (
            <div key={index} className="flex items-start mt-3 first:mt-0">
              {step.status === "completed" ? (
                <CheckCircle className="text-green-500 mt-0.5 mr-2 h-5 w-5" />
              ) : step.status === "in_progress" ? (
                <Loader2 className="text-primary mt-0.5 mr-2 h-5 w-5 animate-spin" />
              ) : (
                <div className="h-5 w-5 flex items-center justify-center mt-0.5 mr-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">{step.step}</p>
                {step.details && (
                  <p className="text-xs text-muted-foreground">{step.details}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
