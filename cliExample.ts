import { makeJoinConversation } from 'smoc-client';

const flowUrl =
	'http://localhost:8788/operator/smoc/operator_10_channel_zburvqt7/test_v3';

const res = await fetch(flowUrl);
if (!res.ok) {
	throw new Error(`${res.status}: ${await res.text()}`);
}
const { wsUrl } = await res.json<{ wsUrl: string }>();

const lang: Lang = 'en-GB';

process.on('SIGINT', () => {
	process.exit();
});

let messages: readonly NodeMessage[] = [];

const joinConversation = makeJoinConversation(wsUrl);
const client = joinConversation({
	statusChanged: (status) => {
		/* eslint-disable no-console */
		console.log(chalk.yellow(status));
	},
	handleMessage: async (nodeMessage) => {
		// console.log(chalk.yellow(nodeMessage.instanceId))
		const lenBefore = messages.length;
		messages = updateOrAppend(messages, nodeMessage);
		const lenAfter = messages.length;
		if (lenAfter == -lenBefore) {
			// It was an update message. Ignore...
			console.log(chalk.blue('Ignoring update message'));
			return;
		}

		const proses = nodeMessage.chatMessage.elements.filter(
			(element) => element.type === 'prose',
		) as Prose[];
		const controls = nodeMessage.chatMessage.elements.filter(
			isControl,
		) as Control[];

		const proseText = proses
			.map((prose) => htmlToText(prose.options.text[lang] || ''))
			.join('\n');
		if (controls.length > 0) {
			const answer = await select({
				message: chalk.magenta(proseText),
				choices: controls.map((control) => ({
					name: control.options.text[lang],
					value: control.options,
				})),
			});
			const text = answer.text[lang];
			if (text === undefined) {
				throw new Error('Text not found');
			}
			const visitorMessage: VisitorMessage = {
				interlocutor: 'visitor',
				elements: [{ type: 'prose', options: { text: createLangValue(text) } }],
			};
			const nodeMessage: NodeMessage = {
				chatMessage: visitorMessage,
				instanceId: crypto.randomUUID(),
				path: [],
			};

			if (answer.approvalAnswerId !== undefined) {
				client.send({
					type: 'answer-approval-question',
					approvalAnswerId: answer.approvalAnswerId,
					nodeMessage,
				});
			} else if (answer.surveyAnswerId !== undefined) {
				const surveyQuestionId =
					nodeMessage.chatMessage.metadata?.surveyQuestionId;
				if (surveyQuestionId === undefined) {
					throw new Error('Survey question not found');
				}
				client.send({
					type: 'answer-survey-question',
					surveyAnswerId: answer.surveyAnswerId,
					surveyQuestionId,
					nodeMessage,
				});
			} else {
				throw new Error(`Unsupported answer: ${JSON.stringify(answer)}`);
			}
		} else {
			console.log(chalk.green(proseText));
		}
	},
});
