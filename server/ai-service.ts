// AI Service for CheatSheet AI
// This service implements the logic for analyzing assignments and generating drafts

// Analysis Result Type
export interface AnalysisResult {
  assignmentType: string;
  topics: string[];
  requirements: string[];
  suggestedApproach: string;
  externalLinks: string[];
  customPrompt: string;
}

// Draft Result Type
export interface DraftResult {
  content: string;
  citations?: string[];
  notes?: string;
}

// Helper function to simulate AI processing with delay
async function simulateAIProcessing(delay: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, delay));
}

// Extract and classify assignment type
function classifyAssignmentType(description: string): string {
  if (description.toLowerCase().includes('essay') || description.toLowerCase().includes('write')) {
    return 'Writing Assignment';
  } else if (description.toLowerCase().includes('quiz') || description.toLowerCase().includes('test')) {
    return 'Quiz/Test';
  } else if (description.toLowerCase().includes('code') || description.toLowerCase().includes('program')) {
    return 'Programming Assignment';
  } else if (description.toLowerCase().includes('research') || description.toLowerCase().includes('report')) {
    return 'Research Assignment';
  } else if (description.toLowerCase().includes('present') || description.toLowerCase().includes('presentation')) {
    return 'Presentation';
  } else {
    return 'General Assignment';
  }
}

// Extract requirements from assignment description
function extractRequirements(description: string): string[] {
  // This is a simplified implementation. In a real scenario, we would use NLP techniques
  // to extract requirements from the text.
  const requirements: string[] = [];
  
  // Extract bullet points or numbered lists
  const bulletRegex = /(?:^|\n)[•\-*]\s*(.*?)(?:$|\n)/g;
  let bulletMatch;
  while ((bulletMatch = bulletRegex.exec(description)) !== null) {
    if (bulletMatch[1].trim()) {
      requirements.push(bulletMatch[1].trim());
    }
  }
  
  // Extract numbered lists
  const numberedRegex = /(?:^|\n)\d+\.\s*(.*?)(?:$|\n)/g;
  let numberedMatch;
  while ((numberedMatch = numberedRegex.exec(description)) !== null) {
    if (numberedMatch[1].trim()) {
      requirements.push(numberedMatch[1].trim());
    }
  }
  
  // If no structured requirements were found, try to extract sentences that sound like requirements
  if (requirements.length === 0) {
    const requirementPhrases = ['must', 'should', 'need to', 'required', 'minimum', 'at least'];
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    for (const sentence of sentences) {
      if (requirementPhrases.some(phrase => sentence.toLowerCase().includes(phrase))) {
        requirements.push(sentence.trim());
      }
    }
  }
  
  // If still no requirements, extract some key sentences
  if (requirements.length === 0) {
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
    for (const sentence of sentences.slice(0, 3)) {
      requirements.push(sentence.trim());
    }
  }
  
  return requirements;
}

