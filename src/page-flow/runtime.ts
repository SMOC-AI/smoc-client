import type { PageFlowScriptConfig } from './config';
import { isBotUserAgent } from './config';

const CONSENT_KEY = 'smoc_analytics_consent';

export type TrialCookiePayload = { url: string; token: string; trialId?: string };

function hasConsent(): boolean {
	try {
		return localStorage.getItem(CONSENT_KEY) !== '0';
	} catch {
		return true;
	}
}

function visitorId(): string {
	try {
		const k = 'smoc_vid';
		const sp = new URLSearchParams(location.search);
		const fromUrl = sp.get('smoc_vid');
		if (fromUrl) {
			sp.delete('smoc_vid');
			history.replaceState(null, '', location.pathname + (sp.toString() ? `?${sp}` : ''));
		}
		let v = fromUrl || localStorage.getItem(k);
		if (!v) {
			v = Math.random().toString(36).slice(2) + Date.now().toString(36);
			localStorage.setItem(k, v);
		}
		return v;
	} catch {
		return Math.random().toString(36);
	}
}

function readTrialCookie(cookieName: string): TrialCookiePayload | null {
	try {
		const re = new RegExp(`(?:^|; )${cookieName}=([^;]*)`);
		const m = document.cookie.match(re);
		if (!m) return null;
		return JSON.parse(decodeURIComponent(m[1]!)) as TrialCookiePayload;
	} catch {
		return null;
	}
}

function setTrialCookie(cookieName: string, payload: TrialCookiePayload): void {
	try {
		document.cookie = `${cookieName}=${encodeURIComponent(JSON.stringify(payload))};path=/;max-age=${90 * 24 * 60 * 60};SameSite=Lax`;
	} catch {
		// ignore
	}
}

function post(
	config: PageFlowScriptConfig,
	outcome: boolean,
	body: Record<string, unknown>,
): Promise<Response> {
	const url = outcome ? config.outcomeUrl : config.assignUrl;
	return fetch(url, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(body),
		credentials: 'omit',
	});
}

function scrollDepth(): number {
	const h = document.documentElement;
	const sh = h.scrollHeight - window.innerHeight;
	if (sh <= 0) return 1;
	return Math.min(1, Math.max(0, (window.scrollY || h.scrollTop) / sh));
}

export function initPageFlow(config: PageFlowScriptConfig): void {
	let maxDepth = 0;
	let token = '';
	const reported: Record<string, 1> = {};

	function beacon(kind: string, extra?: { scrollDepth?: number }) {
		if (!hasConsent() || !token || reported[kind]) return;
		reported[kind] = 1;
		void post(config, true, {
			token,
			kind,
			scrollDepth: extra?.scrollDepth,
		});
	}

	function wireSignupLinks(trial: string) {
		if (!trial) return;
		document.querySelectorAll('[data-smoc-signup],a[data-inbound-cta]').forEach((el) => {
			try {
				const href = el.getAttribute('href');
				if (!href) return;
				const u = new URL(href, location.href);
				if (u.hostname.indexOf('console.') < 0 && !el.hasAttribute('data-smoc-signup')) return;
				u.searchParams.set('smoc_trial', trial);
				el.setAttribute('href', u.toString());
				el.setAttribute('data-smoc-signup', '');
			} catch {
				// ignore
			}
		});
	}

	function onScroll() {
		const d = scrollDepth();
		if (d > maxDepth) maxDepth = d;
		if (d >= 0.5) beacon('scroll', { scrollDepth: d });
		if (d >= 0.99) beacon('scroll', { scrollDepth: 1 });
	}

	function onClick(ev: Event) {
		const t = ev.target;
		if (!t || !(t instanceof Element)) return;
		if (t.closest('[data-smoc-signup]')) {
			beacon('signup_intent');
			return;
		}
		const el = t.closest('a,button');
		if (el) beacon('click');
	}

	function startMeasure(tok: string) {
		token = tok;
		wireSignupLinks(tok);
		window.addEventListener('scroll', onScroll, { passive: true });
		document.addEventListener('click', onClick, true);
		window.addEventListener(
			'pagehide',
			() => {
				beacon('scroll', { scrollDepth: maxDepth || scrollDepth() });
			},
			{ once: true },
		);
	}

	const smoc = (window as unknown as { smoc?: { signup?: () => void } }).smoc ?? {};
	smoc.signup = () => beacon('signup_intent');
	(window as unknown as { smoc: typeof smoc }).smoc = smoc;

	function run() {
		const parsed = readTrialCookie(config.cookieName);
		if (parsed?.url && parsed.url !== location.href) {
			location.replace(parsed.url);
			return;
		}
		if (parsed?.token) {
			startMeasure(parsed.token);
			return;
		}
		if (isBotUserAgent(navigator.userAgent)) return;

		const anti = document.createElement('style');
		anti.id = 'smoc-af';
		anti.textContent = 'body{opacity:0!important}';
		document.documentElement.appendChild(anti);
		let done = false;
		const timer = window.setTimeout(() => {
			if (!done) {
				done = true;
				anti.remove();
			}
		}, 800);

		void post(config, false, {
			visitorId: visitorId(),
			landingUrl: location.href,
			device_type: /Mobi/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
			utm_source: new URLSearchParams(location.search).get('utm_source'),
		})
			.then((r) => r.json())
			.then((res: { url?: string; token?: string; trialId?: string }) => {
				if (done) return;
				done = true;
				anti.remove();
				window.clearTimeout(timer);
				if (!res?.url || !res.token) return;
				setTrialCookie(config.cookieName, {
					url: res.url,
					token: res.token,
					trialId: res.trialId,
				});
				startMeasure(res.token);
				if (res.url !== location.href) location.replace(res.url);
			})
			.catch(() => {
				if (!done) {
					done = true;
					anti.remove();
					window.clearTimeout(timer);
				}
			});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', run, { once: true });
	} else {
		run();
	}
}