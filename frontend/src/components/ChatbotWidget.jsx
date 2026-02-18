import { useState } from "react";
import api from "../api/client";

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [log, setLog] = useState([]);

  const ask = async () => {
    if (!message.trim()) return;
    const userMsg = message;
    setLog((p) => [...p, { role: "You", text: userMsg }]);
    setMessage("");
    const { data } = await api.post("/ai/chatbot", { message: userMsg });
    setLog((p) => [...p, { role: "AI", text: data.reply }]);
  };

  if (!open) {
    return (
      <button className="btn-primary fixed bottom-3 right-3 z-40 text-sm sm:bottom-4 sm:right-4" onClick={() => setOpen(true)}>
        AI Chatbot
      </button>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-40 rounded-xl border bg-white p-3 shadow-xl dark:bg-slate-800 sm:bottom-4 sm:left-auto sm:right-4 sm:w-80">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold">Auction Assistant</h4>
        <button onClick={() => setOpen(false)}>x</button>
      </div>
      <div className="mb-2 h-52 overflow-y-auto rounded border p-2 text-sm">
        {log.map((item, idx) => (
          <p key={idx} className="mb-2">
            <span className="font-semibold">{item.role}:</span> {item.text}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="w-full rounded border p-2 text-black"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about auctions"
        />
        <button className="btn-primary px-3" onClick={ask}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotWidget;
