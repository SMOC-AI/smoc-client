import { z } from "zod";

import {
	type LowercaseUserIdentifierFormField,
	lowercaseUserIdentifierFormFields,
	lowercaseUserIdentifierFormFieldSchema,
} from "./ConversationTemplate";
import { stringWithoutHtmlTags, zodParse } from "./zod-helpers";

export const leadFormSchema = z
	.record(
		lowercaseUserIdentifierFormFieldSchema,
		stringWithoutHtmlTags().optional(),
	)
	.readonly();
export type LeadForm = z.infer<typeof leadFormSchema>;

export function toLeadForm(form: FormData): LeadForm | null {
	const entries = [...form.entries()].filter(([key]) =>
		lowercaseUserIdentifierFormFields.includes(
			key as LowercaseUserIdentifierFormField,
		),
	);
	const values = Object.fromEntries(entries);

	const leadForm = zodParse(values, leadFormSchema);

	return Object.entries(leadForm).length > 0 ? leadForm : null;
}
