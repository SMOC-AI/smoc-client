import { z } from 'zod';
import { leadFormSchema } from './LeadForm';
import { nodeMessageSchema } from './NodeMessage';

const performActionCommandSchema = z.object({
	type: z.literal('action'),
	nodePath: z.array(z.string()).readonly(),
});

const submitLeadFormCommandSchema = z.object({
	type: z.literal('submit-lead-form'),
	form: leadFormSchema,
});

const answerSurveyQuestionCommandSchema = z.object({
	type: z.literal('answer-survey-question'),
	surveyAnswerId: z.string(),
	surveyQuestionId: z.string(),
	nodeMessage: nodeMessageSchema,
});

const answerApprovalQuestionCommandSchema = z.object({
	type: z.literal('answer-approval-question'),
	approvalAnswerId: z.string(),
	nodeMessage: nodeMessageSchema,
});

export const commandSchema = z.union([
	answerApprovalQuestionCommandSchema,
	answerSurveyQuestionCommandSchema,
	submitLeadFormCommandSchema,
	performActionCommandSchema,
]);
export type Command = z.infer<typeof commandSchema>;
