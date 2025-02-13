import { z } from "zod";

const emptyArraySchema = z.array(z.string()).max(0);
const languageAlternativesSchema = z.union([
	z.record(z.string()),
	emptyArraySchema,
]);
export type LanguageAlternatives = z.infer<typeof languageAlternativesSchema>;

const uiIDsSchema = z.object({
	alternatives: languageAlternativesSchema,
	changedAutomatically: z.boolean(),
});
const translationHighlightSchema = z.record(z.boolean().or(z.string()));

const titleSchema = z.union([
	z.string(),
	z.object({
		statement: z.string(),
		alternatives: languageAlternativesSchema,
	}),
]);

const contractDataSchema = z.object({
	title: titleSchema,
	linkUrl: z.string(),
	required: z.boolean().optional(),
	linkTitle: titleSchema,
});

export type ContractData = z.infer<typeof contractDataSchema>;

const freeTextDataSchema = z.object({
	title: titleSchema,
	placeholder: titleSchema,
	textAreaMode: z.boolean(),
});

export type FreeTextData = z.infer<typeof freeTextDataSchema>;
export const userIdentifierFormFields = [
	"FIRST_NAME",
	"LAST_NAME",
	"PHONE_NUMBER",
	"EMAIL",
	"COMPANY",
	"ID",
	"STREET",
	"CITY",
	"ZIP",
	"STATE",
	"CONTRACT",
	"COMMUNICATION",
	"FREE_TEXT_INPUT",
] as const;

export const userIdentifierFormFieldSchema = z.enum(userIdentifierFormFields);

export type UserIdentifierFormField = (typeof userIdentifierFormFields)[number];
export type LowercaseUserIdentifierFormField =
	Lowercase<UserIdentifierFormField>;

export const lowercaseUserIdentifierFormFields = userIdentifierFormFields.map(
	(field) => field.toLowerCase() as LowercaseUserIdentifierFormField,
);

export const lowercaseUserIdentifierFormFieldSchema = z.enum(
	lowercaseUserIdentifierFormFields as [
		LowercaseUserIdentifierFormField,
		...LowercaseUserIdentifierFormField[],
	],
);

// Common for both "root" messages and "response" messages
const baseMessageSchema = z.object({
	id: z.string(),
	image: z.number().optional().nullable(),
	uiIDs: uiIDsSchema.optional(),
	sender: z.enum(["BOT", "USER"]),
	urlBase: z.string().optional().nullable(),
	language: z.string().optional().nullable(),
	statement: z.string(),
	alternatives: languageAlternativesSchema.optional(),
	translationHighlight: translationHighlightSchema.optional(),
	automatically_goto_next: z.boolean().optional(),
	jumpToNextMessage: z.boolean().optional(),
	surveyQuestionId: z.union([z.number(), z.string()]).optional().nullable(),
	preferredAdvertisementCategory: z.string().optional().nullable(),

	requestMethod: z.string().optional().nullable(),
	advertisementScope: z.string().optional().nullable(),
	userIdentifierType: z
		.union([z.string(), z.array(userIdentifierFormFieldSchema)])
		.nullable()
		.optional(),
	forcedUserAttribute: z.string().optional().nullable(),
	flowDecisionElements: z.array(z.string()).optional().readonly(),
	preferredUserAttribute: z.string().optional().nullable(),
	qty_visible_categories: z.number().optional().nullable(),

	sendId: z.union([z.string(), z.boolean()]).optional().nullable(),
	campaignId: z.union([z.string(), z.number()]).optional().nullable(),
	simpleView: z.enum(["true", "false"]).optional().nullable(),
	embedded_code: z.string().optional().nullable(),
	registerCustomer: z.union([z.string(), z.number()]).optional().nullable(),
	contractData: contractDataSchema.optional().nullable(),
	verifyEmail: z.boolean().optional(),
	communicationData: contractDataSchema.optional().nullable(),
	freeTextData: freeTextDataSchema.optional().nullable(),
	campaign: z.string().optional().nullable(),
});

const approvalResponseMessageSchema = baseMessageSchema.extend({
	type: z.literal("APPROVAL_RESPONSE"),
});

