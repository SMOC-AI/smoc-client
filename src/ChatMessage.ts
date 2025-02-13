import { z } from 'zod';

import { langSchema, langStringSchema } from './Lang';
import type { nodeMessageSchema } from './NodeMessage';
import { advertisementDetailsSchema } from './AdvertisementDetails';

const langUrlSchema = z.record(langSchema, z.string().url());

const baseElement = {
	expression: z.string().optional(),
};

const decisionSchema = z
	.object({
		...baseElement,
		type: z.literal('decision'),
		options: z.object({}).readonly(),
	})
	.readonly();
export type Decision = z.infer<typeof decisionSchema>;

const multiArmedBanditSchema = z
	.object({
		...baseElement,
		type: z.literal('multi-armed-bandit'),
		options: z
			.object({
				// TODO: Remove this
				armCount: z.number(),
			})
			.readonly(),
	})
	.readonly();
export type MultiArmedBandit = z.infer<typeof multiArmedBanditSchema>;

const imageOptionsSchema = z
	.object({
		url: langUrlSchema,
		alt: langStringSchema,
		size: z.enum(['small', 'medium', 'large']),
	})
	.readonly();

const imageSchema = z
	.object({
		...baseElement,
		type: z.literal('image'),
		options: imageOptionsSchema,
	})
	.readonly();
export type Image = z.infer<typeof imageSchema>;

const proseSchema = z
	.object({
		...baseElement,
		type: z.literal('prose'),
		options: z
			.object({
				text: langStringSchema,
				editable: z.boolean().optional(),
			})
			.readonly(),
	})
	.readonly();
export type Prose = z.infer<typeof proseSchema>;

const poweredBySchema = z
	.object({
		...baseElement,
		type: z.literal('powered-by'),
		options: z.object({}).readonly(),
	})
	.readonly();
export type PoweredBy = z.infer<typeof proseSchema>;

const controlSchema = z.object({
	...baseElement,
	options: z
		.object({
			text: langStringSchema,
			disabled: z.boolean().optional(),
			surveyAnswerId: z.string().optional(),
			approvalAnswerId: z.string().optional(),
			editable: z.boolean().optional(),
			bold: z.boolean().optional(),
			surveyQuestionTitle: z.string().optional(),
			chosenAnswerTitle: z.string().optional(),
		})
		.readonly(),
});
export type Control = z.infer<typeof controlSchema>;

const buttonSchema = controlSchema
	.extend({
		type: z.literal('button'),
	})
	.readonly();
export type Button = z.infer<typeof buttonSchema>;

const radioSchema = controlSchema
	.extend({
		type: z.literal('radio'),
	})
	.readonly();
export type Radio = z.infer<typeof radioSchema>;

const linkSchema = z
	.object({
		...baseElement,
		type: z.literal('link'),
		options: z.object({
			text: langStringSchema,
			href: langUrlSchema,
			editable: z.boolean().optional(),
		}),
	})
	.readonly();
export type Link = z.infer<typeof linkSchema>;

const openGraphSchema = z
	.object({
		...baseElement,
		type: z.literal('open-graph'),
		options: z
			.object({
				style: z.enum(['small', 'large']),
				title: z.string(),
				type: z.enum([
					'website',
					'article',
					'video',
					'audio',
					'music',
					'book',
					'profile',
					'restaurant',
					'product',
					'place',
					'game',
				]),
				url: z.string().url(),
				description: z.string().optional(),
				siteName: z.string().optional(),
				// locale: z.string().optional(),
				// alternateLocale: z.array(z.string()).optional(),
				images: z.array(imageOptionsSchema).optional(),
				videos: z
					.array(
						z
							.object({
								url: z.string().url(),
								// secureUrl: z.string().url().optional(),
								type: z.string().optional(),
								width: z.number().optional(),
								height: z.number().optional(),
							})
							.readonly(),
					)
					.optional(),
				audios: z
					.array(
						z
							.object({
								url: z.string().url(),
								// secureUrl: z.string().url().optional(),
								type: z.string().optional(),
							})
							.readonly(),
					)
					.optional(),
			})
			.readonly(),
	})
	.readonly();
export type OpenGraph = z.infer<typeof openGraphSchema>;

