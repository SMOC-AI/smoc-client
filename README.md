# Get Websocket url:

```typescript
const flowUrl = `https://link-to-smoc-flow`

const res = await fetch(flowUrl);
if (!res.ok) {
	throw new Error(`${res.status}: ${await res.text()}`);
}
const { wsUrl } = await res.json<{ wsUrl: string }>();
```

# Create conversation client:

```typescript
import makeJoinConversation from 'smoc-client'

const joinConversation = makeJoinConversation(wsUrl)
const client = joinConversation({
    statusChanged: (status) => {
        console.log(status)
    },
    handleMessage: async (nodeMessage) => {
        // Handle messages
    }
})
```

# Send command

```typescript
const surveyQuestionId = nodeMessage.ChatMessage.metadata.surveyQuestionId

const controls = nodeMessage.chatMessage.elements.filter(isControl) as Control[];

const answer = await select({
    message: chalk.magenta(proseText),
    choices: controls.map((control) => ({
        name: control.options.text[lang],
        value: control.options,
    })),
});

client.send({
    type: 'answer-survey-question'
    surveyAnswerId: answer.surveyAnswerId
    surveyQuestionId,
    nodeMessage
})
```


