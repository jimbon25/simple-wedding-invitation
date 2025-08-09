import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "../utils/LanguageContext";
import { getApiEndpoint } from "../utils/apiUtils";

interface GeminiChatProps {
  darkMode?: boolean;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ darkMode }) => {
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState<
    { from: "user" | "ai"; text: string }[]
  >([{ from: "ai", text: t("ai_intro") }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingDot, setTypingDot] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: "user", text: input }]);
    setLoading(true);
    setInput("");
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

      const res = await fetch(getApiEndpoint("gemini-chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Keep compatibility with both Vercel and Netlify endpoints
          message: input, // for Vercel
          prompt: input, // for Netlify
          language: language, // Pass the current language
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();
      let aiText = data.reply;
      if (!aiText) {
        aiText =
          language === "en"
            ? "[No response from Gemini API]\n" + JSON.stringify(data, null, 2)
            : "[Tidak ada jawaban dari Gemini API]\n" +
              JSON.stringify(data, null, 2);
      }
      setMessages((msgs) => [...msgs, { from: "ai", text: aiText }]);
    } catch {
      setMessages((msgs) => [...msgs, { from: "ai", text: t("ai_error") }]);
    }
    setLoading(false);
  };

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Animated typing indicator
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setTypingDot((d) => (d + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, [loading]);

  return (
    <div
      style={{
        maxWidth: 350,
        minWidth: 260,
        background: darkMode ? "#232d2b" : "#fff",
        borderRadius: 16,
        boxShadow: darkMode
          ? "0 4px 24px rgba(30,30,30,0.18)"
          : "0 4px 24px rgba(0,0,0,0.13)",
        padding: 16,
        position: "relative",
        color: darkMode ? "#EEE" : undefined,
      }}
    >
      <h4
        style={{
          margin: "0 0 8px 0",
          fontSize: "1.1rem",
          color: darkMode ? "#9CAF88" : "#9CAF88",
          textAlign: "center",
        }}
      >
        {t("ask_assistant")}
      </h4>
      <div
        style={{
          minHeight: 90,
          maxHeight: 200,
          overflowY: "auto",
          marginBottom: 10,
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              textAlign: msg.from === "user" ? "right" : "left",
              margin: "8px 0",
            }}
          >
            <span
              style={{
                display: "inline-block",
                background:
                  msg.from === "user"
                    ? darkMode
                      ? "#9CAF88"
                      : "#9CAF88"
                    : darkMode
                      ? "#181A1B"
                      : "#f3f3f3",
                color:
                  msg.from === "user" ? "#fff" : darkMode ? "#EEE" : "#333",
                borderRadius: 8,
                padding: "6px 12px",
                maxWidth: "80%",
                wordBreak: "break-word",
                fontSize: "0.98em",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
        {loading && (
          <div
            style={{
              color: "#888",
              fontSize: "0.95em",
              display: "flex",
              alignItems: "center",
              height: 24,
            }}
          >
            <span>{t("typing")}</span>
            <span style={{ display: "inline-block", width: 24, marginLeft: 2 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#bbb",
                  margin: "0 1px",
                  opacity: typingDot === 0 ? 1 : 0.3,
                  transition: "opacity 0.2s",
                }}
              ></span>
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#bbb",
                  margin: "0 1px",
                  opacity: typingDot === 1 ? 1 : 0.3,
                  transition: "opacity 0.2s",
                }}
              ></span>
              <span
                style={{
                  display: "inline-block",
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#bbb",
                  margin: "0 1px",
                  opacity: typingDot === 2 ? 1 : 0.3,
                  transition: "opacity 0.2s",
                }}
              ></span>
            </span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={t("write_question")}
          style={{
            flex: 1,
            borderRadius: 8,
            border: darkMode ? "1px solid #444" : "1px solid #ccc",
            background: darkMode ? "#181A1B" : "#fff",
            color: darkMode ? "#EEE" : undefined,
            padding: 8,
            fontSize: "0.98em",
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            borderRadius: 8,
            padding: "8px 12px",
            background: "#9CAF88",
            color: "#fff",
            border: "none",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label={t("send")}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 10.833l13.334-5.555c.833-.347 1.667.486 1.32 1.32l-5.555 13.334c-.347.833-1.486.833-1.833 0l-2.222-5.555-5.555-2.222c-.833-.347-.833-1.486 0-1.833z"
              fill="#fff"
            />
            <path
              d="M2.5 10.833l13.334-5.555c.833-.347 1.667.486 1.32 1.32l-5.555 13.334c-.347.833-1.486.833-1.833 0l-2.222-5.555-5.555-2.222c-.833-.347-.833-1.486 0-1.833z"
              fill="#fff"
              fillOpacity=".3"
            />
            <path
              d="M2.5 10.833l5.555 2.222 2.222 5.555 5.555-13.334-13.334 5.555z"
              fill="#fff"
              fillOpacity=".7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default GeminiChat;