const inputTypeSchema = z.enum(['text', 'email', 'tel', 'checkbox']);
const FreeTextInputTypeSchema = z.enum(['input', 'text-area']);
export type InputType = z.infer<typeof inputTypeSchema>;
const inputSchema = z
	.object({
		...baseElement,
		type: z.literal('input'),
		options: z
			.object({
				value: z.string(),
				type: inputTypeSchema,
				label: langStringSchema,
				name: z.string(),
				required: z.boolean().optional(),
				disabled: z.boolean().optional(),
				placeholder: z.boolean().optional(),
			})
			.readonly(),
	})
	.readonly();
export type Input = z.infer<typeof inputSchema>;

const checkboxSchema = z
	.object({
		...baseElement,
		type: z.literal('checkbox'),
		options: z
			.object({
				type: inputTypeSchema,
				label: langStringSchema,
				title: langStringSchema,
				name: z.string(),
				required: z.boolean().optional(),
				disabled: z.boolean().optional(),
				placeholder: langStringSchema.optional(),
				href: z.string(),
				checked: z.boolean().optional(),
			})
			.readonly(),
	})
	.readonly();
export type Checkbox = z.infer<typeof checkboxSchema>;

const freeTextInputSchema = z
	.object({
		...baseElement,
		type: z.literal('free-text'),
		options: z
			.object({
				value: z.string(),
				type: FreeTextInputTypeSchema,
				label: langStringSchema,
				name: z.string(),
				placeholder: z.boolean().optional(),
				required: z.boolean().optional(),
				disabled: z.boolean().optional(),
			})
			.readonly(),
	})
	.readonly();
export type FreeTextInput = z.infer<typeof freeTextInputSchema>;

const customHtmlSchema = z
	.object({
		...baseElement,
		type: z.literal('custom-html'),
		options: z
			.object({
				html: z.string(),
			})
			.readonly(),
	})
	.readonly();
export type CustomHtml = z.infer<typeof customHtmlSchema>;

const partySchema = z
	.object({
		...baseElement,
		type: z.literal('party'),
		options: z.object({}),
	})
	.readonly();
export type Party = z.infer<typeof partySchema>;

const thankYouSchema = z
	.object({
		...baseElement,
		type: z.literal('thank-you'),
		options: z.object({}),
	})
	.readonly();
export type ThankYou = z.infer<typeof thankYouSchema>;

const messageElementSchema = z
	.union([
		decisionSchema,
		proseSchema,
		buttonSchema,
		linkSchema,
		openGraphSchema,
		radioSchema,
		inputSchema,
		checkboxSchema,
		freeTextInputSchema,
		imageSchema,
		customHtmlSchema,
		partySchema,
		poweredBySchema,
		thankYouSchema,
		multiArmedBanditSchema,
	])
	.readonly();
export type MessageElement = z.infer<typeof messageElementSchema>;

export const interlocutorSchema = z.enum(['bot', 'visitor']);
export type Interlocutor = z.infer<typeof interlocutorSchema>;

export const messageSectionSchema = z.enum(['intro', 'main', 'reward', 'exit']);
export type MessageSection = z.infer<typeof messageSectionSchema>;

export const couponSchema = z
	.object({
		redeemed: z.boolean(),
		type: z.enum(['link', 'campaign']).optional(),
	})
	.readonly();

export type Coupon = z.infer<typeof couponSchema>;

export const messageMetadataSchema = z
	.object({
		advertisementDetails: advertisementDetailsSchema.optional(),
		surveyQuestionId: z.string().optional(),
		coupon: couponSchema.optional(),
	})
	.readonly();
export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

export const botMessageSchema = z
	.object({
		interlocutor: z.literal('bot'),
		messageId: z.string(),
		metadata: messageMetadataSchema.optional(),
		elements: z.array(messageElementSchema),
	})
	.readonly();
export type BotMessage = z.infer<typeof botMessageSchema>;

export const visitorMessageSchema = z
	.object({
		interlocutor: z.literal('visitor'),
		metadata: messageMetadataSchema.optional(),
		elements: z.array(proseSchema),
	})
	.readonly();
export type VisitorMessage = z.infer<typeof visitorMessageSchema>;

export const chatMessageSchema = z.union([
	botMessageSchema,
	visitorMessageSchema,
]);
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type NodeMessage = z.infer<typeof nodeMessageSchema>;
