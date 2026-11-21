# smoc-client

TypeScript client for integrating with SMOC:

- **Page-flow** — lightweight browser script for static page experiments (assign, redirect, outcomes).
- **Conversation** — Node or bundled apps that join a flow over WebSocket.

## Page-flow browser script

Use this on marketing or landing pages running a **page** flow (`webFormat: page`). The script calls the page-flow assign API, stores the trial in a cookie, optionally redirects to the assigned variant, and sends scroll / click / signup outcomes.

### Embed snippet

Put one tag in `<head>`. **Do not use `async` or `defer`** so anti-flicker styling can run before first paint.

```html
<script
  src="https://go.smoc.ai/page.js"
  data-smoc-assign="https://go.smoc.ai/page-flow/OPERATOR/CHANNEL/FLOW/assign"
  data-smoc-cookie="smoc_pf_FLOW_ID"
></script>
```

Replace `OPERATOR`, `CHANNEL`, and `FLOW` with your flow path. Use a unique `data-smoc-cookie` per experiment (for example `smoc_pf_inbound` or `smoc_pf_<flowId>`).

### Script URL options

| Source | URL |
|--------|-----|
| SMOC CDN (recommended) | `https://go.smoc.ai/page.js` |
| npm package | `smoc-client` export `./page` → `dist/page.global.js` |
| unpkg | `https://unpkg.com/smoc-client/dist/page.global.js` |

### Data attributes

Read from `document.currentScript` when the script runs:

| Attribute | Required | Description |
|-----------|----------|-------------|
| `data-smoc-assign` | Yes | POST URL for assignment (ends with `/assign`). |
| `data-smoc-outcome` | No | POST URL for outcomes. Defaults to `assign` with `/assign` replaced by `/outcome`. |
| `data-smoc-cookie` | No | Cookie name for the trial payload. Defaults to `smoc_pf`. |

If `data-smoc-assign` is missing, the script does nothing.

### Behavior

1. If a trial cookie already exists, redirect to the stored URL when it differs from the current page, then measure outcomes.
2. Otherwise POST to assign with `visitorId`, `landingUrl`, device type, and `utm_source`.
3. On success, set the cookie, start measuring, and redirect if the assigned URL is not the current page.
4. Outcomes: scroll depth, clicks, and signup intent (`data-smoc-signup`, console signup links, or `window.smoc.signup()`).
5. Signup links get `smoc_trial` appended when wired.

Analytics beacons are skipped when `localStorage.smoc_analytics_consent` is `'0'`. Crawlers matching common bot user agents skip assignment.

### Build and test

```bash
npm install
npm run build   # dist/page.global.js (IIFE) + conversation bundles
npm test
```

---

## Conversation client (Node)

### Get WebSocket URL

```typescript
const flowUrl = `https://link-to-smoc-flow`;

const res = await fetch(flowUrl);
if (!res.ok) {
	throw new Error(`${res.status}: ${await res.text()}`);
}
const { wsUrl } = await res.json<{ wsUrl: string }>();
```

### Create conversation client

```typescript
import makeJoinConversation from 'smoc-client';

const joinConversation = makeJoinConversation(wsUrl);
const client = joinConversation({
	statusChanged: (status) => {
		console.log(status);
	},
	handleMessage: async (nodeMessage) => {
		// Handle messages
	},
});
```

### Send command

```typescript
const surveyQuestionId = nodeMessage.ChatMessage.metadata.surveyQuestionId;

const controls = nodeMessage.chatMessage.elements.filter(isControl) as Control[];

const answer = await select({
	message: chalk.magenta(proseText),
	choices: controls.map((control) => ({
		name: control.options.text[lang],
		value: control.options,
	})),
});

client.send({
	type: 'answer-survey-question',
	surveyAnswerId: answer.surveyAnswerId,
	surveyQuestionId,
	nodeMessage,
});
```

For chat UI on a website, see [smoc-widget](https://github.com/SMOC-AI/smoc-widget).