import { z } from 'zod';

import { clientChatMessageSchema } from './ChatMessage';

export const clientNodeMessageSchema = z
	.object({
		path: z.array(z.string()).readonly(),
		instanceId: z.string(),
		chatMessage: clientChatMessageSchema,
		progress: z.number().optional(),
	})
	.readonly();
export type ClientNodeMessage = z.infer<typeof clientNodeMessageSchema>;