const disapprovalResponseMessageSchema = baseMessageSchema.extend({
	type: z.literal("DISAPPROVAL_RESPONSE"),
});

const responseMessageSchema = z.union([
	approvalResponseMessageSchema,
	disapprovalResponseMessageSchema,
]);
export type ResponseMessage = z.infer<typeof responseMessageSchema>;

const baseResponsesMessageSchema = baseMessageSchema.extend({
	responses: z.array(responseMessageSchema).optional().readonly(),
});

const campaignBidsSchema = z.object({
	view: z.number().int(),
	visit: z.number().int(),
	action: z.number().int(),
	customer: z.number().int(),
	purchase: z.number().int(),
	referral: z.number().int(),
});

const currencySchema = z.object({
	rate: z.number(),
	title: z.string(),
});

const surveyCampaignInfoSchema = z.object({
	id: z.number().optional(),
	answers: z.array(z.string()).optional().readonly(),
	answerIds: z.array(z.number()).optional().readonly(),
	campaign_bids: campaignBidsSchema.optional(),
	reward_shares: z
		.object({
			each_other: z.number(),
			operator_only: z.number(),
		})
		.optional(),
	currency: currencySchema.optional(),
	question: z.string().optional(),
	hide_top_text_section: z.boolean().optional().nullable(),
	editable: z.boolean().optional().nullable(),
	// Other structure:
	each_other: z.number().optional(),
	operator_only: z.number().optional(),
});

const surveyQuestionMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("SURVEY_QUESTION"),
	leadTo: z.string().optional().nullable(),
	topText: languageAlternativesSchema.optional(),
	answerIds: z.array(z.number()).optional().readonly(),
	surveyName: languageAlternativesSchema.optional(),
	topStatement: z.string().optional().nullable(),
	requestMethod: z.string().optional().nullable(),
	qty_visible_categories: z.number().optional(),
	answerTitleAlternatives: z
		.array(z.record(languageAlternativesSchema))
		.optional()
		.readonly(),
	surveyAdvertisementScope: z.string().optional().nullable(),
	surveyCampaignInfo: surveyCampaignInfoSchema.optional().nullable(),
	noAnsweringTwice: z.boolean().optional().nullable(),
});
export type SurveyQuestionMessage = z.infer<typeof surveyQuestionMessageSchema>;

const greetingMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("GREETING"),
});
export type GreetingMessage = z.infer<typeof greetingMessageSchema>;

const imageMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("IMAGE"),
	// This is bogus and not used!!!
	imageUrl: z.string().url().optional(),
});
export type ImageMessage = z.infer<typeof imageMessageSchema>;

const customHtmlMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("IFRAME_JAVASCRIPT"),
	embedded_code: z.string(), // Not optional,
});
export type CustomHtmlMessage = z.infer<typeof customHtmlMessageSchema>;

const fieldSchema = z.object({
	name: z.string(),
	title: z.string(),
	checked: z.boolean(),
	readonly: z.boolean(),
});

