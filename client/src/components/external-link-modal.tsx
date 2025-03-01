import { useState } from "react";
import { X, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ExternalLinkModalProps {
  visible: boolean;
  onClose: () => void;
  onAnalyze: () => void;
  externalLinks: string[];
}

export default function ExternalLinkModal({
  visible,
  onClose,
  onAnalyze,
  externalLinks,
}: ExternalLinkModalProps) {
  const [authorized, setAuthorized] = useState(false);

  if (!visible) return null;

  // Get icon based on URL type
  const getLinkIcon = (url: string) => {
    if (url.includes('.pdf')) {
      return <FileText className="text-red-400 mr-3 h-5 w-5" />;
    }
    return <Link2 className="text-primary mr-3 h-5 w-5" />;
  };

  // Get friendly name for URL
  const getLinkName = (url: string) => {
    try {
      // Try to extract filename or path
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      if (filename) {
        return filename.length > 30 ? filename.substring(0, 30) + '...' : filename;
      }
      
      return urlObj.hostname;
    } catch (e) {
      // If URL parsing fails, just return a truncated version
      return url.length > 30 ? url.substring(0, 30) + '...' : url;
    }
  };

  // Get domain for display
  const getLinkDomain = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (e) {
      return "External Resource";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/95 backdrop-blur-md">
      <div className="backdrop-blur-md bg-background/50 border border-primary/10 rounded-xl p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">External Link{externalLinks.length > 1 ? 's' : ''} Detected</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-muted-foreground mb-4">
          This assignment contains external resources that CheatSheet AI can analyze:
        </p>
        
        <div className="space-y-3 mb-4">
          {externalLinks.map((link, index) => (
            <div 
              key={index} 
              className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-4"
            >
              <div className="flex items-center">
                {getLinkIcon(link)}
                <div>
                  <p className="font-medium">{getLinkName(link)}</p>
                  <p className="text-xs text-muted-foreground">{getLinkDomain(link)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mb-4">
          <p className="text-sm mb-2">How would you like to proceed?</p>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="authorization-checkbox" 
              checked={authorized}
              onCheckedChange={(checked) => setAuthorized(checked as boolean)} 
            />
            <Label htmlFor="authorization-checkbox" className="text-sm text-muted-foreground">
              I authorize CheatSheet AI to access this resource
            </Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline"
            className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
            onClick={onClose}
          >
            Skip
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            disabled={!authorized}
            onClick={onAnalyze}
          >
            Analyze Resource
          </Button>
        </div>
      </div>
    </div>
  );
}