// Extract topics from assignment description
function extractTopics(description: string): string[] {
  // Simplified implementation. Would use NLP in a real scenario.
  const topics: string[] = [];
  const keywords = [
    'python', 'javascript', 'programming', 'math', 'history', 'science', 
    'literature', 'physics', 'chemistry', 'biology', 'economics', 'business',
    'art', 'music', 'philosophy', 'psychology', 'sociology', 'anthropology',
    'engineering', 'medicine', 'law', 'education', 'technology', 'climate',
    'environment', 'politics', 'health', 'sport', 'culture', 'religion',
    'language', 'geography', 'debate', 'ethics', 'research', 'analysis',
    'design', 'development', 'testing', 'implementation', 'evaluation'
  ];
  
  for (const keyword of keywords) {
    if (description.toLowerCase().includes(keyword)) {
      topics.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  }
  
  // Ensure we have at least some topics
  if (topics.length === 0) {
    const assignmentType = classifyAssignmentType(description);
    topics.push(assignmentType);
  }
  
  // Limit to 5 topics
  return topics.slice(0, 5);
}

// Generate custom prompt based on assignment type
function generateCustomPrompt(
  assignmentType: string, 
  requirements: string[], 
  topics: string[]
): string {
  const requirementsText = requirements.map(req => `- ${req}`).join('\n');
  const topicsText = topics.join(', ');
  
  const basePrompt = `
    You are a knowledgeable assistant helping a student complete an assignment. 
    Assignment type: ${assignmentType}
    Topics: ${topicsText}
    
    Key requirements:
    ${requirementsText}
    
    Create a well-structured, thoughtful response that addresses all requirements.
    Write in a clear, academic style that demonstrates understanding of the subject.
    Provide specific examples and evidence to support your points.
    Ensure the work is original and tailored to the specific assignment.
  `;
  
  // Add specific guidance based on assignment type
  let typeSpecificPrompt = '';
  
  switch (assignmentType) {
    case 'Writing Assignment':
      typeSpecificPrompt = `
        Structure your response with a clear introduction, well-developed body paragraphs, and a conclusion.
        Use formal academic language and avoid colloquialisms.
        Include a thesis statement in the introduction that previews your main arguments.
        Each paragraph should have a clear topic sentence and supporting evidence.
      `;
      break;
    case 'Programming Assignment':
      typeSpecificPrompt = `
        Include well-commented code examples that address the requirements.
        Explain your approach and the logic behind your code.
        Consider edge cases and error handling in your implementation.
        Include explanations of any algorithms or data structures you use.
      `;
      break;
    case 'Research Assignment':
      typeSpecificPrompt = `
        Present a balanced view of the topic, considering multiple perspectives.
        Cite relevant sources and research to support your arguments.
        Structure your response with clear sections addressing different aspects of the topic.
        Conclude with implications or recommendations based on your research.
      `;
      break;
    case 'Presentation':
      typeSpecificPrompt = `
        Create a clear structure with an introduction, main points, and conclusion.
        Include visual elements or descriptions where appropriate.
        Use engaging language that would capture the audience's attention.
        Include speaker notes or additional context where needed.
      `;
      break;
    default:
      typeSpecificPrompt = `
        Structure your response clearly with appropriate headings and sections.
        Balance theoretical knowledge with practical applications.
        Include specific examples that demonstrate understanding of the concepts.
      `;
  }
  
  return basePrompt + typeSpecificPrompt;
}

// Generate a suggested approach based on assignment type and requirements
function generateSuggestedApproach(
  assignmentType: string, 
  requirements: string[]
): string {
  switch (assignmentType) {
    case 'Writing Assignment':
      return `
        1. Start by outlining your main arguments
        2. Create a strong thesis statement
        3. Develop each point with evidence and analysis
        4. Write a compelling introduction and conclusion
        5. Review for clarity, coherence, and grammar
      `;
    case 'Programming Assignment':
      return `
        1. Break down the problem into smaller components
        2. Plan your data structures and algorithms
        3. Implement the core functionality first
        4. Add error handling and edge case management
        5. Test thoroughly with various inputs
        6. Document your code and approach
      `;
    case 'Research Assignment':
      return `
        1. Gather sources and relevant research
        2. Analyze different perspectives on the topic
        3. Organize your findings into logical sections
        4. Develop your own analysis based on the research
        5. Cite sources properly and create a bibliography
      `;
    case 'Quiz/Test':
      return `
        1. Review key concepts and definitions
        2. Practice with similar problems or questions
        3. Identify patterns in question types
        4. Create a structured approach for each question type
        5. Allocate time based on point values
      `;
    case 'Presentation':
      return `
        1. Define your key message and takeaways
        2. Structure content with a clear beginning, middle, and end
        3. Include visual elements to support your points
        4. Prepare speaking notes and practice delivery
        5. Anticipate questions and prepare responses
      `;
    default:
      return `
        1. Understand all requirements thoroughly
        2. Break down the assignment into manageable parts
        3. Create a structured outline addressing each requirement
        4. Develop high-quality content for each section
        5. Review against the original requirements
      `;
  }
}

// Main function to analyze an assignment
export async function analyzeAssignment(
  assignmentDetails: string,
  externalContent?: string
): Promise<AnalysisResult> {
  // Simulate AI processing time
  await simulateAIProcessing(2000);
  
  // Extract information from the assignment
  const assignmentType = classifyAssignmentType(assignmentDetails);
  const requirements = extractRequirements(assignmentDetails);
  const topics = extractTopics(assignmentDetails);
  
  // Extract external links
  const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/g;
  const externalLinks: string[] = [];
  let match;
  
  while ((match = linkRegex.exec(assignmentDetails)) !== null) {
    if (match[1] && !match[1].startsWith('#')) {
      externalLinks.push(match[1]);
    }
  }
  
  // Generate approach and custom prompt
  const suggestedApproach = generateSuggestedApproach(assignmentType, requirements);
  const customPrompt = generateCustomPrompt(assignmentType, requirements, topics);
  
  // If external content was provided, integrate it into the analysis
  if (externalContent) {
    // In a real implementation, we would analyze the external content
    // and update our understanding of the assignment
    requirements.push("Additional requirements from external resources have been incorporated.");
  }
  
  return {
    assignmentType,
    topics,
    requirements,
    suggestedApproach,
    externalLinks,
    customPrompt
  };
}

// Generate a draft based on the analysis
export async function generateDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): Promise<DraftResult> {
  // Simulate AI processing time
  await simulateAIProcessing(3000);
  
  // In a real implementation, this would call the Gemini 2.0 Flash model
  // with the custom prompt from the analysis result
  
  let draftContent = '';
  
  // Generate different kinds of content based on assignment type
  switch (analysisResult.assignmentType) {
    case 'Programming Assignment':
      draftContent = generateProgrammingAssignmentDraft(assignmentDetails, analysisResult, externalContent);
      break;
    case 'Writing Assignment':
      draftContent = generateWritingAssignmentDraft(assignmentDetails, analysisResult, externalContent);
      break;
    case 'Research Assignment':
      draftContent = generateResearchAssignmentDraft(assignmentDetails, analysisResult, externalContent);
      break;
    case 'Presentation':
      draftContent = generatePresentationDraft(assignmentDetails, analysisResult, externalContent);
      break;
    default:
      draftContent = generateGeneralAssignmentDraft(assignmentDetails, analysisResult, externalContent);
  }
  
  // Generate citations if applicable
  const citations = externalContent 
    ? ['External resource cited in this draft']
    : undefined;
  
  return {
    content: draftContent,
    citations,
    notes: 'This draft has been generated based on the assignment requirements. Please review and personalize it as needed.'
  };
}

