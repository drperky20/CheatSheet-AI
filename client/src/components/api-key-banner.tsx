import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ApiKeySettings } from '@/components/api-key-settings';
import { useApiKeyStatus } from '@/components/api-key-settings';

export function ApiKeyBanner() {
  const [showSettings, setShowSettings] = useState(false);
  const { isKeySet, isLoading } = useApiKeyStatus();
  
  if (isLoading || isKeySet) {
    return null;
  }
  
  return (
    <>
      <Alert className="mb-4 border-amber-500 bg-amber-500/10">
        <AlertTriangle className="h-4 w-4 text-amber-500" />
        <AlertTitle>API Key Required</AlertTitle>
        <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            A Google Gemini API key is required to use the AI features. 
            You can get a free API key from Google AI Studio.
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(true)}
          >
            Configure API Key
          </Button>
        </AlertDescription>
      </Alert>
      
      <ApiKeySettings 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
    </>
  );
}