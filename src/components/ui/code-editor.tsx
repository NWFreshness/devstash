"use client";

import { useState } from "react";
import { Copy, Crown, Loader2, Sparkles } from "lucide-react";
import MonacoEditor, { type BeforeMount } from "@monaco-editor/react";
import { toast } from "sonner";
import MonokaiTheme from "@/lib/monaco-themes/monokai.json";
import GitHubDarkTheme from "@/lib/monaco-themes/github-dark.json";
import type { editor } from "monaco-editor";
import { useEditorPreferences } from "@/contexts/editor-preferences-context";
import { explainCode } from "@/actions/ai";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  isPro?: boolean;
  itemTitle?: string;
  typeSlug?: string;
}

const beforeMount: BeforeMount = (monaco) => {
  monaco.editor.defineTheme("monokai", MonokaiTheme as editor.IStandaloneThemeData);
  monaco.editor.defineTheme("github-dark", GitHubDarkTheme as editor.IStandaloneThemeData);
};

export function CodeEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
  isPro = false,
  itemTitle,
  typeSlug,
}: CodeEditorProps) {
  const prefs = useEditorPreferences();
  const [tab, setTab] = useState<"code" | "explain">("code");
  const [explanation, setExplanation] = useState<string | null>(null);
  const [explaining, setExplaining] = useState(false);

  const canExplain =
    readOnly &&
    (typeSlug === "snippet" || typeSlug === "command");

  function handleCopy() {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard.");
  }

  async function handleExplain() {
    if (!isPro) return;
    if (explanation) {
      setTab("explain");
      return;
    }
    setExplaining(true);
    const result = await explainCode({
      title: itemTitle ?? "Untitled",
      content: value,
      typeSlug: typeSlug as "snippet" | "command",
      language,
    });
    setExplaining(false);
    if (result.success) {
      setExplanation(result.data);
      setTab("explain");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      {/* macOS-style header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
          {explanation && (
            <div className="ml-2 flex items-center gap-0.5">
              <button
                onClick={() => setTab("code")}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  tab === "code"
                    ? "bg-white/15 text-white/80"
                    : "text-white/40 hover:text-white/60"
                }`}
                type="button"
              >
                Code
              </button>
              <button
                onClick={() => setTab("explain")}
                className={`rounded px-2 py-0.5 text-xs transition-colors ${
                  tab === "explain"
                    ? "bg-white/15 text-white/80"
                    : "text-white/40 hover:text-white/60"
                }`}
                type="button"
              >
                Explain
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {language && language !== "plaintext" && (
            <span className="text-xs text-white/40">{language}</span>
          )}
          {canExplain && (
            isPro ? (
              <button
                onClick={handleExplain}
                disabled={explaining}
                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/40 transition-colors hover:bg-white/10 hover:text-white/70 disabled:opacity-50"
                type="button"
              >
                {explaining ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Sparkles className="size-3" />
                )}
                Explain
              </button>
            ) : (
              <span
                className="flex cursor-default items-center gap-1 rounded px-1.5 py-0.5 text-xs text-white/25"
                title="AI features require Pro subscription"
              >
                <Crown className="size-3" />
                Explain
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

      {/* Content */}
      {tab === "explain" && explanation ? (
        <div className="p-4">
          <MarkdownEditor value={explanation} readOnly />
        </div>
      ) : (
        <MonacoEditor
          value={value}
          language={language}
          theme={prefs.theme}
          beforeMount={beforeMount}
          onChange={(val) => onChange?.(val ?? "")}
          options={{
            readOnly,
            fontSize: prefs.fontSize,
            tabSize: prefs.tabSize,
            fontFamily: "var(--font-mono, monospace)",
            minimap: { enabled: prefs.minimap },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            folding: false,
            wordWrap: prefs.wordWrap ? "on" : "off",
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
              verticalSliderSize: 6,
              horizontalSliderSize: 6,
            },
            overviewRulerLanes: 0,
            renderLineHighlight: readOnly ? "none" : "line",
            contextmenu: false,
          }}
          className="max-h-[400px]"
          height="auto"
          onMount={(editor) => {
            const updateHeight = () => {
              const contentHeight = Math.min(editor.getContentHeight(), 400);
              editor.getContainerDomNode().style.height = `${contentHeight}px`;
              editor.layout();
            };
            editor.onDidContentSizeChange(updateHeight);
            updateHeight();
          }}
        />
      )}
    </div>
  );
}
