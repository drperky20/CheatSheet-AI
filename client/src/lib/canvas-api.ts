// Canvas API Interface
interface CanvasCourse {
  id: number;
  name: string;
  courseCode: string;
  term?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'upcoming';
}

interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  dueAt: string | null;
  pointsPossible: number;
  submissionTypes: string[];
  courseId: number;
  status: 'active' | 'upcoming' | 'completed' | 'overdue';
  externalLinks?: string[];
}

interface CanvasSubmission {
  assignmentId: number;
  body: string;
  submittedAt: string;
  file?: File;
}

export async function fetchCourses(): Promise<CanvasCourse[]> {
  const response = await fetch('/api/canvas/courses');
  if (!response.ok) {
    throw new Error('Failed to fetch courses');
  }
  return response.json();
}

export async function fetchCourseAssignments(courseId: number): Promise<CanvasAssignment[]> {
  const response = await fetch(`/api/canvas/courses/${courseId}/assignments`);
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  return response.json();
}

export async function fetchAssignmentDetails(courseId: number, assignmentId: number): Promise<CanvasAssignment> {
  const response = await fetch(`/api/canvas/courses/${courseId}/assignments/${assignmentId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch assignment details');
  }
  return response.json();
}

export async function submitAssignment(
  courseId: number,
  assignmentId: number,
  submission: CanvasSubmission
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`/api/canvas/courses/${courseId}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(submission),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to submit assignment');
  }
  
  return response.json();
}

export async function analyzeExternalLink(
  url: string
): Promise<{ content: string; success: boolean }> {
  const response = await fetch('/api/canvas/analyze-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
    credentials: 'include',
  });
  
  if (!response.ok) {
    throw new Error('Failed to analyze external link');
  }
  
  return response.json();
}
