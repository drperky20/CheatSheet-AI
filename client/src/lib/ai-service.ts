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

export async function analyzeAssignment(
  assignmentDetails: string,
  externalContent?: string
): Promise<AnalysisResult> {
  const response = await fetch('/api/ai/analyze-assignment', {
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
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): Promise<DraftResult> {
  const response = await fetch('/api/ai/generate-draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      assignmentDetails,
      analysisResult,
      externalContent
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
  instruction: string
): Promise<string> {
  const response = await fetch('/api/ai/enhance-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      content,
      instruction
    }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to enhance content');
  }
  
  const result = await response.json();
  return result.content;
}
