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
  return `# Python Mathematical Functions Assignment

## Introduction
This program implements three mathematical functions as required: calculating the area of a circle, calculating compound interest, and calculating the distance between two points.

## Implementation Summary

The implementation includes three main functions:

1. **calculate_circle_area(radius)**: Calculates the area of a circle using πr²
2. **calculate_compound_interest(principal, rate, time, compounds_per_year)**: Calculates compound interest using A = P(1 + r/n)^(nt)
3. **calculate_distance(point1, point2)**: Calculates Euclidean distance between points using √[(x₂-x₁)² + (y₂-y₁)²]

Each function includes proper error handling, parameter validation, and comprehensive documentation.

## Test Results

Test results show correct calculations for various inputs:
- Circle area calculations are accurate for different radii
- Compound interest calculations match expected values for different time periods and compounding frequencies
- Distance calculations correctly measure the space between given coordinate points

## Conclusion

The implementation successfully meets all the requirements specified in the assignment. The code is well-documented, properly validated, and thoroughly tested to ensure reliability across various use cases.
`;
}

// Helper function to generate writing assignment draft
function generateWritingAssignmentDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  return `# The Evolution of Machine Learning: Past, Present, and Future

## Introduction

Machine Learning (ML) has evolved from a theoretical concept to a transformative technology that influences virtually every aspect of modern life. This essay examines the historical development of machine learning, its current applications, and its potential future trajectory. By tracing this evolution, we can better understand both the remarkable progress that has been made and the significant challenges that lie ahead.

## The Origins of Machine Learning

The conceptual foundations of machine learning date back to the mid-20th century, when pioneers like Alan Turing and Arthur Samuel began exploring the possibility of machines that could learn from experience. Samuel, an IBM researcher, coined the term "machine learning" in 1959 while developing a program that could play checkers and improve through experience. These early efforts, while primitive by today's standards, established the fundamental principle that computers could be programmed to learn without being explicitly programmed for every task.

The field progressed through several key paradigm shifts:

1. **Rule-based systems (1950s-1970s)**: Early AI relied on hard-coded rules and logic.
2. **Statistical approaches (1980s-1990s)**: Researchers began incorporating probability and statistics.
3. **Neural network renaissance (2000s-present)**: Deep learning revolutionized the field with unprecedented capabilities.

## Current Applications and Capabilities

Today, machine learning has permeated countless domains:

### Healthcare
Machine learning algorithms can detect diseases from medical images with accuracy rivaling human specialists. Systems can predict patient outcomes, optimize treatment plans, and even discover new medications through complex pattern analysis of molecular data.

### Transportation
Self-driving vehicles represent one of the most visible applications of machine learning. Computer vision systems interpret complex road environments while predictive algorithms navigate changing conditions in real-time.

### Communication
Natural language processing has enabled sophisticated translation services, voice assistants, and content recommendation systems that personalize information delivery based on user behavior patterns.

### Business Operations
From predictive maintenance in manufacturing to fraud detection in finance, machine learning has transformed operational efficiency across industries.

## Challenges and Ethical Considerations

Despite its remarkable capabilities, machine learning faces significant challenges:

1. **Bias and fairness**: ML systems can perpetuate or amplify societal biases present in training data.
2. **Transparency**: The "black box" nature of complex algorithms makes accountability difficult.
3. **Privacy concerns**: Data collection necessary for ML raises serious questions about personal privacy.
4. **Environmental impact**: Training large models requires substantial computing resources and energy.

## The Future Landscape

Looking ahead, several promising directions are emerging:

### Multimodal Learning
Future systems will seamlessly integrate multiple types of data—text, images, audio, and sensor readings—to develop more comprehensive understanding.

### Federated Learning
Privacy-preserving techniques will enable learning across distributed datasets without centralizing sensitive information.

### Neuromorphic Computing
Hardware designed to mimic neural structures may dramatically improve efficiency and enable new capabilities.

### Human-AI Collaboration
Rather than replacement, the most productive future may lie in complementary systems where humans and AI each contribute their unique strengths.

## Conclusion

The evolution of machine learning represents one of humanity's most significant technological achievements. From theoretical beginnings to ubiquitous application, ML has transformed how we approach complex problems. As we navigate future developments, thoughtful consideration of ethical implications and intentional design choices will be essential to ensure these powerful tools benefit humanity broadly. The next chapter in machine learning will not be written by algorithms alone, but through the careful guidance of human values and priorities.`;
}

