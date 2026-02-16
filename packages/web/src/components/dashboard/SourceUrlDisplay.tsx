"use client";

import { CopyButton } from "./CopyButton";
import { toast } from "sonner";

interface SourceUrlDisplayProps {
  url: string;
}

export function SourceUrlDisplay({ url }: SourceUrlDisplayProps) {
  return (
    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-md px-3 py-2">
      <code className="flex-1 text-sm font-mono text-blue-400 truncate">
        {url}
      </code>
      <CopyButton value={url} />
    </div>
  );
}
