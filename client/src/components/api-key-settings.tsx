import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkGeminiApiKey, setGeminiApiKey, testGeminiApiKey } from '@/lib/ai-service';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Check, KeyRound, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const apiKeySchema = z.object({
  apiKey: z.string().min(1, 'API key is required')
});

type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

interface ApiKeySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeySettings({ open, onOpenChange }: ApiKeySettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query to check if API key is set
  const { data: keyStatus, isLoading } = useQuery({
    queryKey: ['apiKeyStatus'],
    queryFn: async () => {
      try {
        return await checkGeminiApiKey();
      } catch (error) {
        console.error('Error checking API key:', error);
        return { isSet: false, provider: null };
      }
    },
    refetchOnWindowFocus: false
  });
  
  // Mutation to set API key
  const setApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      return await setGeminiApiKey(apiKey);
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: 'API key updated',
        description: 'Your Gemini API key has been successfully updated.',
        variant: 'default',
      });
      
      // Invalidate the API key status query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['apiKeyStatus'] });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update API key',
        description: error.message || 'An error occurred while updating your API key.',
        variant: 'destructive',
      });
    }
  });
  
  // Form setup
  const form = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: ''
    }
  });
  
  // API key test mutation
  const testApiKeyMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const result = await testGeminiApiKey(apiKey);
      
      if (!result.success) {
        throw new Error(result.message || 'API key validation failed');
      }
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: 'API key validated',
        description: 'Your Gemini API key is valid.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Invalid API key',
        description: error instanceof Error ? error.message : 'Your API key could not be validated.',
        variant: 'destructive',
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: ApiKeyFormValues) => {
    setApiKeyMutation.mutate(values.apiKey);
  };
  
  // Test API key
  const onTestApiKey = () => {
    const apiKey = form.getValues('apiKey');
    if (!apiKey) {
      toast({
        title: 'API key required',
        description: 'Please enter an API key to test.',
        variant: 'destructive',
      });
      return;
    }
    
    testApiKeyMutation.mutate(apiKey);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>API Key Settings</DialogTitle>
          <DialogDescription>
            Add your Google Gemini API key to enable AI-powered features.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card className="border-muted">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Current API Key Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {keyStatus?.isSet ? (
                    <>
                      <div className="rounded-full bg-green-100 p-1">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">API Key is configured</p>
                        <p className="text-xs text-muted-foreground">
                          Using {keyStatus.provider || 'AI'} API
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-amber-100 p-1">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">No API Key configured</p>
                        <p className="text-xs text-muted-foreground">
                          AI features will be limited or unavailable
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Gemini API Key</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <KeyRound className="h-4 w-4 text-muted-foreground" />
                          <Input
                            {...field}
                            type="password"
                            placeholder="Enter your API key"
                            className="flex-1"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground mt-1">
                        You can get a Gemini API key from{" "}
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-2 hover:text-primary"
                        >
                          Google AI Studio
                        </a>
                      </p>
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <div className="order-1 sm:order-none">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="secondary"
                      onClick={onTestApiKey}
                      disabled={testApiKeyMutation.isPending}
                    >
                      {testApiKeyMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Test API Key
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={setApiKeyMutation.isPending}
                    >
                      {setApiKeyMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save API Key
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function useApiKeyStatus() {
  // Get API key status
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['apiKeyStatus'],
    queryFn: async () => {
      try {
        return await checkGeminiApiKey();
      } catch (error) {
        console.error('Error checking API key:', error);
        return { isSet: false, provider: null };
      }
    },
    refetchOnWindowFocus: false
  });
  
  return {
    isKeySet: data?.isSet || false,
    provider: data?.provider || null,
    isLoading,
    isError,
    error
  };
}