// Helper function to generate research assignment draft
function generateResearchAssignmentDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  return `# Climate Change Adaptation Strategies: A Comparative Analysis

## Abstract

This research paper examines climate change adaptation strategies across different geographical and economic contexts. Through analysis of case studies from coastal cities, agricultural regions, and urban centers, the study identifies key factors that influence adaptation effectiveness. Findings indicate that successful adaptation requires integration of traditional knowledge with scientific data, robust community participation, and flexible governance structures. The research concludes with recommendations for policymakers seeking to enhance climate resilience in diverse settings.

## 1. Introduction

Climate change presents one of the most significant challenges of the 21st century, with impacts already manifesting through increased temperature extremes, changing precipitation patterns, and more frequent severe weather events. While mitigation efforts to reduce greenhouse gas emissions remain critical, adaptation strategies have become equally important as communities worldwide confront unavoidable climate impacts.

This research addresses three key questions:
1. How do adaptation strategies differ across geographical and economic contexts?
2. What factors determine the effectiveness of climate adaptation initiatives?
3. What best practices can be identified for future adaptation planning?

## 2. Methodology

This study employed a mixed-methods approach combining:

- **Literature review**: Analysis of 45 peer-reviewed studies on climate adaptation published between 2010-2023
- **Case study analysis**: Detailed examination of adaptation initiatives in 6 regions representing diverse contexts
- **Expert interviews**: Structured discussions with 12 climate policy specialists and implementation practitioners
- **Quantitative assessment**: Evaluation of adaptation outcomes using standardized resilience metrics

Data was coded and analyzed using thematic analysis to identify recurring patterns and critical success factors.

## 3. Theoretical Framework

This research is grounded in resilience theory, which conceptualizes adaptation as a function of exposure, sensitivity, and adaptive capacity. The framework recognizes that adaptation exists within complex socio-ecological systems where both environmental and human factors interact dynamically.

The analysis draws on three theoretical perspectives:
- Institutional adaptation theory
- Socio-technical transitions literature
- Community-based adaptation frameworks

## 4. Case Studies

### 4.1 Coastal Adaptation: Rotterdam, Netherlands vs. Semarang, Indonesia

The Netherlands' comprehensive "Room for the River" program represents a wealth-enabled transformation from traditional flood control to accommodation strategies. By contrast, Semarang's adaptation efforts rely more heavily on community-based approaches and incremental improvements due to resource constraints.

### 4.2 Agricultural Adaptation: California, USA vs. Maharashtra, India

California's technological approach emphasizes precision irrigation and climate-resistant crop varieties, while Maharashtra demonstrates the integration of traditional knowledge with modern forecasting to manage monsoon variability.

### 4.3 Urban Heat Management: Phoenix, USA vs. Medellin, Colombia

These case studies reveal contrasting approaches to similar challenges, with Phoenix investing heavily in energy-intensive cooling infrastructure while Medellin prioritizes green infrastructure and passive cooling strategies.

## 5. Key Findings

Analysis across case studies revealed several critical factors influencing adaptation success:

1. **Governance integration**: Adaptation efforts showing highest success rates incorporated climate planning across all levels of governance.

2. **Knowledge diversity**: Programs that combined scientific data with local and indigenous knowledge demonstrated greater sustainability.

3. **Resource accessibility**: Financial resources correlated with adaptation scope but not necessarily with effectiveness or community acceptance.

4. **Adaptive management**: Flexible approaches allowing for learning and adjustment outperformed rigid implementation plans.

5. **Co-benefits focus**: Strategies delivering multiple benefits beyond climate adaptation showed higher implementation rates and community support.

## 6. Discussion

The findings suggest that effective adaptation strategies must be contextually appropriate rather than universally applied. High-income regions often emphasize technological and infrastructure solutions, while lower-resource settings typically prioritize social adaptations and institutional flexibility.

A key insight from this research is that adaptation success depends less on absolute resource availability than on:
- Appropriateness to local conditions
- Community ownership and participation
- Integration with existing development priorities
- Governance flexibility and learning capacity

## 7. Recommendations for Policy and Practice

Based on the comparative analysis, this research recommends:

1. **Context-sensitive planning**: Tailor adaptation approaches to local environmental, economic, and social conditions.

2. **Multi-stakeholder processes**: Ensure diverse participation in adaptation planning to enhance legitimacy and effectiveness.

3. **Flexible financing mechanisms**: Develop funding structures that can respond to emerging needs and changing conditions.

4. **Knowledge co-production**: Create platforms for exchange between scientific experts and local knowledge holders.

5. **Monitoring and learning systems**: Implement robust evaluation frameworks that facilitate adaptive management.

## 8. Conclusion

This research demonstrates that while climate adaptation challenges vary significantly across contexts, certain principles can guide effective planning universally. Successful adaptation requires not just technical solutions but appropriate governance structures, community engagement, and learning systems. As climate impacts intensify, these insights become increasingly vital for creating resilient communities worldwide.

## References

[This section would contain 20-30 academic references following appropriate citation format]`;
}

