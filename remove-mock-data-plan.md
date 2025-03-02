# Plan to Remove Mock Data

## Current Situation
The server-side Canvas API implementation currently includes mock data that is returned when Canvas credentials (URL and token) are not available. This affects multiple endpoints:
- Courses list
- Course assignments
- Assignment details
- Assignment submission
- External link analysis

## Proposed Changes

### 1. Update Error Handling
Instead of providing mock data when credentials are missing, we should:
- Return clear error responses indicating authentication/configuration is required
- Maintain consistent error handling across all endpoints
- Ensure the UI can handle these error states appropriately

### 2. Modifications Required

#### In server/canvas-api.ts:

1. `getCourses()` function:
   - Remove mock data block (lines 151-191)
   - Keep existing error handling for missing credentials

2. `getCourseAssignments()` function:
   - Remove mock data block (lines 219-284)
   - Update error handling to match other endpoints

3. `getAssignmentDetails()` function:
   - Remove mock data usage (lines 370-379)
   - Implement consistent error handling

4. `submitAssignment()` function:
   - Remove mock success response (lines 425-431)
   - Return appropriate error when credentials missing

5. `analyzeExternalLink()` function:
   - Remove mock content generation (lines 469-483)
   - Implement proper error handling

### 3. Testing Considerations
- Ensure error messages are clear and actionable
- Verify client-side handling of error responses
- Test behavior when Canvas credentials are:
  - Missing
  - Invalid
  - Valid

### 4. Impact
This change will:
- Remove potentially misleading test data
- Provide clearer feedback about configuration requirements
- Force proper Canvas integration setup in development