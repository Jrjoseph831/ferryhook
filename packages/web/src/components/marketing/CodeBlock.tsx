"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

function tokenize(code: string, language: string) {
  const lines = code.split("\n");
  return lines.map((line) => {
    const tokens: { text: string; className: string }[] = [];

    if (language === "bash" || language === "shell") {
      if (line.trimStart().startsWith("#")) {
        tokens.push({ text: line, className: "text-slate-500" });
        return tokens;
      }
      if (line.trimStart().startsWith("$")) {
        tokens.push({ text: "$ ", className: "text-emerald-400" });
        const rest = line.replace(/^\s*\$\s*/, "");
        tokenizeBashCommand(rest, tokens);
        return tokens;
      }
      if (line.trimStart().startsWith("→")) {
        tokens.push({ text: line, className: "text-slate-400" });
        return tokens;
      }
    }

    if (language === "json") {
      tokenizeJson(line, tokens);
      return tokens;
    }

    if (language === "typescript" || language === "ts" || language === "javascript" || language === "js") {
      tokenizeTS(line, tokens);
      return tokens;
    }

    tokens.push({ text: line, className: "text-slate-300" });
    return tokens;
  });
}

function tokenizeBashCommand(line: string, tokens: { text: string; className: string }[]) {
  const parts = line.split(/(\s+)/);
  let isFirst = true;
  for (const part of parts) {
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, className: "" });
      continue;
    }
    if (isFirst) {
      tokens.push({ text: part, className: "text-blue-400" });
      isFirst = false;
    } else if (part.startsWith("-")) {
      tokens.push({ text: part, className: "text-amber-400" });
    } else if (part.startsWith("'") || part.startsWith('"')) {
      tokens.push({ text: part, className: "text-emerald-300" });
    } else if (part.startsWith("http")) {
      tokens.push({ text: part, className: "text-cyan-300" });
    } else if (part === "\\") {
      tokens.push({ text: part, className: "text-slate-600" });
    } else {
      tokens.push({ text: part, className: "text-slate-300" });
    }
  }
}

function tokenizeJson(line: string, tokens: { text: string; className: string }[]) {
  const regex = /("(?:[^"\\]|\\.)*")(\s*:\s*)?|(\d+\.?\d*)|(\btrue\b|\bfalse\b|\bnull\b)|([{}[\],])|(\s+)|([^"{}[\],:\s]+)/g;
  let match;
  while ((match = regex.exec(line)) !== null) {
    if (match[1]) {
      if (match[2]) {
        tokens.push({ text: match[1], className: "text-blue-300" });
        tokens.push({ text: match[2], className: "text-slate-500" });
      } else {
        tokens.push({ text: match[1], className: "text-emerald-300" });
      }
    } else if (match[3]) {
      tokens.push({ text: match[3], className: "text-amber-300" });
    } else if (match[4]) {
      tokens.push({ text: match[4], className: "text-purple-300" });
    } else if (match[5]) {
      tokens.push({ text: match[5], className: "text-slate-500" });
    } else if (match[6]) {
      tokens.push({ text: match[6], className: "" });
    } else if (match[7]) {
      tokens.push({ text: match[7], className: "text-slate-300" });
    }
  }
}

function tokenizeTS(line: string, tokens: { text: string; className: string }[]) {
  const keywords = /\b(const|let|var|function|return|if|else|import|from|export|async|await|new|class|interface|type|extends|implements)\b/g;
  const strings = /(["'`])((?:[^\\]|\\.)*?)\1/g;
  const comments = /(\/\/.*$)/;

  const commentMatch = comments.exec(line);
  if (commentMatch && commentMatch.index === 0) {
    tokens.push({ text: line, className: "text-slate-500 italic" });
    return;
  }

  let remaining = line;
  let cursor = 0;

  const allMatches: { index: number; length: number; text: string; className: string }[] = [];

  let m;
  while ((m = keywords.exec(line)) !== null) {
    allMatches.push({ index: m.index, length: m[0].length, text: m[0], className: "text-purple-400" });
  }

  while ((m = strings.exec(line)) !== null) {
    allMatches.push({ index: m.index, length: m[0].length, text: m[0], className: "text-emerald-300" });
  }

  if (commentMatch) {
    allMatches.push({ index: commentMatch.index, length: commentMatch[0].length, text: commentMatch[0], className: "text-slate-500 italic" });
  }

  allMatches.sort((a, b) => a.index - b.index);

  for (const match of allMatches) {
    if (match.index < cursor) continue;
    if (match.index > cursor) {
      tokens.push({ text: remaining.slice(cursor, match.index), className: "text-slate-300" });
    }
    tokens.push({ text: match.text, className: match.className });
    cursor = match.index + match.length;
  }

  if (cursor < line.length) {
    tokens.push({ text: remaining.slice(cursor), className: "text-slate-300" });
  }
}

export function CodeBlock({ code, language = "bash", filename, showLineNumbers }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tokenized = tokenize(code, language);

  return (
    <div className="group relative rounded-lg border border-slate-800 bg-[#0c1222] overflow-hidden">
      {filename && (
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2 text-xs text-slate-500">
          <span className="font-mono">{filename}</span>
        </div>
      )}
      <div className="relative">
        <button
          onClick={handleCopy}
          className="absolute right-3 top-3 z-10 rounded-md border border-slate-700 bg-slate-800/80 p-1.5 text-slate-400 opacity-0 backdrop-blur transition-all hover:text-slate-200 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code>
            {tokenized.map((line, i) => (
              <span key={i} className="block">
                {showLineNumbers && (
                  <span className="mr-4 inline-block w-6 text-right text-slate-700 select-none">{i + 1}</span>
                )}
                {line.map((token, j) => (
                  <span key={j} className={token.className}>{token.text}</span>
                ))}
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
