"use client";

import { Copy } from "lucide-react";
import MonacoEditor, { type BeforeMount } from "@monaco-editor/react";
import { toast } from "sonner";
import MonokaiTheme from "@/lib/monaco-themes/monokai.json";
import GitHubDarkTheme from "@/lib/monaco-themes/github-dark.json";
import type { editor } from "monaco-editor";
import { useEditorPreferences } from "@/contexts/editor-preferences-context";

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
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
}: CodeEditorProps) {
  const prefs = useEditorPreferences();

  function handleCopy() {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard.");
  }

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#1e1e1e]">
      {/* macOS-style header */}
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2">
          {language && language !== "plaintext" && (
            <span className="text-xs text-white/40">{language}</span>
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

      {/* Monaco Editor */}
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
    </div>
  );
}
