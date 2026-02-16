"use client";

import { useEffect, useState, useRef } from "react";

const lines = [
  { text: '$ curl -X POST https://hooks.ferryhook.io/in/src_a1b2c3 \\', delay: 0, type: "command" as const },
  { text: '    -H "Content-Type: application/json" \\', delay: 600, type: "command" as const },
  { text: `    -d '{"event": "payment.completed", "amount": 4999}'`, delay: 1200, type: "command" as const },
  { text: "", delay: 1800, type: "blank" as const },
  { text: '→ 200 OK  {"id": "evt_x7k2m9", "status": "received"}', delay: 2200, type: "response" as const },
  { text: "", delay: 2600, type: "blank" as const },
  { text: "→ Delivered to https://api.yourapp.com/webhooks in 142ms ✓", delay: 3200, type: "success" as const },
];

export function TerminalAnimation() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const currentLineRef = useRef(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let lineIdx = 0;

    function typeLine() {
      if (lineIdx >= lines.length) {
        setIsTyping(false);
        return;
      }

      setVisibleLines(lineIdx + 1);
      currentLineRef.current = lineIdx;

      const line = lines[lineIdx];
      if (line.type === "blank") {
        lineIdx++;
        setTimeout(typeLine, 300);
        return;
      }

      const len = line.text.length;
      let ci = 0;

      function typeChar() {
        if (ci <= len) {
          setCharIndex(ci);
          ci++;
          const speed = line.type === "command" ? 18 : 8;
          setTimeout(typeChar, speed);
        } else {
          lineIdx++;
          const nextDelay = lineIdx < lines.length
            ? lines[lineIdx].delay - line.delay - len * (line.type === "command" ? 18 : 8)
            : 0;
          setTimeout(typeLine, Math.max(nextDelay, 200));
        }
      }

      typeChar();
    }

    setTimeout(typeLine, 800);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-[#0a0f1e] shadow-2xl shadow-blue-900/10">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-slate-800/60 px-4 py-3">
        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
        <span className="ml-3 font-mono text-xs text-slate-600">terminal</span>
      </div>

      {/* Terminal body */}
      <div className="p-5 font-mono text-[13px] leading-relaxed sm:p-6 sm:text-sm">
        {lines.slice(0, visibleLines).map((line, i) => {
          if (line.type === "blank") return <div key={i} className="h-4" />;

          const isCurrentLine = i === currentLineRef.current && isTyping;
          const displayText = isCurrentLine
            ? line.text.slice(0, charIndex)
            : i < currentLineRef.current || !isTyping
              ? line.text
              : "";

          const colorClass =
            line.type === "response"
              ? "text-slate-400"
              : line.type === "success"
                ? "text-emerald-400"
                : "text-slate-300";

          return (
            <div key={i} className={`${colorClass} whitespace-pre-wrap break-all`}>
              {displayText}
              {isCurrentLine && <span className="terminal-cursor" />}
            </div>
          );
        })}
        {visibleLines === 0 && <span className="terminal-cursor text-slate-500" />}
      </div>
    </div>
  );
}
