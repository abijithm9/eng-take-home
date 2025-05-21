import OpenAI from 'openai'
import { QueryDetails, SectionData } from '@/types'

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
})

const JURISDICTION_DISPLAY_NAMES: Record<string, string> = {
	sdcounty: 'San Diego County',
	sanbernardino: 'San Bernardino',
	ventura: 'Ventura',
	kerncounty: 'Kern County',
}

function extractSection(description: string, sectionName: string): string {
	const regex = new RegExp(`${sectionName}[\\s\\S]*?(?=\\n\\n|$)`, 'i')
	const match = description.match(regex)
	if (!match) return ''

	return match[0]
		.split('\n')
		.filter(
			(line) => line.trim() && !line.toUpperCase().includes(sectionName)
		)
		.map((line) => line.replace(/^[•\-\*]\s*/, '').trim())
		.join('\n')
}

export async function getJobResponse(details: QueryDetails): Promise<string> {
	const { job, queryType } = details

	if (!job) {
		return "Sorry, I couldn't find a job matching your request."
	}

	const displayJurisdiction = job.jurisdiction
		? JURISDICTION_DISPLAY_NAMES[job.jurisdiction] || job.jurisdiction
		: 'Unknown Jurisdiction'

	const relevantSections = queryType
		.map((type): SectionData | null => {
			switch (type) {
				case 'salary':
					return {
						section: 'salary',
						data: {
							jurisdiction: displayJurisdiction,
							grades: job.salary
								? Object.entries(job.salary)
										.filter(
											([_, value]) =>
												value && value.trim() !== ''
										)
										.map(([grade, value]) => ({
											grade: grade.replace(
												'salaryGrade',
												'Grade '
											),
											value: value.trim(),
										}))
								: [],
						},
					}
				case 'knowledge':
					return {
						section: 'knowledge',
						data: job.description
							? extractSection(job.description, 'KNOWLEDGE')
							: '',
					}
				case 'skills':
					return {
						section: 'skills',
						data: job.description
							? extractSection(job.description, 'SKILLS')
							: '',
					}
				case 'abilities':
					return {
						section: 'abilities',
						data: job.description
							? extractSection(job.description, 'ABILITIES')
							: '',
					}
				case 'duties':
					return {
						section: 'duties',
						data: job.description
							? extractSection(
									job.description,
									'EXAMPLES OF DUTIES'
							  )
							: '',
					}
				case 'requirements':
					return {
						section: 'requirements',
						data: job.description
							? extractSection(
									job.description,
									'EDUCATION AND/OR EXPERIENCE'
							  )
							: '',
					}
				case 'education':
					return {
						section: 'education',
						data: job.description
							? extractSection(job.description, 'EDUCATION')
							: '',
					}
				case 'experience':
					return {
						section: 'experience',
						data: job.description
							? extractSection(job.description, 'EXPERIENCE')
							: '',
					}
				case 'licenses':
					return {
						section: 'licenses',
						data: job.description
							? extractSection(
									job.description,
									'LICENSES|CERTIFICATIONS|REGISTRATIONS'
							  )
							: '',
					}
				case 'physical':
					return {
						section: 'physical',
						data: job.description
							? extractSection(
									job.description,
									'PHYSICAL|WORKING CONDITIONS'
							  )
							: '',
					}
				case 'description':
					return {
						section: 'description',
						data: job.description
							? extractSection(job.description, 'DEFINITION')
							: '',
					}
				default:
					return null
			}
		})
		.filter((section): section is SectionData => section !== null)

	const jobDataPrompt = {
		title: job.title,
		jurisdiction: displayJurisdiction,
		...Object.fromEntries(relevantSections.map((s) => [s.section, s.data])),
	}

	const completion = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo',
		messages: [
			{
				role: 'system',
				content: `You are a helpful HR assistant that provides detailed information about job positions. Your task is to:
1. Analyze the job data provided
2. Focus on the specific query types requested by the user
3. Generate a natural, conversational response that directly answers their question
4. Only provide information that comes from the job data provided.

For salary information:
- Always specify the jurisdiction (e.g., "in San Bernardino" or "in Ventura")
- Display all available salary grades
- Format salary values exactly as provided in the data
- Do not make assumptions about missing salary grades
- Do not convert or modify the salary values
- If multiple positions exist with the same title in different jurisdictions, clearly distinguish between them

Be specific and detailed in your response. If multiple query types are requested, address each one clearly. If you're unsure about any information, say so rather than making assumptions.

Format your response in a clear, readable way. Use bullet points or numbered lists when appropriate.

The query types you need to address are: ${queryType.join(', ')}`,
			},
			{
				role: 'user',
				content: `Job Data:\n${JSON.stringify(jobDataPrompt, null, 2)}`,
			},
		],
	})

	const content = completion.choices[0].message.content
	if (!content) {
		return `I found the ${job.title} position in ${displayJurisdiction}, but I couldn't generate a response. Please try rephrasing your question.`
	}

	return content
}
