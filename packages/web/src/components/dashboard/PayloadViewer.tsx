"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { cn } from "@/lib/utils";

interface PayloadViewerProps {
  data: string;
  maxHeight?: string;
}

export function PayloadViewer({ data, maxHeight = "400px" }: PayloadViewerProps) {
  let parsed: unknown;
  try {
    parsed = JSON.parse(data);
  } catch {
    return (
      <div className="bg-slate-800 rounded-md p-3 overflow-auto" style={{ maxHeight }}>
        <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap">{data}</pre>
      </div>
    );
  }

  return (
    <div className="relative bg-slate-800 rounded-md overflow-auto" style={{ maxHeight }}>
      <div className="absolute top-2 right-2">
        <CopyButton value={JSON.stringify(parsed, null, 2)} />
      </div>
      <div className="p-3">
        <JsonNode value={parsed} depth={0} />
      </div>
    </div>
  );
}

function JsonNode({ value, depth }: { value: unknown; depth: number }) {
  const [expanded, setExpanded] = useState(depth < 2);

  if (value === null) {
    return <span className="text-xs font-mono text-slate-500">null</span>;
  }

  if (typeof value === "boolean") {
    return (
      <span className="text-xs font-mono text-amber-400">
        {String(value)}
      </span>
    );
  }

  if (typeof value === "number") {
    return <span className="text-xs font-mono text-blue-400">{value}</span>;
  }

  if (typeof value === "string") {
    return (
      <span className="text-xs font-mono text-emerald-400">
        &quot;{value}&quot;
      </span>
    );
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className="text-xs font-mono text-slate-500">[]</span>;
    }

    return (
      <span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-300 inline-flex items-center"
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
        {!expanded && (
          <span className="text-xs font-mono text-slate-500">
            [{value.length} items]
          </span>
        )}
        {expanded && (
          <span className="text-xs font-mono">
            {"["}
            <div className="ml-4">
              {value.map((item, i) => (
                <div key={i}>
                  <JsonNode value={item} depth={depth + 1} />
                  {i < value.length - 1 && (
                    <span className="text-slate-600">,</span>
                  )}
                </div>
              ))}
            </div>
            {"]"}
          </span>
        )}
      </span>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      return <span className="text-xs font-mono text-slate-500">{"{}"}</span>;
    }

    return (
      <span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-500 hover:text-slate-300 inline-flex items-center"
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </button>
        {!expanded && (
          <span className="text-xs font-mono text-slate-500">
            {"{"}
            {entries.length} keys
            {"}"}
          </span>
        )}
        {expanded && (
          <span className="text-xs font-mono">
            {"{"}
            <div className="ml-4">
              {entries.map(([key, val], i) => (
                <div key={key}>
                  <span className="text-purple-400">&quot;{key}&quot;</span>
                  <span className="text-slate-500">: </span>
                  <JsonNode value={val} depth={depth + 1} />
                  {i < entries.length - 1 && (
                    <span className="text-slate-600">,</span>
                  )}
                </div>
              ))}
            </div>
            {"}"}
          </span>
        )}
      </span>
    );
  }

  return <span className="text-xs font-mono text-slate-300">{String(value)}</span>;
}
