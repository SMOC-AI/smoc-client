import type { ConversationDetail } from './ConversationDetail';
import type { Theme } from './Theme';
import { ClientNodeMessage } from './NodeMessage';

type ConversationDataParams = {
	operatorKey: string;
	operatorChannelKey: string;
	conversationTemplateKey: string;
    headers?: Headers;
};

type ConversationDataResult = {
	theme: Theme;
	conversationDetail: ConversationDetail;
	nodeMessages: readonly ClientNodeMessage[];
};

export async function prepareConversationData(
	flowUrl: string,
) {
	const url = new URL(flowUrl);
	const params: ConversationDataParams = {
		operatorKey: url.pathname.split('/')[1],
		operatorChannelKey: url.pathname.split('/')[2],
		conversationTemplateKey: url.pathname.split('/')[3],
	};
	const apiStartConversationUrl = new URL(
		[
			'',
			'operator',
			params.operatorKey,
			params.operatorChannelKey,
			params.conversationTemplateKey,
		].join('/'),
		url,
	);
	apiStartConversationUrl.search = url.search;

	const startConversationRes = await fetch(apiStartConversationUrl);
	if (!startConversationRes.ok) {
		throw new Error(`${startConversationRes.status}: ${await startConversationRes.text()}`);
	}
	const conversationDataResult: ConversationDataResult = await startConversationRes.json();

	const wsUrlObj = new URL(
		['', params.operatorKey, params.operatorChannelKey, params.conversationTemplateKey, 'ws'].join(
			'/',
		),
        url,
	);
	wsUrlObj.protocol = wsUrlObj.protocol.replace('http', 'ws');
    wsUrlObj.search = url.search;
	wsUrlObj.searchParams.set('conversation_id', conversationDataResult.conversationDetail.conversation_id);

	const wsUrl = wsUrlObj.toString();

	return { wsUrl, ...conversationDataResult };
}
