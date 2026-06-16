/**
 * aiService.ts
 * Handles communication with the Anthropic Claude API.
 * Kept deliberately thin — all prompt logic lives here so it's easy to swap models.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001"; // Fast and cheap — ideal for real-time UX

export interface AiSuggestionResult {
	suggestion: string;
	error?: string;
}

/**
 * Sends the current field value to Claude with a configurable instruction
 * and returns the AI suggestion.
 */
export async function getAiSuggestion(
	text: string,
	instruction: string,
	apiKey: string,
): Promise<AiSuggestionResult> {
	if (!text.trim()) {
		return { suggestion: "", error: "No text to process." };
	}

	if (!apiKey) {
		return { suggestion: "", error: "API key is not configured." };
	}

	const systemPrompt = `You are a helpful writing assistant embedded inside a business application.
The user will provide text and an instruction. Follow the instruction precisely.
Respond with ONLY the improved/processed text — no explanations, no preamble, no quotation marks.
Keep the response concise and relevant to a business context.`;

	const userMessage = `Instruction: ${instruction || "Improve this text for a professional business context."}

Text:
${text}`;

	try {
		const response = await fetch(ANTHROPIC_API_URL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
				"anthropic-version": "2023-06-01",
				"anthropic-dangerous-direct-browser-access": "true",
			},
			body: JSON.stringify({
				model: MODEL,
				max_tokens: 500,
				system: systemPrompt,
				messages: [{ role: "user", content: userMessage }],
			}),
		});

		if (!response.ok) {
			const err = await response.json();
			return {
				suggestion: "",
				error: err?.error?.message || "API error.",
			};
		}

		const data = await response.json();
		const suggestion = data?.content?.[0]?.text?.trim() || "";

		return { suggestion };
	} catch (e) {
		return {
			suggestion: "",
			error: "Network error. Could not reach the AI service.",
		};
	}
}
