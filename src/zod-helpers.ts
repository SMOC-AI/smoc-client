import { htmlToText } from "html-to-text";
import { z, ZodError, type ZodType } from "zod";
import { fromError, ValidationError } from "zod-validation-error";

/**
 * Parses an object with a Zod Schema and gives a detailed error message when it fails.
 */
export function zodParse<Output>(
	body: unknown,
	schema: ZodType<Output>,
): Output {
	try {
		return schema.parse(body);
	} catch (err) {
		const error = fromError(err);
		error.message += "\nObject:\n" + JSON.stringify(body, null, 2);
		throw error;
	}
}

export function stringWithoutHtmlTags() {
	return z.string().transform((val) => htmlToText(val));
}

export function isZodError(error: unknown): error is Error {
	return error instanceof ZodError || error instanceof ValidationError;
}
