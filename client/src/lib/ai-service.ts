interface AnalysisResult {
  assignmentType: string;
  topics: string[];
  requirements: string[];
  suggestedApproach: string;
  externalLinks: string[];
  customPrompt: string;
}

interface DraftResult {
  content: string;
  citations?: string[];
  notes?: string;
}

interface ApiKeyStatus {
  isSet: boolean;
  provider: string | null;
}

interface ApiKeyTestResult {
  success: boolean;
  message: string;
}

export async function checkGeminiApiKey(): Promise<ApiKeyStatus> {
  // Always return that the API key is set (since we're using the developer's key)
  return {
    isSet: true,
    provider: "Google Gemini"
  };
}

export async function testGeminiApiKey(apiKey: string): Promise<ApiKeyTestResult> {
  const response = await fetch('/api/gemini/test-api-key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey
    }),
    credentials: 'include',
  });
  
  const result = await response.json();
  
  if (!response.ok) {
    return {
      success: false,
      message: result.message || 'Failed to test API key'
    };
  }
  
  return result;
}

export async function setGeminiApiKey(apiKey: string): Promise<void> {
  const response = await fetch('/api/gemini/set-api-key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      apiKey
    }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    const error = await response.json();
    throw new Error(error.message || 'Failed to set API key');
  }
}

export async function analyzeAssignment(
  assignmentDetails: string,
  externalContent?: string
): Promise<AnalysisResult> {
  const response = await fetch('/api/gemini/analyze-assignment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assignmentDetails,
      externalContent
    }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze assignment');
  }
  
  return response.json();
}

export async function generateDraft(
  analysisResult: AnalysisResult,
  additionalInstructions?: string
): Promise<DraftResult> {
  const response = await fetch('/api/gemini/generate-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      analysisResult,
      additionalInstructions
    }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate draft');
  }
  
  return response.json();
}

export async function enhanceContent(
  content: string,
  instructions: string
): Promise<string> {
  const response = await fetch('/api/gemini/enhance-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      instructions
    }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to enhance content');
  }
  
  const result = await response.json();
  return result.content;
}