// Helper function to generate programming assignment draft
function generateProgrammingAssignmentDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  // Extract relevant information from the analysis
  const { topics, requirements, suggestedApproach, customPrompt } = analysisResult;
  
  // Combine assignment details with external content if available
  const context = externalContent ? 
    `Assignment Details:\n${assignmentDetails}\n\nAdditional Context:\n${externalContent}` :
    assignmentDetails;
  
  // Create a dynamic programming assignment draft based on actual content
  const title = topics.length > 0 ? topics[0] : "Programming Assignment";
  
  // Build requirements section from the actual requirements
  const requirementsList = requirements.map(req => `- ${req}`).join('\n');
  
  // Create a simple implementation strategy based on suggested approach
  const implementationStrategy = suggestedApproach.split('\n').map(line => line.trim()).filter(line => line.length > 0).join('\n');
  
  return `# ${title}

## Assignment Overview
${context.substring(0, 200)}...

## Requirements
${requirementsList}

## Implementation Strategy
${implementationStrategy}

## Implementation Plan
1. Understand the problem requirements completely
2. Design the solution architecture using appropriate programming patterns
3. Implement the core functionality with robust error handling
4. Create comprehensive tests to verify correctness
5. Document the code and solution approach

## Conclusion
This implementation plan addresses all the specified requirements while ensuring code quality, maintainability, and performance.

## Notes
${customPrompt}
`;
}

// Helper function to generate writing assignment draft
function generateWritingAssignmentDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  // Extract relevant information from the analysis
  const { topics, requirements, suggestedApproach, customPrompt } = analysisResult;
  
  // Combine assignment details with external content if available
  const context = externalContent ? 
    `Assignment Details:\n${assignmentDetails}\n\nAdditional Context:\n${externalContent}` :
    assignmentDetails;
  
  // Create a dynamic writing assignment draft based on actual content
  const title = topics.length > 0 ? topics[0] : "Writing Assignment";
  
  // Build requirements section from the actual requirements
  const requirementsList = requirements.map(req => `- ${req}`).join('\n');
  
  // Create an outline based on the suggested approach
  const outlineSections = suggestedApproach.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  const formattedOutline = outlineSections.map(section => {
    // Check if it's a main section or subsection
    if (section.startsWith('- ')) {
      return `### ${section.substring(2)}`;
    } else {
      return `## ${section}`;
    }
  }).join('\n\n');
  
  return `# ${title}

## Assignment Overview
${context.substring(0, 300)}...

## Requirements
${requirementsList}

## Outline
${formattedOutline}

## Writing Approach
1. Conduct thorough research on the topic using credible sources
2. Develop a clear thesis statement that addresses the main requirements
3. Structure the essay with a logical flow of ideas
4. Support arguments with evidence and examples
5. Conclude with meaningful insights and implications

## Notes
${customPrompt}
`;
}

