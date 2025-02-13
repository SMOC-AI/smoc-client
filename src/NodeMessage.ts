import { z } from 'zod';

import { chatMessageSchema } from './ChatMessage';

export const nodeMessageSchema = z
	.object({
		path: z.array(z.string()).readonly(),
		instanceId: z.string(),
		chatMessage: chatMessageSchema,
		progress: z.number().optional(),
	})
	.readonly();
export type NodeMessage = z.infer<typeof nodeMessageSchema>;
