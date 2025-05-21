# Job Search Assistant

A Next.js application that helps users search and get information about job positions across different jurisdictions.

## Prerequisites

-   Node.js 18.x or later
-   npm or yarn
-   OpenAI API key

## Setup

1. Clone the repository:

```bash
git clone https://github.com/abijithm9/eng-take-home.git
cd holly-eng-take-home
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```bash
OPENAI_API_KEY=your_api_key_here
```

## Running the Application

1. Start the development server:

```bash
npm run dev
# or
yarn dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Features

-   Search for jobs across multiple jurisdictions
-   Get detailed information about job positions including:
    -   Salary information
    -   Job requirements
    -   Duties and responsibilities
    -   Education and experience requirements
    -   Physical requirements
    -   Licenses and certifications
-   Support for multiple jurisdictions including:
    -   San Diego County
    -   San Bernardino
    -   Ventura
    -   Kern County

## Project Structure

-   `/app` - Next.js application code
    -   `/api` - API routes
    -   `/lib` - Utility functions and shared code
-   `/data` - Job descriptions and salary data
-   `/public` - Static assets
-   `/types` - TypeScript type definitions

## Technologies Used

-   Next.js 14
-   TypeScript
-   OpenAI GPT-3.5

## Technical Writeup

### Approach

The application implements an efficient two-step process for handling user queries about job information:

1. **Data Processing Layer**

    - Combined job descriptions and salary data into a single, optimized data structure (`jobData.ts`)
    - Created utility functions for efficient job lookup by code, jurisdiction, and title
    - Implemented type safety throughout the application using TypeScript

2. **Query Processing Pipeline**
    - **Pre-filtering**: Uses keyword extraction to filter relevant jobs before LLM processing
    - **Job Matching**: First LLM call identifies the specific job and query types
    - **Response Generation**: Second LLM call generates natural responses using only relevant job sections

### Implementation Details

#### Data Processing

```typescript
// Efficient data structure combining job descriptions and salaries
const jobData = jobDescriptions.reduce((acc, job) => {
	const jobCode = job.code.toLowerCase()
	const salary = salaryMap.get(jobCode)
	acc[jobCode] = {
		title: job.title,
		jurisdiction: job.jurisdiction,
		description: job.description,
		salary: salary || null,
	}
	return acc
}, {})
```

#### Query Processing

1. **Pre-filtering**:

    - Extracts keywords from user message
    - Filters jobs based on title and jurisdiction matches
    - Creates a lightweight job index for LLM processing

2. **Job Matching**:

    - First LLM call receives only essential job data (code, title, jurisdiction)
    - Returns structured JSON with job code and query types
    - Handles multiple positions with same title across jurisdictions

3. **Response Generation**:
    - Maps query types to relevant job sections
    - Extracts only necessary information for each query type
    - Generates natural, focused responses

### Technologies Used

-   **Next.js 14**: Server-side rendering and API routes
-   **TypeScript**: Type safety and better developer experience
-   **OpenAI GPT-3.5**: Natural language processing and response generation
-   **Material-UI**: Clean, responsive user interface

### Challenges and Solutions

1. **Efficient Data Processing**

    - Challenge: Processing large JSON files efficiently
    - Solution: Combined data into optimized structure with O(1) lookups

2. **LLM Token Optimization**

    - Challenge: Minimizing data sent to LLM while maintaining accuracy
    - Solution: Two-step process with pre-filtering and section extraction

3. **Multiple Jurisdiction Handling**

    - Challenge: Disambiguating jobs with same title across jurisdictions
    - Solution: Enhanced job matching logic with jurisdiction awareness

4. **Type Safety**

    - Challenge: Maintaining type safety across data transformations
    - Solution: Comprehensive TypeScript interfaces and type guards

5. **Decision to go with Open AI API**
    - Challenge: Initially wanted to try using Ollama Mistral as local LLM, but due to laptop limitations, app ran extremely slow unless I downgraded the model
    - Solution: Stuck with Open AI API to offload LLM calls to server with fast responses

### Future Improvements

1. Add caching layer for frequently accessed job data
2. Add support for more complex queries (e.g., salary comparisons)
3. Enhance error handling and user feedback
4. Add unit tests for core functionality