// Helper function to generate research assignment draft
function generateResearchAssignmentDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  // Extract relevant information from the analysis
  const { topics, requirements, suggestedApproach, customPrompt } = analysisResult;
  
  // Combine assignment details with external content if available
  const context = externalContent ? 
    `Assignment Details:\n${assignmentDetails}\n\nAdditional Context:\n${externalContent}` :
    assignmentDetails;
  
  // Create a dynamic research assignment draft based on actual content
  const title = topics.length > 0 ? topics[0] : "Research Paper";
  
  // Build requirements section from the actual requirements
  const requirementsList = requirements.map(req => `- ${req}`).join('\n');
  
  // Create research sections from the suggested approach
  const researchSections = suggestedApproach.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Format the research sections with proper numbering and hierarchy
  let sectionNumber = 1;
  const formattedSections = researchSections.map(section => {
    if (section.startsWith('- ')) {
      // This is a subsection
      return `### ${sectionNumber-1}.${section.substring(2).trim()}`;
    } else {
      // This is a main section
      return `## ${sectionNumber++}. ${section}`;
    }
  }).join('\n\n');
  
  return `# ${title}

## Abstract

This research paper will examine ${title.toLowerCase()} through a systematic investigation of the topic, incorporating analysis of relevant data and literature. The research aims to address key questions about ${topics.join(', ')} and provide insights on their implications.

## Assignment Overview
${context.substring(0, 300)}...

## Research Requirements
${requirementsList}

${formattedSections}

## Methodology

This research will employ a mixed-methods approach combining:

- Literature review of relevant scholarly sources
- Data analysis from primary and secondary sources
- Comparative case studies
- Synthesis of findings into actionable recommendations

## Expected Outcomes

This research aims to contribute to the understanding of ${topics[0]} by:
1. Identifying key patterns and relationships
2. Establishing a theoretical framework for analysis
3. Providing evidence-based recommendations
4. Opening avenues for future research

## Notes
${customPrompt}
`;
}

// Helper function to generate presentation draft
function generatePresentationDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  // Extract relevant information from the analysis
  const { topics, requirements, suggestedApproach, customPrompt } = analysisResult;
  
  // Combine assignment details with external content if available
  const context = externalContent ? 
    `Assignment Details:\n${assignmentDetails}\n\nAdditional Context:\n${externalContent}` :
    assignmentDetails;
  
  // Create a dynamic presentation title based on actual content
  const title = topics.length > 0 ? topics[0] : "Presentation";
  
  // Build requirements section from the actual requirements
  const requirementsList = requirements.map(req => `- ${req}`).join('\n');
  
  // Create presentation slides from the suggested approach
  const slideTopics = suggestedApproach.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Format the slides
  let slideNumber = 3; // Start at 3 because we have title and overview slides
  const formattedSlides = slideTopics.map(topic => {
    const slideContent = `### Slide ${slideNumber++}: ${topic.startsWith('- ') ? topic.substring(2) : topic}
**Key Points:**
- Topic exploration
- Supporting evidence
- Visual elements
- Discussion points

*[Speaker notes: Focus on clear explanation of concepts and engaging delivery.]*`;
    return slideContent;
  }).join('\n\n');
  
  return `# ${title}
## Presentation Outline

### Slide 1: Title Slide
**${title}**
- Presenter Name
- Date
- Course Information

### Slide 2: Presentation Overview
**Today's Agenda:**
${slideTopics.map(topic => `- ${topic.startsWith('- ') ? topic.substring(2) : topic}`).join('\n')}

## Assignment Overview
${context.substring(0, 150)}...

## Presentation Requirements
${requirementsList}

${formattedSlides}

### Slide ${slideTopics.length + 3}: Key Takeaways
**Remember These Points:**
- Main insights from the presentation
- Critical analysis of the topic
- Real-world applications
- Future research directions

*[Speaker notes: Emphasize actionable insights participants can apply.]*

### Slide ${slideTopics.length + 4}: Discussion Questions
**Let's Discuss:**
- What aspects of ${title} do you find most interesting?
- How can these concepts be applied in practice?
- What challenges might arise in implementation?
- How might future developments change our understanding?

*[Speaker notes: Prepare additional prompts if discussion is slow to start.]*

### Slide ${slideTopics.length + 5}: Thank You
**Contact Information:**
- Email address
- References and resources for further reading

## Notes
${customPrompt}
`;
}

