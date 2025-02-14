// This file defines the theme for the Bot UI.
//
// It is inspired by https://blog.logrocket.com/applying-dynamic-styles-tailwind-css/
//
import { z } from 'zod';

import { langSchema } from './Lang';

const hexPattern = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i;

const hexSchema = z.string().refine((val) => val.match(hexPattern), {
	message: `Invalid hex color`,
});

const colorsSchema = z.object({
	text: hexSchema.optional(),
	message: hexSchema.optional(),
	button: hexSchema.optional(),
	'button-text': hexSchema.optional(),
	'button-hover': hexSchema.optional(),
	'button-hover-text': hexSchema.optional(),
	'button-outline': hexSchema.optional(),

	'input-text': hexSchema.optional(),
	'input-ring': hexSchema.optional(),
	'input-placeholder': hexSchema.optional(),
	'background-color-code-main': hexSchema.optional(),
	'background-color-code-header': hexSchema.optional(),
	// Visitor
	'visitor-text': hexSchema.optional(),
	'visitor-message': hexSchema.optional(),
});
export type Colors = z.infer<typeof colorsSchema>;

export const themeSchema = z.object({
	botImageKey: z.string().nullable().optional(),
	visitorImageKey: z.string().nullable().optional(),
	backgroundImageKey: z.string().nullable().optional(),
	logoImageKey: z.string().nullable().optional(),
	socialImageKey: z.string().nullable().optional(),
	backgroundImagePosition: z.string().nullable().optional(),
	backgroundType: z.string().nullable().optional(),
	colors: colorsSchema,
	forcedLanguage: langSchema.nullable().optional(),
	operatorChannelId: z.number(),
	defaultCountry: z.string().nullable().optional(),
	iframeMode: z.boolean().nullable().optional(),
	transparentMode: z.boolean().nullable().optional(),
	socialTitle: z.string().nullable().optional(),
	socialDescription: z.string().nullable().optional(),
	notificationEmail: z.string().nullable().optional(),
	headTags: z.string().nullable().optional(),
});

export type Theme = z.infer<typeof themeSchema>;

export function toStyle({
	colors,
	backgroundImageKey,
	backgroundImagePosition,
	backgroundType,
}: Theme) {
	const backgroundImageUrl = backgroundImageKey ? getImageUrl(backgroundImageKey) : null;

	const backgroundStyles =
		backgroundImageUrl && backgroundImagePosition && backgroundType === 'image'
			? `--page-background-image: url('${backgroundImageUrl}'); --page-background-position: ${backgroundImagePosition};`
			: '';

	const colorStyle = Object.entries(colors)
		.map(([type, hex]) => color(type, hex))
		.join(' ');

	return `${backgroundStyles} ${colorStyle}`;
}

function color(type: string, hex: string) {
	const match = hex.match(hexPattern);
	if (!match) throw new Error(`Invalid hex color: ${hex}`);
	const [, r, g, b, a] = match;
	const alpha = a ? (parseInt(a, 16) / 255).toFixed(2) : '1';
	return `--color-${type}: ${parseInt(r, 16)}, ${parseInt(g, 16)}, ${parseInt(b, 16)}, ${alpha};`;
}

function getImageUrl(key: string): string {
	return `https://go2.smoc.ai/images/${key}`;
}