// Helper function to generate presentation draft
function generatePresentationDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  return `# Renewable Energy Transitions: Challenges and Opportunities
## Presentation Outline

### Slide 1: Title Slide
**Renewable Energy Transitions: Challenges and Opportunities**
- Presenter Name
- Date
- Course Information

### Slide 2: Presentation Overview
**Today's Agenda:**
- Current global energy landscape
- Key renewable technologies and their growth
- Challenges to widespread adoption
- Case studies of successful transitions
- Policy recommendations and future outlook
- Discussion questions

### Slide 3: Global Energy Landscape
**Where We Stand Today:**
- Global energy consumption continues to rise (~1.3% annually)
- Fossil fuels still dominate (~80% of global energy mix)
- Renewables growing fastest (~7.6% annual growth for non-hydro renewables)
- Regional disparities in energy transition progress
- Climate targets require accelerated transition

*[Speaker notes: Begin with the big picture to establish context. Include a visual graph showing energy mix trends over time.]*

### Slide 4: Key Renewable Technologies
**Leading the Transition:**
- Solar PV: 23.7% capacity growth in 2022, costs down 89% since 2010
- Wind: 9.6% capacity growth, both onshore and offshore expansion
- Battery storage: Critical enabler, costs fallen 97% since 1991
- Green hydrogen: Emerging solution for hard-to-electrify sectors
- Geothermal and advanced biofuels: Stable baseload alternatives

*[Speaker notes: Highlight how cost curves have dramatically changed the competitive landscape. Include LCOE comparisons.]*

### Slide 5: Adoption Challenges - Technical
**Technical Barriers:**
- Intermittency and grid integration issues
- Storage limitations at grid scale
- Transmission infrastructure deficits
- Material constraints for manufacturing
- Technological readiness varies by sector

*[Speaker notes: Emphasize that these are solvable problems but require coordinated investment and planning.]*

### Slide 6: Adoption Challenges - Economic & Social
**Beyond Technology:**
- Stranded asset risks in fossil fuel infrastructure
- Job transitions in energy-dependent communities
- Upfront capital requirements despite lower lifetime costs
- Split incentives between developers and beneficiaries
- Energy justice and equitable access concerns

*[Speaker notes: This is where many transitions struggle - when technical solutions meet social realities.]*

### Slide 7: Case Study - Denmark
**Success Story: Denmark's Wind Revolution**
- 1970s: Oil crisis sparks early investment in alternatives
- 1980s-90s: Community ownership model drives social acceptance
- 2000s: Offshore wind leadership established
- Today: >50% of electricity from wind power
- Key success factors: Policy stability, public participation, technical innovation

*[Speaker notes: Emphasize the long timeline and multi-faceted approach that created success.]*

### Slide 8: Case Study - Morocco
**Emerging Market Success: Morocco's Solar Transition**
- Noor Ouarzazate Solar Complex: Largest concentrated solar plant in world
- Reduced energy imports by 97% since 2018
- Created 1,600 direct jobs and thousands of indirect jobs
- Innovative financing: public-private partnership with climate funds
- Knowledge transfer priority has built domestic capacity

*[Speaker notes: Demonstrates that emerging economies can lead in renewables with right frameworks.]*

### Slide 9: Policy Frameworks that Work
**Enabling the Transition:**
- Carbon pricing mechanisms
- Renewable portfolio standards
- Feed-in tariffs and auction systems
- Green finance initiatives
- Just transition policies for affected communities
- International cooperation frameworks

*[Speaker notes: Different tools work in different contexts - no single policy solution.]*

### Slide 10: Future Outlook
**Where We're Headed:**
- Sector coupling will accelerate (electricity, heating, transport)
- Digitalization enabling smart demand management
- Decentralized generation becoming mainstream
- Circular economy for renewable hardware
- Increasing focus on embodied carbon in manufacturing

*[Speaker notes: Paint the picture of an integrated, flexible energy system - not just replacing sources.]*

### Slide 11: Key Takeaways
**Remember These Points:**
- The renewable transition is technically feasible and economically viable
- Integration challenges require systemic thinking beyond individual technologies
- Social and political factors often determine success more than technical factors
- Different regions need customized pathways reflecting local conditions
- Pace of transition must accelerate to meet climate goals

*[Speaker notes: Emphasize actionable insights participants can apply.]*

### Slide 12: Discussion Questions
**Let's Discuss:**
- What renewable strategies make most sense for our region?
- How can we accelerate adoption while ensuring just transitions?
- What roles should public vs. private sectors play?
- How might geopolitics shift in a renewable-dominated world?
- What opportunities exist for cross-sector collaboration?

*[Speaker notes: Prepare additional prompts if discussion is slow to start.]*

### Slide 13: Thank You
**Contact Information:**
- Email address
- References and resources for further reading
- QR code to presentation materials

*[Speaker notes: Invite follow-up questions and connections.]*`;
}

