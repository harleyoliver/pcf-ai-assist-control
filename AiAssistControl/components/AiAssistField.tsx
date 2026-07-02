import * as React from "react";
import { getAiSuggestion } from "../services/aiService";

export interface AiAssistFieldProps {
	value: string;
	placeholder: string;
	aiInstruction: string;
	apiKey: string;
	onChange: (newValue: string) => void;
	disabled?: boolean;
	label?: string;
}

type SuggestionState = "idle" | "loading" | "ready" | "error";

let idCounter = 0;
function useInstanceId(prefix: string) {
	const ref = React.useRef<string>();
	if (!ref.current) {
		idCounter += 1;
		ref.current = `${prefix}-${idCounter}`;
	}
	return ref.current;
}

export const AiAssistField: React.FC<AiAssistFieldProps> = ({
	value,
	placeholder,
	aiInstruction,
	apiKey,
	onChange,
	disabled,
	label,
}) => {
	const [suggestion, setSuggestion] = React.useState<string>("");
	const [state, setState] = React.useState<SuggestionState>("idle");
	const [errorMessage, setErrorMessage] = React.useState<string>("");

	const baseId = useInstanceId("ai-assist-field");
	const textareaId = `${baseId}-textarea`;
	const errorId = `${baseId}-error`;
	const suggestionId = `${baseId}-suggestion`;
	const suggestionHeadingId = `${baseId}-suggestion-heading`;
	const suggestionRef = React.useRef<HTMLDivElement>(null);
	const errorRef = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		if (state === "ready" && suggestion) {
			suggestionRef.current?.focus();
		} else if (state === "error") {
			errorRef.current?.focus();
		}
	}, [state, suggestion]);

	const handleRequestSuggestion = async () => {
		if (!value.trim() || state === "loading") return;

		setState("loading");
		setSuggestion("");
		setErrorMessage("");

		const result = await getAiSuggestion(value, aiInstruction, apiKey);

		if (result.error) {
			setState("error");
			setErrorMessage(result.error);
		} else {
			setSuggestion(result.suggestion);
			setState("ready");
		}
	};

	const handleAccept = () => {
		onChange(suggestion);
		setSuggestion("");
		setState("idle");
	};

	const handleDismiss = () => {
		setSuggestion("");
		setState("idle");
	};

	const buttonLabel =
		state === "loading"
			? "Thinking…"
			: aiInstruction
				? `✨ ${aiInstruction}`
				: "✨ AI Assist";

	const accessibleLabel =
		label || aiInstruction || "Text input with AI assist";

	const describedBy =
		[
			state === "error" ? errorId : null,
			state === "ready" && suggestion ? suggestionId : null,
		]
			.filter(Boolean)
			.join(" ") || undefined;

	return (
		<div className="ai-assist-field">
			<div className="ai-assist-field__input-row">
				<label
					htmlFor={textareaId}
					className="ai-assist-field__visually-hidden"
				>
					{accessibleLabel}
				</label>
				<textarea
					id={textareaId}
					className="ai-assist-field__textarea"
					value={value}
					placeholder={placeholder || "Enter text…"}
					disabled={disabled}
					aria-describedby={describedBy}
					aria-invalid={state === "error"}
					onChange={(e) => {
						onChange(e.target.value);
						if (state !== "idle") setState("idle");
					}}
					rows={4}
				/>
				<button
					type="button"
					className={`ai-assist-field__trigger-btn ${state === "loading" ? "ai-assist-field__trigger-btn--loading" : ""}`}
					onClick={handleRequestSuggestion}
					disabled={disabled || state === "loading" || !value.trim()}
					title={
						aiInstruction || "Get an AI suggestion for this text"
					}
					aria-label={
						state === "loading"
							? "Generating AI suggestion, please wait"
							: aiInstruction
								? `Get AI suggestion: ${aiInstruction}`
								: "Get an AI suggestion for this text"
					}
					aria-busy={state === "loading"}
				>
					<span aria-hidden="true">{buttonLabel}</span>
				</button>
			</div>

			<div
				className="ai-assist-field__sr-status"
				role="status"
				aria-live="polite"
			>
				{state === "loading" && "Generating AI suggestion…"}
				{state === "ready" &&
					suggestion &&
					"AI suggestion ready. Review below to accept or dismiss."}
			</div>

			{state === "error" && (
				<div
					id={errorId}
					ref={errorRef}
					className="ai-assist-field__error"
					role="alert"
					tabIndex={-1}
				>
					<span>
						<span aria-hidden="true">⚠ </span>
						{errorMessage}
					</span>
					<button
						type="button"
						className="ai-assist-field__dismiss-btn"
						onClick={handleDismiss}
						aria-label="Dismiss error"
					>
						Dismiss
					</button>
				</div>
			)}

			{state === "ready" && suggestion && (
				<div
					id={suggestionId}
					ref={suggestionRef}
					className="ai-assist-field__suggestion"
					role="region"
					aria-labelledby={suggestionHeadingId}
					tabIndex={-1}
				>
					<div className="ai-assist-field__suggestion-header">
						<span
							id={suggestionHeadingId}
							className="ai-assist-field__suggestion-label"
						>
							<span aria-hidden="true">✨ </span>
							AI Suggestion
						</span>
						<span className="ai-assist-field__suggestion-hint">
							Review and accept or dismiss
						</span>
					</div>
					<div className="ai-assist-field__suggestion-text">
						{suggestion}
					</div>
					<div className="ai-assist-field__suggestion-actions">
						<button
							type="button"
							className="ai-assist-field__accept-btn"
							onClick={handleAccept}
							aria-label={`Accept AI suggestion: ${suggestion}`}
						>
							<span aria-hidden="true">✓ </span>
							Accept
						</button>
						<button
							type="button"
							className="ai-assist-field__dismiss-btn"
							onClick={handleDismiss}
							aria-label="Dismiss AI suggestion"
						>
							<span aria-hidden="true">✕ </span>
							Dismiss
						</button>
					</div>
				</div>
			)}
		</div>
	);
};
