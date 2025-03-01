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
    // Mock data for testing when Canvas credentials aren't available
    if (!canvasUrl || !canvasToken) {
      return [
        {
          id: 1001,
          name: "CS 101: Introduction to Programming",
          courseCode: "CS 101",
          term: "Fall 2023",
          startDate: "2023-09-01",
          endDate: "2023-12-15",
          status: 'active'
        },
        {
          id: 1002,
          name: "MATH 240: Linear Algebra",
          courseCode: "MATH 240",
          term: "Fall 2023",
          startDate: "2023-09-01",
          endDate: "2023-12-15",
          status: 'active'
        },
        {
          id: 1003,
          name: "ENG 205: Technical Writing",
          courseCode: "ENG 205",
          term: "Fall 2023",
          startDate: "2023-09-01",
          endDate: "2023-12-15",
          status: 'active'
        },
        {
          id: 1004,
          name: "HIST 110: World History",
          courseCode: "HIST 110",
          term: "Fall 2023",
          startDate: "2023-09-01",
          endDate: "2023-12-15",
          status: 'upcoming'
        }
      ];
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
    // Mock data for testing when Canvas credentials aren't available
    if (!canvasUrl || !canvasToken) {
      const mockAssignments: CanvasAssignment[] = [
        {
          id: 2001,
          name: "Python Functions Assignment",
          description: "Create a program that implements three different mathematical functions using Python. Include proper documentation and test cases.",
          dueAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          pointsPossible: 100,
          submissionTypes: ["online_text_entry", "online_upload"],
          courseId: courseId,
          status: 'active',
          externalLinks: ["https://docs.google.com/document/d/example1", "https://university.edu/resources/python_guide.pdf"],
          completed: false
        },
        {
          id: 2002,
          name: "Algorithm Analysis",
          description: "Analyze the time and space complexity of the provided sorting algorithms. Include examples and compare their performance.",
          dueAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          pointsPossible: 75,
          submissionTypes: ["online_text_entry"],
          courseId: courseId,
          status: 'active',
          completed: false
        },
        {
          id: 2003,
          name: "Data Structures Quiz",
          description: "Complete the online quiz about basic data structures: arrays, linked lists, stacks, and queues.",
          dueAt: new Date().toISOString(),
          pointsPossible: 50,
          submissionTypes: ["online_quiz"],
          courseId: courseId,
          status: 'active',
          completed: false
        },
        {
          id: 2004,
          name: "Introduction to Variables",
          description: "Write a report explaining different variable types in programming languages and their use cases.",
          dueAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          pointsPossible: 60,
          submissionTypes: ["online_text_entry", "online_upload"],
          courseId: courseId,
          status: 'completed',
          completed: true,
          submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          graded: true,
          grade: "92%"
        },
        {
          id: 2005,
          name: "Object-Oriented Design",
          description: "Create a class hierarchy for a simple library management system using OOP principles.",
          dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          pointsPossible: 120,
          submissionTypes: ["online_text_entry", "online_upload"],
          courseId: courseId,
          status: 'upcoming',
          completed: false
        }
      ];
      
      // Sort assignments by due date (most recent first)
      return sortAssignmentsByDueDate(mockAssignments);
    }
    
    // Fetch assignments and submissions to determine completion status
    const [assignmentsData, submissionsData] = await Promise.all([
      makeCanvasRequest(canvasUrl, canvasToken, `/courses/${courseId}/assignments`),
      makeCanvasRequest(canvasUrl, canvasToken, `/courses/${courseId}/students/submissions?include[]=assignment`)
    ]);
    
    const validatedData = z.array(canvasAssignmentSchema).parse(assignmentsData);
    
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
    
    // Sort assignments by due date
    return sortAssignmentsByDueDate(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    throw new Error('Failed to fetch assignments from Canvas');
  }
}

// Helper function to sort assignments by due date, newest first 
function sortAssignmentsByDueDate(assignments: CanvasAssignment[]): CanvasAssignment[] {
  // Make a copy of the array to avoid mutating the original
  return [...assignments].sort((a, b) => {
    // First display all assignments regardless of status
    // Sort by due date (newer assignments first)
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1; // Assignments without due dates at the end
    if (!b.dueAt) return -1;
    
    // Convert dates to timestamps for comparison
    const dateA = new Date(a.dueAt).getTime();
    const dateB = new Date(b.dueAt).getTime();
    
    // Sort newest (closest to current date) first
    const now = Date.now();
    const distanceA = Math.abs(dateA - now);
    const distanceB = Math.abs(dateB - now);
    
    return distanceA - distanceB; // Closest to current date first
  });
}

export async function getAssignmentDetails(
  canvasUrl: string | undefined, 
  canvasToken: string | undefined, 
  courseId: number, 
  assignmentId: number
): Promise<CanvasAssignment> {
  try {
    // Mock data for testing when Canvas credentials aren't available
    if (!canvasUrl || !canvasToken) {
      const mockAssignments = await getCourseAssignments(undefined, undefined, courseId);
      const assignment = mockAssignments.find(a => a.id === assignmentId);
      
      if (!assignment) {
        throw new Error('Assignment not found');
      }
      
      return assignment;
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
    // Mock success for testing when Canvas credentials aren't available
    if (!canvasUrl || !canvasToken) {
      return {
        success: true,
        message: 'Assignment submitted successfully (mock)'
      };
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
    // In a real implementation, this would use the browser-use library
    // to extract content from external links
    // For now, we'll simulate successful content extraction
    
    // Mock content extraction
    const mockContent = `
      This is extracted content from ${url}.
      
      The document contains important information about the assignment:
      
      1. Implement all required functions following the specifications
      2. Make sure to include appropriate error handling
      3. Write comprehensive tests for each function
      4. Submit both the implementation and test files
      
      The grading rubric emphasizes code quality, documentation, and test coverage.
    `;
    
    return {
      content: mockContent,
      success: true
    };
  } catch (error) {
    console.error('Error analyzing external link:', error);
    throw new Error('Failed to analyze external link');
  }
}
