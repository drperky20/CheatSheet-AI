import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Heading1,
  Heading2,
  Quote,
  Sparkles,
  CheckSquare,
  Loader2,
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { enhanceContent } from "@/lib/ai-service";
import { useToast } from "@/hooks/use-toast";

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  isGenerating?: boolean;
}

export default function Editor({ content, onChange, isGenerating = false }: EditorProps) {
  const { toast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // Handle AI enhancements
  const handleEnhance = async (instruction: string) => {
    if (!content) {
      toast({
        title: "No content to enhance",
        description: "Please write or generate content first",
        variant: "destructive",
      });
      return;
    }
    
    setIsEnhancing(true);
    try {
      const enhancedContent = await enhanceContent(content, instruction);
      onChange(enhancedContent);
      toast({
        title: "Content enhanced",
        description: `Successfully ${instruction.toLowerCase()}`,
      });
    } catch (error) {
      toast({
        title: "Enhancement failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };
  
  // Insert formatting at cursor position or around selection
  const insertFormatting = (startTag: string, endTag: string = startTag) => {
    const textarea = document.getElementById('editor') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);
    
    const newText = beforeText + startTag + selectedText + endTag + afterText;
    onChange(newText);
    
    // Set cursor position after the formatting is applied
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + startTag.length;
      textarea.selectionEnd = start + startTag.length + selectedText.length;
    }, 0);
  };
  
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
          onClick={() => insertFormatting('**', '**')}
        >
          <Bold className="h-4 w-4 mr-1" />
          <span>Bold</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
          onClick={() => insertFormatting('*', '*')}
        >
          <Italic className="h-4 w-4 mr-1" />
          <span>Italic</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
            >
              <Heading1 className="h-4 w-4 mr-1" />
              <span>Headings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => insertFormatting('# ', '')}>
              <Heading1 className="h-4 w-4 mr-2" /> Heading 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => insertFormatting('## ', '')}>
              <Heading2 className="h-4 w-4 mr-2" /> Heading 2
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
          onClick={() => insertFormatting('- ', '')}
        >
          <List className="h-4 w-4 mr-1" />
          <span>List</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
          onClick={() => insertFormatting('1. ', '')}
        >
          <ListOrdered className="h-4 w-4 mr-1" />
          <span>Numbered</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
          onClick={() => insertFormatting('```\n', '\n```')}
        >
          <Code className="h-4 w-4 mr-1" />
          <span>Code</span>
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="backdrop-blur-md bg-background/30 border-primary/10 hover:bg-background/50"
          onClick={() => insertFormatting('> ', '')}
        >
          <Quote className="h-4 w-4 mr-1" />
          <span>Quote</span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="backdrop-blur-md bg-primary/20 hover:bg-primary/30 text-primary"
              disabled={isEnhancing}
            >
              {isEnhancing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              <span>Enhance</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleEnhance("Improve writing quality")}>
              <Sparkles className="h-4 w-4 mr-2" /> Improve writing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEnhance("Fix grammar and spelling")}>
              <CheckSquare className="h-4 w-4 mr-2" /> Fix grammar & spelling
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEnhance("Make more concise")}>
              <Sparkles className="h-4 w-4 mr-2" /> Make more concise
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEnhance("Expand with more details")}>
              <Sparkles className="h-4 w-4 mr-2" /> Expand with details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {isGenerating ? (
        <div className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-6 min-h-[300px] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-lg font-medium">Generating draft...</p>
            <p className="text-muted-foreground mt-2">Using AI to create your assignment</p>
          </div>
        </div>
      ) : (
        <textarea
          id="editor"
          className="backdrop-blur-md bg-background/30 border-primary/10 rounded-lg p-6 w-full min-h-[300px] focus:outline-none focus:ring-1 focus:ring-primary resize-y font-mono"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Start writing or generate content with AI..."
        ></textarea>
      )}
    </div>
  );
}
