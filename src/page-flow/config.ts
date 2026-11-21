export type PageFlowScriptConfig = {
	assignUrl: string;
	outcomeUrl: string;
	cookieName: string;
};

const DEFAULT_COOKIE = 'smoc_pf';

export function outcomeUrlFromAssign(assignUrl: string, explicitOutcome?: string): string | null {
	if (explicitOutcome?.trim()) return explicitOutcome.trim();
	const assign = assignUrl.trim();
	if (!assign) return null;
	return assign.replace(/assign\/?$/u, 'outcome');
}

export function configFromDataset(dataset: {
	smocAssign?: string;
	smocOutcome?: string;
	smocCookie?: string;
}): PageFlowScriptConfig | null {
	const assignUrl = dataset.smocAssign?.trim() ?? '';
	if (!assignUrl) return null;
	const outcomeUrl = outcomeUrlFromAssign(assignUrl, dataset.smocOutcome) ?? '';
	if (!outcomeUrl) return null;
	const cookieName = dataset.smocCookie?.trim() || DEFAULT_COOKIE;
	return { assignUrl, outcomeUrl, cookieName };
}

export function isBotUserAgent(userAgent: string | undefined): boolean {
	if (!userAgent) return false;
	return /bot|crawl|spider|preview/i.test(userAgent);
}