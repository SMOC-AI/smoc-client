import { ClientNodeMessage } from "./NodeMessage";

/**
 * Updates or appends a node message to a list of node messages.
 * If the node message already exists in the list, it will be updated.
 * Otherwise, it will be appended to the list.
 *
 * @param clientNodeMessages
 * @param newClientNodeMessage
 * @returns
 */
export function updateOrAppend(
	clientNodeMessages: readonly ClientNodeMessage[],
	newClientNodeMessage: ClientNodeMessage,
): readonly ClientNodeMessage[] {
	const { instanceId } = newClientNodeMessage;

	const existingClientNodeMessage = clientNodeMessages.find((m) => m.instanceId === instanceId);
	if (existingClientNodeMessage) {
		return clientNodeMessages.map((existingNodeMessage) =>
			existingNodeMessage.instanceId === instanceId ? newClientNodeMessage : existingNodeMessage,
		);
	}

	return [...clientNodeMessages, newClientNodeMessage];
}
