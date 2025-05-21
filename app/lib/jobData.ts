import jobDescriptions from '../../data/job-descriptions.json'
import salaries from '../../data/salaries.json'

const salaryMap = new Map(
	salaries.map((salary) => [
		salary['Job Code'].toLowerCase(),
		{
			salaryGrade1: salary['Salary grade 1'].trim(),
			salaryGrade2: salary['Salary grade 2'].trim(),
			salaryGrade3: salary['Salary grade 3']?.trim() || '',
			salaryGrade4: salary['Salary grade 4']?.trim() || '',
			salaryGrade5: salary['Salary grade 5']?.trim() || '',
			salaryGrade6: salary['Salary grade 6']?.trim() || '',
			salaryGrade7: salary['Salary grade 7']?.trim() || '',
			salaryGrade8: salary['Salary grade 8']?.trim() || '',
			salaryGrade9: salary['Salary grade 9']?.trim() || '',
			salaryGrade10: salary['Salary grade 10']?.trim() || '',
			salaryGrade11: salary['Salary grade 11']?.trim() || '',
			salaryGrade12: salary['Salary grade 12']?.trim() || '',
			salaryGrade13: salary['Salary grade 13']?.trim() || '',
			salaryGrade14: salary['Salary grade 14']?.trim() || '',
		},
	])
)

export const jobData = jobDescriptions.reduce(
	(acc, job) => {
		const jobCode = job.code.toLowerCase()
		const salary = salaryMap.get(jobCode)

		acc[jobCode] = {
			title: job.title,
			jurisdiction: job.jurisdiction,
			description: job.description,
			salary: salary || null,
		}

		return acc
	},
	{} as Record<
		string,
		{
			title: string
			jurisdiction: string
			description: string
			salary: {
				salaryGrade1: string
				salaryGrade2: string
				salaryGrade3: string
				salaryGrade4: string
				salaryGrade5: string
				salaryGrade6: string
				salaryGrade7: string
				salaryGrade8: string
				salaryGrade9: string
				salaryGrade10: string
				salaryGrade11: string
				salaryGrade12: string
				salaryGrade13: string
				salaryGrade14: string
			} | null
		}
	>
)

export type JobData = typeof jobData

export function getJobByCode(code: string) {
	return jobData[code.toLowerCase()]
}

export function getAllJobs() {
	return Object.values(jobData)
}

export function getJobsByJurisdiction(jurisdiction: string) {
	return getAllJobs().filter(
		(job) => job.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
	)
}

export function searchJobsByTitle(title: string) {
	const searchTerm = title.toLowerCase()
	return getAllJobs().filter((job) =>
		job.title.toLowerCase().includes(searchTerm)
	)
}
