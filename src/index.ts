import { toLeadForm } from "./LeadForm";
import type { VisitorMessage } from "./ChatMessage";
import type { NodeMessage } from "./NodeMessage";

import type { Command } from "./Command";
import { createLangValue } from "./Lang";

/**
 * Make a command from a form submission.
 * This makes it easier for HTML bases UIs to send commands to the server.
 * Just code the message as a form and call this function with the form and the button that was clicked.
 *
 * @param form - The form element that was submitted.
 * @param submitter - The button that was clicked.
 * @returns The command that was made, or undefined if no command could be made.
 */
export function makeCommand(
	form: HTMLFormElement,
	submitter: HTMLElement,
): Command {
	const formData = new FormData(form);
	const leadForm = toLeadForm(formData);
	if (leadForm) {
		return {
			type: "submit-lead-form",
			form: leadForm,
		};
	}

	const submitterValue = "value" in submitter ? submitter.value : null;
	const text = submitter.innerText;

	const visitorMessage: VisitorMessage = {
		interlocutor: "visitor",
		elements: [{ type: "prose", options: { text: createLangValue(text) } }],
	};

	const nodeMessage: NodeMessage = {
		path: [],
		chatMessage: visitorMessage,
		instanceId: crypto.randomUUID(),
	};

	if (typeof submitterValue === "string" && submitterValue) {
		const surveyQuestionId = formData.get("survey_question_id");

		if (typeof surveyQuestionId === "string" && surveyQuestionId) {
			return {
				type: "answer-survey-question",
				surveyQuestionId: surveyQuestionId,
				surveyAnswerId: submitterValue,
				nodeMessage,
			};
		} else {
			return {
				type: "answer-approval-question",
				approvalAnswerId: submitterValue,
				nodeMessage,
			};
		}
	}

	// Could not make a command from the form.
	const formObj = Object.fromEntries(formData.entries());
	// eslint-disable-next-line no-console
	console.error(`Could not make a command from the form. The form must have one of the following input fields:
* Survey Question: A survey_question_id and one or more submit buttons with a value (used as the survey answer id).
* Lead:            One of email or phone.

Form Data: ${JSON.stringify(formObj, null, 2)}
Submitter: ${JSON.stringify(submitterValue)}
	`);
	throw new Error(
		"Could not make a command from the form. See error console for details.",
	);
}
