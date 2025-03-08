import { z } from "zod";

// Define Canvas API response schemas
const canvasCourseSchema = z.object({
  id: z.number(),
  name: z.string(),
  course_code: z.string(),
  term: z.object({ name: z.string() }).optional(),
  start_at: z.string().nullable(),
  end_at: z.string().nullable(),
  workflow_state: z.string(),
});

const canvasAssignmentSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  due_at: z.string().nullable(),
  points_possible: z.number(),
  submission_types: z.array(z.string()),
  course_id: z.number(),
  html_url: z.string(),
  published: z.boolean().optional(),
  workflow_state: z.string().optional(),
});

// Types for our standardized API responses
export interface CanvasCourse {
  id: number;
  name: string;
  courseCode: string;
  term?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'completed' | 'upcoming';
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  dueAt: string | null;
  pointsPossible: number;
  submissionTypes: string[];
  courseId: number;
  status: 'active' | 'upcoming' | 'completed' | 'overdue';
  externalLinks?: string[];
  completed?: boolean;
  submittedAt?: string | null;
  graded?: boolean;
  grade?: string | null;
}

export interface CanvasSubmission {
  assignmentId: number;
  body: string;
  submittedAt: string;
  file?: any;
}

// Helper function to make Canvas API requests
async function makeCanvasRequest(
  canvasUrl: string | undefined,
  canvasToken: string | undefined,
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  if (!canvasUrl || !canvasToken) {
    throw new Error('Canvas URL and token are required');
  }
  
  // Normalize the URL
  const baseUrl = canvasUrl.includes('http') 
    ? canvasUrl 
    : `https://${canvasUrl}`;
  
  const url = `${baseUrl}/api/v1${endpoint}`;
  
  const response = await fetch(url, {
    method,
    headers: {
      'Authorization': `Bearer ${canvasToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Canvas API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

// Extract links from HTML content
function extractLinks(html: string): string[] {
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/g;
  const links: string[] = [];
  let match;
  
  while ((match = linkRegex.exec(html)) !== null) {
    if (match[1] && !match[1].startsWith('#')) {
      links.push(match[1]);
    }
  }
  
  return links;
}

// Determine assignment status based on due date
function determineAssignmentStatus(dueAt: string | null): 'active' | 'upcoming' | 'completed' | 'overdue' {
  if (!dueAt) return 'active';
  
  const now = new Date();
  const dueDate = new Date(dueAt);
  const differenceInDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (differenceInDays < 0) {
    return 'overdue';
  } else if (differenceInDays <= 7) {
    return 'active';
  } else {
    return 'upcoming';
  }
}

// Determine course status based on dates
function determineCourseStatus(
  startDate: string | null | undefined,
  endDate: string | null | undefined
): 'active' | 'completed' | 'upcoming' {
  if (!startDate || !endDate) return 'active';
  
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return 'upcoming';
  } else if (now > end) {
    return 'completed';
  } else {
    return 'active';
  }
}

// API Functions
export async function getCourses(canvasUrl: string | undefined, canvasToken: string | undefined): Promise<CanvasCourse[]> {
  try {
    if (!canvasUrl || !canvasToken) {
      throw new Error('Canvas URL and token are required for authentication');
    }
    
    const data = await makeCanvasRequest(canvasUrl, canvasToken, '/courses?enrollment_state=active&include[]=term');
    
    const validatedData = z.array(canvasCourseSchema).parse(data);
    
    return validatedData.map(course => ({
      id: course.id,
      name: course.name,
      courseCode: course.course_code,
      term: course.term?.name,
      startDate: course.start_at || undefined,
      endDate: course.end_at || undefined,
      status: determineCourseStatus(course.start_at, course.end_at)
    }));
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw new Error('Failed to fetch courses from Canvas');
  }
}

export async function getCourseAssignments(
  canvasUrl: string | undefined, 
  canvasToken: string | undefined, 
  courseId: number
): Promise<CanvasAssignment[]> {
  try {
    if (!canvasUrl || !canvasToken) {
      throw new Error('Canvas URL and token are required for authentication');
    }
    
    // Implement pagination to get all assignments
    let allAssignments: any[] = [];
    let page = 1;
    let hasMore = true;
    const PER_PAGE = 100; // Maximum allowed by Canvas API
    
    console.log(`Fetching Canvas assignments for course ${courseId}`);
    
    // Fetch all pages of assignments
    while (hasMore) {
      console.log(`Fetching assignments page ${page}...`);
      const pageData = await makeCanvasRequest(
        canvasUrl, 
        canvasToken, 
        `/courses/${courseId}/assignments?page=${page}&per_page=${PER_PAGE}`
      );
      
      const pageAssignments = Array.isArray(pageData) ? pageData : [];
      console.log(`Received ${pageAssignments.length} assignments on page ${page}`);
      
      if (pageAssignments.length === 0) {
        hasMore = false;
      } else {
        allAssignments = [...allAssignments, ...pageAssignments];
        
        // If we received fewer assignments than the page size, we've reached the end
        if (pageAssignments.length < PER_PAGE) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }
    
    // Fetch submissions to determine completion status
    const submissionsData = await makeCanvasRequest(
      canvasUrl, 
      canvasToken, 
      `/courses/${courseId}/students/submissions?include[]=assignment`
    );
    
    // Only validate the data after all pages have been fetched
    // Filter out any deleted or unpublished assignments
    const validAssignments = allAssignments.filter(assignment => 
      assignment && 
      assignment.workflow_state !== 'deleted' &&
      assignment.published !== false
    );
    
    const validatedData = z.array(canvasAssignmentSchema).parse(validAssignments);
    console.log(`Total valid assignments: ${validatedData.length}`);
    
    // Create a map of submission status by assignment ID
    const submissionMap = new Map();
    if (Array.isArray(submissionsData)) {
      submissionsData.forEach(submission => {
        if (submission && submission.assignment_id) {
          submissionMap.set(submission.assignment_id, {
            submitted: !!submission.submitted_at,
            submittedAt: submission.submitted_at,
            graded: submission.graded,
            grade: submission.grade
          });
        }
      });
    }
    
    // Build assignments with completion status
    const assignments = validatedData.map(assignment => {
      const externalLinks = extractLinks(assignment.description);
      const submissionInfo = submissionMap.get(assignment.id) || {};
      
      return {
        id: assignment.id,
        name: assignment.name,
        description: assignment.description,
        dueAt: assignment.due_at,
        pointsPossible: assignment.points_possible,
        submissionTypes: assignment.submission_types,
        courseId: assignment.course_id,
        status: determineAssignmentStatus(assignment.due_at),
        externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
        completed: !!submissionInfo.submitted,
        submittedAt: submissionInfo.submittedAt || null,
        graded: !!submissionInfo.graded,
        grade: submissionInfo.grade || null
      };
    });
    
    // Sort assignments by due date using our improved sorting function
    const sortedAssignments = sortAssignmentsByDueDate(assignments);
    console.log(`Returning ${sortedAssignments.length} sorted assignments`);
    return sortedAssignments;
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw new Error('Failed to fetch assignments from Canvas');
  }
}

// Helper function to sort assignments by due date, based on the reference implementation
function sortAssignmentsByDueDate(assignments: CanvasAssignment[]): CanvasAssignment[] {
  // Make a copy of the array to avoid mutating the original
  return [...assignments].sort((a, b) => {
    // First, prioritize assignments by status
    // Active/upcoming assignments should come first
    const statusOrder = {
      'active': 0,
      'upcoming': 1,
      'overdue': 2,
      'completed': 3
    };
    
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // For assignments with the same status, sort by due date
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1; // Assignments without due dates at the end
    if (!b.dueAt) return -1;
    
    // For assignments with due dates, sort by date (earlier due dates first)
    const dateA = new Date(a.dueAt).getTime();
    const dateB = new Date(b.dueAt).getTime();
    
    return dateA - dateB; // Earlier due dates first
  });
}

export async function getAssignmentDetails(
  canvasUrl: string | undefined, 
  canvasToken: string | undefined, 
  courseId: number, 
  assignmentId: number
): Promise<CanvasAssignment> {
  try {
    if (!canvasUrl || !canvasToken) {
      throw new Error('Canvas URL and token are required for authentication');
    }
    
    // Fetch both assignment details and submission status
    const [assignmentData, submissionData] = await Promise.all([
      makeCanvasRequest(canvasUrl, canvasToken, `/courses/${courseId}/assignments/${assignmentId}`),
      makeCanvasRequest(canvasUrl, canvasToken, `/courses/${courseId}/assignments/${assignmentId}/submissions/self`)
    ]);
    
    const validatedData = canvasAssignmentSchema.parse(assignmentData);
    const externalLinks = extractLinks(validatedData.description);
    
    // Extract submission status if available
    const completed = submissionData && submissionData.submitted_at ? true : false;
    const submittedAt = submissionData ? submissionData.submitted_at : null;
    const graded = submissionData && submissionData.graded ? true : false;
    const grade = submissionData ? submissionData.grade : null;
    
    return {
      id: validatedData.id,
      name: validatedData.name,
      description: validatedData.description,
      dueAt: validatedData.due_at,
      pointsPossible: validatedData.points_possible,
      submissionTypes: validatedData.submission_types,
      courseId: validatedData.course_id,
      status: determineAssignmentStatus(validatedData.due_at),
      externalLinks: externalLinks.length > 0 ? externalLinks : undefined,
      completed,
      submittedAt,
      graded,
      grade
    };
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    throw new Error('Failed to fetch assignment details from Canvas');
  }
}

export async function submitAssignment(
  canvasUrl: string | undefined, 
  canvasToken: string | undefined, 
  courseId: number, 
  assignmentId: number,
  submission: CanvasSubmission
): Promise<{ success: boolean; message: string }> {
  try {
    if (!canvasUrl || !canvasToken) {
      throw new Error('Canvas URL and token are required for authentication');
    }
    
    const payload = {
      submission: {
        submission_type: submission.file ? 'online_upload' : 'online_text_entry',
        body: submission.body,
        file_ids: submission.file ? [submission.file] : undefined
      }
    };
    
    await makeCanvasRequest(
      canvasUrl, 
      canvasToken, 
      `/courses/${courseId}/assignments/${assignmentId}/submissions`, 
      'POST', 
      payload
    );
    
    return {
      success: true,
      message: 'Assignment submitted successfully'
    };
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw new Error('Failed to submit assignment to Canvas');
  }
}

export async function analyzeExternalLink(
  canvasUrl: string | undefined, 
  canvasToken: string | undefined, 
  url: string
): Promise<{ content: string; success: boolean }> {
  try {
    if (!canvasUrl || !canvasToken) {
      throw new Error('Canvas URL and token are required for authentication');
    }
    
    // Make API request to analyze the external link
    const response = await makeCanvasRequest(
      canvasUrl,
      canvasToken,
      '/analyze-link',
      'POST',
      { url }
    );
    
    return response;
  } catch (error) {
    console.error('Error analyzing external link:', error);
    throw new Error('Failed to analyze external link');
  }
}
