import { useState } from "react";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsg = { role: "user", content: input };
    setMessages((m) => [...m, newMsg]);
    setLoading(true);
    try {
      const resp = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: input }),
      });
      const data = await resp.json();
      const reply = data.result || data.error || "(no response)";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", content: err.message }]);
    }
    setLoading(false);
    setInput("");
  };

  return (
    <div className="border p-4 rounded">
      <h2 className="text-xl font-semibold mb-2">AI Agent Chat</h2>
      <p className="text-sm text-gray-500 mb-2">
        Try asking things like "collectRealtimeData for RELIANCE.NS" or "analyzeCandlestick for TCS".
      </p>
      <div className="h-64 overflow-y-auto mb-2 space-y-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "text-right" : "text-left"}
          >
            <span
              className={
                "inline-block p-2 rounded " +
                (m.role === "user" ? "bg-blue-200" : "bg-gray-200")
              }
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-1 border p-1 mr-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask the agent..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-green-500 text-white px-3 py-1"
        >
          {loading ? "…" : "Send"}
        </button>
      </div>
    </div>
  );
}
