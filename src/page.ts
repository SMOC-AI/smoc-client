import { configFromDataset } from './page-flow/config';
import { initPageFlow } from './page-flow/runtime';

const current = document.currentScript;
if (current instanceof HTMLScriptElement) {
	const cfg = configFromDataset({
		smocAssign: current.dataset.smocAssign,
		smocOutcome: current.dataset.smocOutcome,
		smocCookie: current.dataset.smocCookie,
	});
	if (cfg) initPageFlow(cfg);
}