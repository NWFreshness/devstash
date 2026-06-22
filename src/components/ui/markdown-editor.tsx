"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy, Crown, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Textarea } from "@/components/ui/textarea";
import { optimizePrompt } from "@/actions/ai";

interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  isPro?: boolean;
  itemTitle?: string;
  typeSlug?: string;
  onAcceptOptimization?: (optimized: string) => void;
}

export function MarkdownEditor({
  value,
  onChange,
  readOnly = false,
  isPro = false,
  itemTitle,
  typeSlug,
  onAcceptOptimization,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">(
    readOnly ? "preview" : "write"
  );
  const [optimized, setOptimized] = useState<string | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const canOptimize = readOnly && typeSlug === "prompt";

  async function handleOptimize() {
    if (!isPro || !canOptimize) return;
    setOptimizing(true);
    const result = await optimizePrompt({
      title: itemTitle ?? "Untitled",
      content: value,
      typeSlug: "prompt",
    });
    setOptimizing(false);
    if (result.success) {
      setOptimized(result.data);
    } else {
      toast.error(result.error);
    }
  }

  function handleAccept() {
    if (!optimized) return;
    onAcceptOptimization?.(optimized);
    setOptimized(null);
  }

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
        <div className="flex items-center gap-2">
          {canOptimize && (
            isPro ? (
              <button
                onClick={handleOptimize}
                disabled={optimizing}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 disabled:opacity-50"
                type="button"
              >
                {optimizing ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                Optimize
              </button>
            ) : (
              <span
                className="flex cursor-default items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/25"
                title="AI features require Pro subscription"
              >
                <Crown className="size-3" />
                Optimize
              </span>
            )
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
            type="button"
          >
            <Copy className="size-3" />
            Copy
          </button>
        </div>
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

      {optimized && (
        <div className="border-t border-white/10">
          <div className="flex items-center justify-between bg-[#2d2d2d] px-3 py-1.5">
            <span className="flex items-center gap-1 text-xs text-white/60">
              <Sparkles className="size-3 text-purple-400" />
              Optimized
            </span>
            <button
              onClick={() => setOptimized(null)}
              className="rounded p-0.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
          <div className="p-3">
            <div className="markdown-preview text-white/80">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{optimized}</ReactMarkdown>
            </div>
          </div>
          <div className="flex justify-end gap-2 border-t border-white/10 px-3 py-2">
            <button
              onClick={() => setOptimized(null)}
              className="rounded px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
              type="button"
            >
              Dismiss
            </button>
            <button
              onClick={handleAccept}
              className="flex items-center gap-1 rounded bg-purple-600/80 px-2 py-1 text-xs text-white transition-colors hover:bg-purple-600"
              type="button"
            >
              <Check className="size-3" />
              Accept
            </button>
          </div>
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
