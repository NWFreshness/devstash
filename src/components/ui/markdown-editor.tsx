"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(
    readOnly ? "preview" : "write"
  );

  function handleCopy() {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard.");
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-[#2d2d2d] px-3 py-2">
        <div className="flex items-center gap-1">
          {!readOnly && (
            <>
              <TabButton
                active={tab === "write"}
                onClick={() => setTab("write")}
              >
                Write
              </TabButton>
              <TabButton
                active={tab === "preview"}
                onClick={() => setTab("preview")}
              >
                Preview
              </TabButton>
            </>
          )}
          {readOnly && (
            <span className="text-xs text-white/40">Preview</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
          type="button"
        >
          <Copy className="size-3" />
          Copy
        </button>
      </div>

      {/* Body */}
      {tab === "write" && !readOnly ? (
        <Textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="markdown-editor-textarea min-h-[120px] max-h-[400px] resize-none rounded-none border-0 bg-[#1e1e1e] font-mono text-xs text-white/90 focus-visible:ring-0 focus-visible:ring-offset-0"
          placeholder="Write markdown..."
        />
      ) : (
        <div className="p-3">
          {value ? (
            <div className="markdown-preview">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-xs text-white/30">Nothing to preview.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-0.5 text-xs transition-colors ${
        active
          ? "bg-white/10 text-white/80"
          : "text-white/40 hover:bg-white/5 hover:text-white/60"
      }`}
    >
      {children}
    </button>
  );
}