// Helper function to generate general assignment draft
function generateGeneralAssignmentDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  // Extract relevant information from the analysis
  const { topics, requirements, suggestedApproach, customPrompt } = analysisResult;
  
  // Combine assignment details with external content if available
  const context = externalContent ? 
    `Assignment Details:\n${assignmentDetails}\n\nAdditional Context:\n${externalContent}` :
    assignmentDetails;
  
  // Create a dynamic title based on actual content
  const title = topics.length > 0 ? topics[0] : "Assignment Analysis";
  
  // Build requirements section from the actual requirements
  const requirementsList = requirements.map(req => `- ${req}`).join('\n');
  
  // Create structured sections from the suggested approach
  const sectionTopics = suggestedApproach.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // Format the sections with proper numbering
  let sectionNumber = 1;
  const formattedSections = sectionTopics.map(section => {
    if (section.startsWith('- ')) {
      // This is a subsection
      return `### ${sectionNumber-1}.${sectionNumber % 10} ${section.substring(2).trim()}

This subsection explores key aspects of the topic in detail, providing analysis and examples.

- Important point 1 related to this subtopic
- Important point 2 related to this subtopic
- Supporting evidence and analysis
- Practical implications`;
    } else {
      // This is a main section
      return `## ${sectionNumber++}. ${section}

This section provides an overview of ${section.toLowerCase()}, examining its significance and relationship to the overall topic.`;
    }
  }).join('\n\n');
  
  return `# ${title}

## Assignment Overview
${context.substring(0, 200)}...

## Requirements
${requirementsList}

## Introduction

This assignment analyzes ${title.toLowerCase()} and its various dimensions. The analysis covers key aspects, implications, and considerations related to this topic. By evaluating current research and relevant factors, this work aims to provide a comprehensive assessment of the subject matter.

${formattedSections}

## Conclusion

This analysis has examined ${title.toLowerCase()} from multiple perspectives. The key findings include the importance of understanding the interrelationships between various aspects of the topic, the practical implications for relevant stakeholders, and potential future developments. With appropriate approaches and methodologies, we can develop a more nuanced understanding of this subject and its broader implications.

## Notes
${customPrompt}
`;
}

// Function to enhance content based on specific instruction
export async function enhanceContent(
  content: string,
  instruction: string
): Promise<string> {
  // Simulate AI processing time
  await simulateAIProcessing(1500);
  
  // In a real implementation, this would call an AI model
  // to enhance the content according to the instruction
  
  // For demo purposes, just make some simple modifications
  let enhancedContent = content;
  
  switch (instruction.toLowerCase()) {
    case "improve writing quality":
      // Simulate improving the writing quality
      enhancedContent = content
        .replace(/very/g, "significantly")
        .replace(/good/g, "excellent")
        .replace(/bad/g, "problematic")
        .replace(/big/g, "substantial");
      break;
      
    case "fix grammar and spelling":
      // Simulate fixing grammar
      enhancedContent = content
        .replace(/i /g, "I ")
        .replace(/dont/g, "don't")
        .replace(/cant/g, "can't")
        .replace(/wont/g, "won't");
      break;
      
    case "make more concise":
      // Simulate making content more concise
      enhancedContent = content
        .replace(/in order to/g, "to")
        .replace(/due to the fact that/g, "because")
        .replace(/at this point in time/g, "now")
        .replace(/in the event that/g, "if");
      break;
      
    case "expand with more details":
      // Simulate adding more detail
      if (content.includes("function")) {
        enhancedContent = content + "\n\n**Additional implementation details:**\n\nThe functions above demonstrate several key programming principles including input validation, proper documentation with docstrings, and appropriate error handling. The mathematical implementations use the standard library for precision and follow best practices for numerical computation.";
      } else {
        enhancedContent = content + "\n\n**Further analysis:**\n\nThis topic connects to several broader themes in the field, including methodology considerations, theoretical frameworks, and practical applications. Further exploration could examine cross-cultural perspectives and interdisciplinary connections.";
      }
      break;
      
    default:
      // If instruction not recognized, return original content
      enhancedContent = content;
  }
  
  return enhancedContent;
}
