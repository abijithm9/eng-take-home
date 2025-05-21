import { NextResponse } from 'next/server'
import { getJobResponse } from '../../lib/openai'
import { QueryDetails } from '@/types'
import { jobData, getJobByCode } from '@/lib/jobData'
import OpenAI from 'openai'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

function filterRelevantJobs(message: string) {
	const lowerMessage = message.toLowerCase()

	const keywords = lowerMessage.split(/\s+/).filter((word) => word.length > 3)

	const allJobs = Object.entries(jobData)

	const relevantJobs = allJobs.filter(([_, job]) => {
		const title = job.title.toLowerCase()
		const jurisdiction = job.jurisdiction.toLowerCase()

		return keywords.some(
			(keyword) =>
				title.includes(keyword) || jurisdiction.includes(keyword)
		)
	})

	return relevantJobs.length > 0 ? relevantJobs : allJobs
}

async function matchJob(message: string) {
	try {
		const relevantJobs = filterRelevantJobs(message)

		const jobIndex = relevantJobs
			.map(([code, job]) => ({
				jobCode: code,
				title: job.title,
				jurisdiction: job.jurisdiction,
			}))
			.map(
				(job) =>
					`Job Code: ${job.jobCode}\nTitle: ${job.title}\nJurisdiction: ${job.jurisdiction}\n`
			)
			.join('\n')

		const completion = await openai.chat.completions.create({
			model: 'gpt-3.5-turbo',
			messages: [
				{
					role: 'system',
					content: `You are a helpful HR assistant that identifies job positions and query types from user queries. Your task is to:
1. Analyze the user's query to identify which job they're asking about
2. Match it to the correct job code from the provided job data
3. If multiple positions exist with the same title in different jurisdictions:
   - Look for jurisdiction mentions in the user's query (e.g., "in Ventura", "in San Bernardino")
   - If no jurisdiction is specified, prefer the most recently listed position
   - If still uncertain, return the first matching position
4. Determine the type(s) of information they're requesting. A query can request multiple types. The available types are:
   - salary: Information about compensation and salary grades
   - knowledge: Required knowledge areas and expertise
   - skills: Specific technical or professional skills needed
   - abilities: Required capabilities and competencies
   - duties: Job responsibilities and tasks
   - requirements: Required qualifications and prerequisites
   - education: Required education level and field of study
   - experience: Required work experience and duration
   - licenses: Required certifications or licenses
   - physical: Physical requirements and working conditions
   - description: General job overview and purpose
5. Return a JSON object with EXACTLY this structure:
{
    "jobCode": string | null,
    "queryType": string[] // Array of one or more query types from the list above
}

If no job is found, return:
{
    "jobCode": null,
    "queryType": ["unknown"]
}

Only return the JSON object, no other text.`,
				},
				{
					role: 'user',
					content: `Available jobs:\n${jobIndex}`,
				},
				{
					role: 'user',
					content: message,
				},
			],
			response_format: { type: 'json_object' },
		})

		const content = completion.choices[0].message.content
		if (!content) {
			return {
				jobCode: null,
				queryType: ['unknown'],
			}
		}

		try {
			const response = JSON.parse(content)
			if (typeof response !== 'object' || response === null) {
				throw new Error('Invalid response format')
			}
			if (!('jobCode' in response)) {
				throw new Error('Missing jobCode in response')
			}
			if (
				!('queryType' in response) ||
				!Array.isArray(response.queryType)
			) {
				throw new Error('Missing or invalid queryType in response')
			}
			return response
		} catch (parseError) {
			console.error('Error parsing AI response:', parseError)
			return {
				jobCode: null,
				queryType: ['unknown'],
			}
		}
	} catch (error) {
		console.error('Error matching job:', error)
		return {
			jobCode: null,
			queryType: ['unknown'],
		}
	}
}

export async function POST(req: Request) {
	try {
		const { message } = await req.json()

		if (!message) {
			return NextResponse.json(
				{ error: 'Message is required' },
				{ status: 400 }
			)
		}

		const { jobCode, queryType } = await matchJob(message)

		if (!jobCode) {
			return NextResponse.json({
				response:
					"I'm sorry, I couldn't find a job matching your request. Please try rephrasing your question.",
			})
		}

		const job = getJobByCode(jobCode)

		if (!job) {
			return NextResponse.json({
				response:
					"I'm sorry, I couldn't find the details for this job. Please try again.",
			})
		}

		const details: QueryDetails = {
			queryType,
			job,
			jobId: jobCode,
		}

		const response = await getJobResponse(details)
		return NextResponse.json({ response })
	} catch (error) {
		console.error('Error processing chat:', error)
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
