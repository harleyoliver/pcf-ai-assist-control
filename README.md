# PCF AI Assist Control

A Power Apps PCF (PowerApps Component Framework) control that adds AI-powered text suggestions to any canvas or model-driven app text field — built with TypeScript, React, and the [Anthropic Claude API](https://www.anthropic.com).

![AI Assist Control Demo](docs/demo.gif)

---

## What it does

Drop this control onto any text field in your Power App. Users can type their text, hit **✨ AI Assist**, and receive an AI-generated suggestion they can accept or dismiss — without leaving the form.

Common use cases:
- **Improve writing** — clean up grammar and tone in notes or descriptions
- **Summarise** — condense long free-text input into a concise summary
- **Translate tone** — make casual text more professional (or vice versa)
- **Fix grammar** — correct spelling and sentence structure on the fly

The AI instruction is configurable per-instance, so one canvas app can have multiple fields with different behaviours.

---

## Why PCF + AI?

Power Platform's low-code environment is powerful, but text fields are static. This control bridges the gap — bringing LLM capability directly into the citizen developer ecosystem without requiring backend infrastructure or premium AI Builder credits.

The implementation deliberately separates concerns:
- **`aiService.ts`** — all API logic in one place, easy to swap models or providers
- **`AiAssistField.tsx`** — pure React UI, no PCF coupling, independently testable
- **`index.ts`** — thin PCF adapter, handles only framework lifecycle concerns

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 16+
- [Power Platform CLI](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction) (`pac`)
- An [Anthropic API key](https://console.anthropic.com)
- A Power Apps environment (for deployment)

### Install and run locally

```bash
git clone https://github.com/harleyoliver/pcf-ai-assist-control.git
cd pcf-ai-assist-control
npm install
npm start
```

This launches the PCF test harness at `http://localhost:8181` where you can interact with the control in a browser without deploying to Power Apps.

---

## Configuration

The control exposes four properties configurable from the Power Apps editor:

| Property | Type | Required | Description |
|---|---|---|---|
| `value` | Text (bound) | ✓ | The text field value — bind to your data source |
| `placeholder` | Text (input) | | Placeholder shown when the field is empty |
| `aiInstruction` | Text (input) | | Instruction sent to the AI. E.g. `Summarise this`, `Fix grammar`, `Make this more professional` |
| `apiKey` | Text (input) | ✓ | Your Anthropic API key — use an environment variable in production |

### Production API key handling

Never hardcode your API key in the canvas app directly. Instead:

1. Create a **Power Platform Environment Variable** of type `Secret`
2. Store your Anthropic API key there
3. Reference it in the control's `apiKey` property via `@environmentVariables`

---

## Deploying to Power Apps

```bash
# Build the solution
npm run build

# Push to your environment
pac pcf push --publisher-prefix ho
```

Then add the control to any text field via **+ Component** in the canvas app editor.

---

## Project structure

```
pcf-ai-assist-control/
├── AiAssistControl/
│   ├── ControlManifest.Input.xml   # PCF property definitions
│   ├── index.ts                    # PCF lifecycle adapter
│   ├── components/
│   │   ├── AiAssistField.tsx       # React UI component
│   │   └── AiAssistField.css       # Scoped styles (Fluent-aligned)
│   └── services/
│       └── aiService.ts            # Anthropic API integration
├── package.json
├── tsconfig.json
└── README.md
```

---

## Design decisions

**Why Claude Haiku?** Speed matters in a UX context. Haiku returns suggestions in ~500ms, which feels responsive. Sonnet or Opus would improve quality for complex instructions but would add noticeable latency.

**Why no streaming?** PCF controls run inside an iframe with limited DOM access. Streaming responses require progressive UI updates that complicate the PCF lifecycle. A single-shot response with a loading state is simpler and more reliable in this context.

**Why accept/dismiss rather than inline replacement?** The user should always be in control. Auto-replacing text breaks trust. The suggestion card pattern gives the AI a clear advisory role, not an authoritative one — which matters in business contexts where the user is accountable for what they submit.

---

## Roadmap

- [ ] Streaming response support for longer suggestions
- [ ] Conversation mode — follow-up refinement of suggestions
- [ ] Multi-language instruction presets
- [ ] Power Automate flow trigger on accept event

---

## Author

**Harley Oliver** — Senior Engineer, Power Platform & AI Integration  
[linkedin.com/in/harleyoliver](https://linkedin.com/in/harleyoliver) · [hello@heronamedharley.com](mailto:hello@heronamedharley.com)

---

## Licence

MIT