const couponDataSchema = z.object({
	id: z.number(),
	cost: z.string(),
	logo: z.string().url().nullable(),
	type: z.string(),
	isOwn: z.boolean(),
	title: z.string(),
	editType: z.boolean(),
	progress: z.object({
		label: z.string(),
	}),
	readonly: z.boolean(),
	is_active: z.boolean(),
	locations: z.array(z.string()),
	show_date: z.boolean(),
	customdate: z.boolean(),
	campaignName: z.string(),
	bids: z
		.array(
			z.object({
				id: z.number(),
				title: z.string(),
				value: z.string(),
			}),
		)
		.readonly(),
	referrals: z.object({
		friends: z.boolean(),
		multiple: z.boolean(),
	}),
	action: z.object({
		name: z.string(),
		type: z.string(),
		script: z.string(),
	}),
	target: z.object({
		countries: z.array(z.string().nullable()).readonly(),
		categories: z.array(z.string().nullable()).readonly(),
	}),
	translations: z.object({
		visit: languageAlternativesSchema.optional(),
		view: languageAlternativesSchema.optional(),
		action: languageAlternativesSchema.optional(),
		action_name: languageAlternativesSchema,
		campaign_name: languageAlternativesSchema,
		inviter_title: languageAlternativesSchema,
		working_title: languageAlternativesSchema,
		contract_data_title: languageAlternativesSchema,
		description_inviter: languageAlternativesSchema,
		button_settings_name: languageAlternativesSchema,
		communication_data_title: languageAlternativesSchema,
		contract_data_link_title: languageAlternativesSchema,
		communication_data_link_title: languageAlternativesSchema,
	}),
	// See case statement in messages_new.js
	campaign_type: z.enum([
		"view_display",
		"view",
		"view_video",
		"video",
		"visit_online",
		"action_online",
		"visit_and_action",
		"visit",
		"customer_acquisition",
	]),
	custom_period: z.object({
		endDate: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/),
		startDate: z.string().regex(/^\d{4}\.\d{2}\.\d{2}$/),
	}),
	inviter_title: z.string(),
	operator_only: z.boolean(),
	show_progress: z.boolean(),
	working_title: z.string(),
	coupon_created: z.number(),
	answered_survey: z.array(z.number()).readonly(),
	button_settings: z.object({
		name: z.string(),
		bg_color: z.string(),
		font_color: z.string(),
	}),
	conversion_rate: z.string(),
	coupon_redeemed: z.number(),
	expiration_date: z.string(),
	hidetotalreward: z.boolean().optional().nullable(),
	postActionTitle: languageAlternativesSchema,
	/*
	 */
	advertisement_description: z.object({
		view: z.string().nullable(),
		visit: z.string().nullable(),
		action: z.string().nullable(),
		inviter: z.string(),
		purchase: z.string(),
	}),
	secretAction: z.string().optional(),
	registrationFormDescription: languageAlternativesSchema,
	postActionDescription: languageAlternativesSchema,
	advertisement_description_translations: z.object({
		view: languageAlternativesSchema.optional(),
		visit: languageAlternativesSchema.optional(),
		action: languageAlternativesSchema.optional(),
		action_name: languageAlternativesSchema,
		campaign_name: languageAlternativesSchema,
		inviter_title: languageAlternativesSchema,
		working_title: languageAlternativesSchema,
		contract_data_title: languageAlternativesSchema,
		description_inviter: languageAlternativesSchema,
		button_settings_name: languageAlternativesSchema,
		communication_data_title: languageAlternativesSchema,
		contract_data_link_title: languageAlternativesSchema,
		communication_data_link_title: languageAlternativesSchema,
	}),
	user_registration_fields: z.array(fieldSchema).readonly(),
	advertisement_url: z.object({
		video: z.string(),
		visit: z.string(),
		action: z.string().nullable(),
		purchase: z.string(),
	}),
	campaign_category: z.string(),
	multiple_referrals: z.boolean(),
	survey_question_id: z.number().nullable(),
	acquisition_subtype: z.string(),
	cost_per_conversion: z.string(),
	annotation: z.object({
		link: z.string(),
		logo: z.string(),
		title: z.string(),
		description: z.string().nullable(),
	}),
	campaign_bids: campaignBidsSchema,
	reward_shares: z.object({
		each_other: z.number(),
		operator_only: z.number(),
	}),
	currency: currencySchema,
	contractData: contractDataSchema,
	communicationData: contractDataSchema.optional().nullable(),
	registerCustomer: z.string().optional().nullable(),
});
export type CouponData = z.infer<typeof couponDataSchema>;

export const campaignMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("CAMPAIGN"),
	compressFormHeight: z.boolean().optional().nullable(),
	coupon: couponDataSchema.optional(),
});
export type CampaignMessage = z.infer<typeof campaignMessageSchema>;

const textMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("TEXT"),
});
export type TextMessage = z.infer<typeof textMessageSchema>;

const flowDecisionMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("FLOW_DECISION"),
	leadTo: z.string(),
	answerIds: z.array(z.number()).readonly(),
});

const userIdentifierHandoverMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("USER_IDENTIFIER_HANDOVER"),
	autoForward: z.union([z.boolean(), z.enum(["true", "false"])]).optional(),
	openGraphView: z.boolean().optional(),
	openGraphTitle: z.string().optional(),
	withParameters: z.boolean().optional(),
	openGraphDomain: z.string().optional(),
	openGraphIconBasedOn: z.boolean().optional(),
	openGraphImageUrl: z.string().optional(),
	openGraphIconBased: z.boolean().optional(),
	openGraphDescription: z.string().optional(),
});
export type UserIdentifierHandoverMessage = z.infer<
	typeof userIdentifierHandoverMessageSchema
>;

const userIdentifierMultipleMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("USER_IDENTIFIER_MULTIPLE"),
	compressFormHeight: z.boolean().optional().nullable(),
});
export type UserIdentifierMultipleMessage = z.infer<
	typeof userIdentifierMultipleMessageSchema
>;

const userIdentifierMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("USER_IDENTIFIER"),
});
export type UserIdentifierMessage = z.infer<typeof userIdentifierMessageSchema>;

const chooseBrandMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("CHOOSE_BRAND"),
});
export type ChooseBrandMessage = z.infer<typeof chooseBrandMessageSchema>;

const theEndMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("THE_END"),
});

const userAttributeMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("USER_ATTRIBUTE"),
	arguments: z.number().optional(),
	attributes: z
		.array(
			z.object({
				name: z.string(),
				value: z.number(),
				statement: z.string(),
				translations: languageAlternativesSchema.optional(),
			}),
		)
		.optional(),
});
export type UserAttributeMessage = z.infer<typeof userAttributeMessageSchema>;

const userAttributeApproveMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("USER_ATTRIBUTE_APPROVE"),
});
export type UserAttributeApproveMessage = z.infer<
	typeof userAttributeApproveMessageSchema
>;

const userAttributeDisapproveMessageSchema = baseResponsesMessageSchema.extend({
	type: z.literal("USER_ATTRIBUTE_DISAPPROVE"),
});
export type UserAttributeDisapproveMessage = z.infer<
	typeof userAttributeDisapproveMessageSchema
>;

const responsesMessageSchema = z.union([
	surveyQuestionMessageSchema,
	greetingMessageSchema,
	imageMessageSchema,
	customHtmlMessageSchema,
	campaignMessageSchema,
	textMessageSchema,
	userIdentifierHandoverMessageSchema,
	userIdentifierMultipleMessageSchema,
	userIdentifierMessageSchema,
	chooseBrandMessageSchema,
	theEndMessageSchema,
	userAttributeMessageSchema,
	userAttributeApproveMessageSchema,
	userAttributeDisapproveMessageSchema,
	flowDecisionMessageSchema,
]);
export type V15ResponsesMessage = z.infer<typeof responsesMessageSchema>;

const messageSequenceSchema = z.array(responsesMessageSchema).readonly();

const messageSequencesSchema = z.object({
	comment: z.string().optional(),
	messagesSequences: z.array(messageSequenceSchema).readonly(),
});

const rewardActionsSchema = z.object({
	id: z.string(),
	messagesSequences: z
		.array(z.array(responsesMessageSchema).readonly())
		.readonly(),
});

const edgeSchema = z.object({
	id: z.string().optional(),
	mainSequenceMessageID: z.string().optional(),
	rankingElementId: z.number().optional().nullable(),
	exitSequenceMessageID: z.string().optional(),
	decisionNumber: z.number().optional(),
});
export type V15Edge = z.infer<typeof edgeSchema>;

export const conversationTemplateDefinitionSchema = z.object({
	botType: z.string(),
	version: z.number().optional(),
	exitSequence: messageSequencesSchema,
	mainSequence: messageSequencesSchema,
	introSequence: messageSequencesSchema,
	rewardActions: z.array(rewardActionsSchema).readonly(),
	triageResponses: z.array(edgeSchema).optional().readonly(),
	approvalResponses: z.array(edgeSchema),
	completionResponses: z.array(edgeSchema).optional().readonly(),
	alternativeResponses: z.array(edgeSchema).readonly(),
	disapprovalResponses: z.array(edgeSchema).readonly(),
	// Include other top-level keys as necessary...
});

export type ConversationTemplateDefinition = z.infer<
	typeof conversationTemplateDefinitionSchema
>;
