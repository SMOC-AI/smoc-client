import { describe, expect, it } from 'vitest';

import { configFromDataset, isBotUserAgent, outcomeUrlFromAssign } from './config';

describe('outcomeUrlFromAssign', () => {
	it('derives outcome from assign', () => {
		expect(
			outcomeUrlFromAssign('https://go.smoc.ai/page-flow/a/b/c/assign'),
		).toBe('https://go.smoc.ai/page-flow/a/b/c/outcome');
	});
	it('uses explicit outcome when set', () => {
		expect(
			outcomeUrlFromAssign('https://x/assign', 'https://x/custom-outcome'),
		).toBe('https://x/custom-outcome');
	});
});

describe('configFromDataset', () => {
	it('returns null without assign', () => {
		expect(configFromDataset({})).toBeNull();
	});
	it('defaults cookie name', () => {
		const cfg = configFromDataset({
			smocAssign: 'https://go.smoc.ai/page-flow/x/y/z/assign',
		});
		expect(cfg?.cookieName).toBe('smoc_pf');
	});
});

describe('isBotUserAgent', () => {
	it('detects bots', () => {
		expect(isBotUserAgent('Googlebot')).toBe(true);
		expect(isBotUserAgent('Mozilla/5.0')).toBe(false);
	});
});