// Helper function to generate general assignment draft
function generateGeneralAssignmentDraft(
  assignmentDetails: string,
  analysisResult: AnalysisResult,
  externalContent?: string
): string {
  return `# Analysis of Economic Impacts of Artificial Intelligence

## 1. Introduction

Artificial Intelligence (AI) represents one of the most transformative technologies of the 21st century, with profound implications for economic structures, labor markets, and productivity across sectors. This analysis examines the multifaceted economic impacts of AI adoption, considering both potential benefits and challenges. By evaluating current trends and projections, this paper aims to provide a balanced assessment of how AI is reshaping economic paradigms globally.

## 2. Productivity and Economic Growth

### 2.1 Automation and Efficiency Gains

AI technologies are demonstrating significant capacity to automate routine tasks and enhance operational efficiency. According to research by McKinsey, AI automation could raise global productivity growth by 0.8 to 1.4 percent annually, potentially adding $13 trillion to global economic output by 2030. These productivity gains derive from several mechanisms:

- **Process optimization**: AI systems can identify inefficiencies in workflows that humans might overlook
- **Resource allocation**: Machine learning algorithms can optimize distribution of resources in complex systems
- **Error reduction**: AI can perform repetitive tasks with consistent precision, reducing costly mistakes
- **24/7 operation**: Unlike human workers, AI systems can function continuously without breaks

In manufacturing, AI-powered predictive maintenance alone is reducing downtime by up to 50% and increasing equipment lifespan by 20-40% in early adopters. Similarly, in logistics, AI route optimization is cutting fuel costs by 15-20% while increasing delivery capacity.

### 2.2 Innovation Acceleration

Beyond efficiency improvements, AI is accelerating innovation across sectors:

- **Drug discovery**: AI is reducing pharmaceutical research timelines from years to months
- **Materials science**: Machine learning is facilitating discovery of novel materials with specific properties
- **Product development**: Generative design tools are creating optimized product designs humans might never conceive

These innovation effects could significantly boost total factor productivity, a key driver of long-term economic growth.

## 3. Labor Market Transformations

### 3.1 Job Displacement and Creation

The impact of AI on employment generates considerable debate. Analysis suggests a nuanced reality:

**Potential Displacement**: Research from Oxford Economics projects that up to 20 million manufacturing jobs could be displaced by robots alone by 2030. Jobs featuring routine cognitive and manual tasks face highest displacement risk.

**Job Creation**: Simultaneously, AI is creating new job categories and increasing demand in others:

- AI system developers and maintainers
- Data scientists and analysts
- Human-AI collaboration specialists
- AI ethics and oversight professionals

Historical technological shifts suggest net job creation over time, though this transition may create significant interim disruption.

### 3.2 Wage and Inequality Effects

AI adoption is demonstrating complex effects on wages and economic inequality:

- **Skill premium**: Workers with AI-complementary skills are seeing wage increases
- **Geographic concentrations**: Benefits are clustering in technology hubs and urban centers
- **Winner-take-most dynamics**: AI enables scaling advantages that concentrate market power

Without appropriate policy interventions, these effects could exacerbate existing economic disparities both within and between nations.

## 4. Sectoral Impacts

AI's economic effects vary significantly by sector:

### 4.1 Healthcare

AI applications in healthcare demonstrate potential economic benefits through:
- Improved diagnostic accuracy reducing treatment costs
- Administrative automation reducing overhead expenses
- Personalized treatment protocols improving outcomes
- Remote monitoring reducing hospitalization needs

These could collectively save hundreds of billions in healthcare costs while improving outcomes.

### 4.2 Transportation

The transportation sector is being revolutionized by AI through:
- Autonomous vehicle development
- Traffic flow optimization
- Supply chain efficiency improvements
- Predictive maintenance reducing vehicle downtime

Full autonomous vehicle adoption alone could generate economic benefits of $800 billion annually in the US through accident reduction, productivity gains, and fuel efficiency.

### 4.3 Financial Services

In financial services, AI is:
- Reducing fraud through enhanced detection algorithms
- Improving lending accuracy through superior risk assessment
- Lowering costs through automated customer service
- Creating new business models through personalized financial products

## 5. Policy Implications

The economic transformation driven by AI necessitates policy responses:

### 5.1 Education and Workforce Development

- Adaptation of educational curricula to develop AI-complementary skills
- Expansion of lifelong learning opportunities for workforce adaptation
- Public-private partnerships for skills transition programs

### 5.2 Social Safety Nets and Transition Support

- Modernized unemployment insurance systems
- Potential exploration of universal basic income or similar mechanisms
- Targeted support for communities facing disproportionate disruption

### 5.3 Regulatory Frameworks

- Competition policy addressing AI-driven market concentration
- Privacy regulations balancing innovation with data protection
- Safety standards for AI applications in critical sectors

## 6. Conclusion

The economic impacts of AI will be profound and multi-dimensional. While productivity and innovation gains offer substantial benefits, challenges around labor market disruption and inequality require thoughtful management. With appropriate policy responses and institutional adaptation, AI can contribute significantly to economic growth while ensuring broadly shared benefits. The key will be aligning technological development with societal needs through inclusive governance and proactive adjustment strategies.

## References

[This section would include 10-15 academic and industry sources]`;
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
