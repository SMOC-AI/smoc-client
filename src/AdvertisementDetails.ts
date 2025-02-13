///// Generated file. Do not edit.
import { z } from 'zod';

const jsonSchema: z.ZodType = z.lazy(() =>
	z.union([
		z.string(),
		z.number(),
		z.boolean(),
		z.null(),
		z.array(jsonSchema).readonly(),
		z.record(jsonSchema).readonly(),
	]),
);
export const advertisementDetailsSchema = z
	.object({
		advertisement_bid_cents: z.number().nullable(), // integer
		advertisement_category: z.number().nullable(), // integer
		advertisement_id: z.number().nullable(), // integer
		advertisement_ranking_element_id: z.number().nullable(), // integer
		advertisement_ranking_element_title: z.string().nullable(), // character varying
		campaign_description: z.string().nullable(), // character varying
		campaign_end_date: z.string().nullable(), // timestamp without time zone
		campaign_id: z.number().nullable(), // integer
		campaign_start_date: z.string().nullable(), // timestamp without time zone
		campaign_title: z.string().nullable(), // character varying
	})
	.readonly();

export type AdvertisementDetails = z.infer<typeof advertisementDetailsSchema>;
