import * as React from "react";
import { getAiSuggestion } from "../services/aiService";

export interface AiAssistFieldProps {
  value: string;
  placeholder: string;
  aiInstruction: string;
  apiKey: string;
  onChange: (newValue: string) => void;
  disabled?: boolean;
}

type SuggestionState = "idle" | "loading" | "ready" | "error";

export const AiAssistField: React.FC<AiAssistFieldProps> = ({
  value,
  placeholder,
  aiInstruction,
  apiKey,
  onChange,
  disabled,
}) => {
  const [suggestion, setSuggestion] = React.useState<string>("");
  const [state, setState] = React.useState<SuggestionState>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

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

  return (
    <div className="ai-assist-field">
      {/* Main textarea */}
      <div className="ai-assist-field__input-row">
        <textarea
          className="ai-assist-field__textarea"
          value={value}
          placeholder={placeholder || "Enter text…"}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            if (state !== "idle") setState("idle");
          }}
          rows={4}
        />
        <button
          className={`ai-assist-field__trigger-btn ${state === "loading" ? "ai-assist-field__trigger-btn--loading" : ""}`}
          onClick={handleRequestSuggestion}
          disabled={disabled || state === "loading" || !value.trim()}
          title={aiInstruction || "Get an AI suggestion for this text"}
        >
          {buttonLabel}
        </button>
      </div>

      {/* Error state */}
      {state === "error" && (
        <div className="ai-assist-field__error">
          <span>⚠ {errorMessage}</span>
          <button className="ai-assist-field__dismiss-btn" onClick={handleDismiss}>
            Dismiss
          </button>
        </div>
      )}

      {/* Suggestion card */}
      {state === "ready" && suggestion && (
        <div className="ai-assist-field__suggestion">
          <div className="ai-assist-field__suggestion-header">
            <span className="ai-assist-field__suggestion-label">✨ AI Suggestion</span>
            <span className="ai-assist-field__suggestion-hint">
              Review and accept or dismiss
            </span>
          </div>
          <div className="ai-assist-field__suggestion-text">{suggestion}</div>
          <div className="ai-assist-field__suggestion-actions">
            <button
              className="ai-assist-field__accept-btn"
              onClick={handleAccept}
            >
              ✓ Accept
            </button>
            <button
              className="ai-assist-field__dismiss-btn"
              onClick={handleDismiss}
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
