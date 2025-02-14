import { z } from 'zod';

import { type Lang, langSchema } from './Lang';

// We use snake_case for all properties on conversationDetailSchema.
// This ensures a more user friendly syntax for Smoc Expressions
export const conversationDetailSchema = z.object({
	user_id: z.string(),
	visit_id: z.string(),
	conversation_id: z.string(),
	inviter_user_id: z.string().optional(),
	// The UI language used in the conversation
	lang: langSchema,
	// The preferred language of the user's browser
	accept_language: z.string().optional(),
	operator_key: z.string(),
	operator_channel_key: z.string(),
	conversation_template_key: z.string(),

	// From HTTP headers
	ip: z.string(),
	user_agent: z.string(),
	referrer: z.string().nullable(),
	referring_domain: z.string().nullable(),
	conversation_url: z.string(),
	browser: z.string().optional().nullable(),
	os: z.string().optional().nullable(),
	os_version: z.string().nullable(),
	device_type: z.string().optional().nullable(),
	country_code: z.string().nullable(),
	country_name: z.string().nullable(),
	latitude: z.number().nullable(),
	longitude: z.number().nullable(),
	region: z.string().nullable(),
	city: z.string().nullable(),
	utm_source: z.string().nullable(),
	utm_medium: z.string().nullable(),
	utm_term: z.string().nullable(),
	utm_content: z.string().nullable(),
	utm_campaign: z.string().nullable(),
});

export type ConversationDetail = z.infer<typeof conversationDetailSchema>;