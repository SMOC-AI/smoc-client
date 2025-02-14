import { Command } from "./Command";
import { ClientNodeMessage } from "./NodeMessage";

const pingIntervalMillis = 30_000;
const maxReconnectTimeoutMillis = 30_000;

export type Status = 'connecting' | 'connected';

export type ConnectParams = {
	statusChanged: (status: Status) => void;
	handleMessage: (nodeMessage: ClientNodeMessage) => void;
};

export interface ConversationClient {
	send(command: Command): void;
	leave: () => void;
}

/**
 * Join a conversation.
 */
export type JoinConversation = (params: ConnectParams) => ConversationClient;

/**
 * Create a function for joining a conversation.
 */
export function makeJoinConversation(wsUrl: string): JoinConversation {
	const url = new URL(wsUrl);
	if (url.protocol !== 'ws:' && url.protocol !== 'wss:') {
		throw new Error(`Invalid protocol: ${url.protocol}`);
	}
	let ws: WebSocket;
	let pingInterval: ReturnType<typeof setInterval>;
	let reconnectTimeout: ReturnType<typeof setTimeout>;
	let retries = 0;

	const send = (command: Command) => {
		if (ws.readyState !== WebSocket.OPEN) {
			throw new Error('WebSocket not open');
		}
		ws.send(JSON.stringify(command));
	};

	const leave = () => {
		if (pingInterval) {
			clearInterval(pingInterval);
		}
		if (ws) {
			ws.close();
		}
	};

	const join: JoinConversation = (connectParams: ConnectParams) => {
		const { statusChanged, handleMessage } = connectParams;

		statusChanged('connecting');
		ws = new WebSocket(wsUrl);

		ws.addEventListener('open', () => {
			statusChanged('connected');
			retries = 0;
			pingInterval = setInterval(() => {
				if (ws.readyState === WebSocket.OPEN) {
					ws.send('ping');
				}
			}, pingIntervalMillis);
		});

		ws.addEventListener('message', (event) => {
			if (event.data === 'pong') {
				return;
			}
			const nodeMessage = JSON.parse(event.data);
			handleMessage(nodeMessage);
		});

		ws.addEventListener('close', () => {
			clearInterval(pingInterval);
			statusChanged('connecting');
			retries++;
			// Exponential backoff
			const timeout = Math.min(
				(1 + Math.random()) * Math.pow(1.5, retries) * 1000,
				maxReconnectTimeoutMillis,
			);
			/* eslint-disable no-console */
			console.log(
				`WebSocket closed. Reconnection attempt ${retries} in ${timeout}ms`,
			);
			clearTimeout(reconnectTimeout);
			reconnectTimeout = setTimeout(() => join(connectParams), timeout);
		});

		ws.addEventListener('error', (e) => {
			/* eslint-disable no-console */
			console.error('WS ERROR', e);
		});

		return {
			leave,
			send,
		};
	};

	return join;
}