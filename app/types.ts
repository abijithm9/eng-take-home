export interface Job {
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
	title?: string
	jurisdiction?: string
	description?: string
}

export interface JobDescription {
	jurisdiction: string
	code: string
	title: string
	description: string
}

export interface Salary {
	Jurisdiction: string
	'Job Code': string
	'Salary grade 1': string
	'Salary grade 2': string
	'Salary grade 3': string
	'Salary grade 4': string
	'Salary grade 5': string
	'Salary grade 6': string
	'Salary grade 7': string
	'Salary grade 8': string
	'Salary grade 9': string
	'Salary grade 10': string
	'Salary grade 11': string
	'Salary grade 12': string
	'Salary grade 13': string
	'Salary grade 14': string
}

export type QueryDetails = {
	jurisdiction?: string
	originalJurisdiction?: string
	title?: string
	code?: string
	job?: Job
	jobId?: string
	jobMatch?: {
		confidence: string
		reasoning: string
	}
	queryType: string[]
}

export type SectionData = {
	section: string
	data: any
}
